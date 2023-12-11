const Users = require("../models/users_model")
const Products = require("../models/products_model");
const mongoose = require('mongoose');

async function isValidDiscountCode(code) { //Checks if the discount code is valid

    if (!code.startsWith('GROCERY')) {
        return false;
    }

    const numberPart = parseInt(code.substring('GROCERY'.length), 10);
    return numberPart >= 100 && numberPart <= 110;
}

const generatedCodes = new Set();
const maxCodes = 110;
const minCodes = 100;

function generateUniqueDiscountCode() { //Generates a unique discount code based on a set pattern
    if (generatedCodes.size >= (maxCodes - minCodes + 1)) {
        throw new Error("All discount codes have been generated");
    }

    let randomCode;
    do {
        randomCode = Math.floor(Math.random() * (maxCodes - minCodes + 1)) + minCodes;
    } while (generatedCodes.has(randomCode));

    generatedCodes.add(randomCode);
    return "GROCERY" + randomCode;
}

const findUser = async (req, res) => {
    const {user_id} = req.query
    try {
        const user = await Users.findOne({id: user_id}).then(res => res).catch(err => err) //find one user and return it
        if(!user){
            res.status(404).send("User not found")
        }
        res.status(200).json(user)

    } catch (error) {
        res.status(500).send("Error finding user. This is a server issue.")
    }
}

const addToCart = async (req, res) => {
    const { user_id, products_arr } = req.body;

    const session = await mongoose.startSession(); // This will help keep consistency. If any operation fails within this query then no changes will happen anywhere
    session.startTransaction();

    try {
        const user = await Users.findOne({ id: user_id }).session(session); //important to add the session in each query to keep track of if it fails anywhere

        if (!user) {
            res.status(404).send("User not found");
            return;
        }

        for (const item of products_arr) {
            const product = await Products.findOne({ product_id: item.product_id }).session(session);

            if(!product){
                res.status(400).send("Error updating cart with one or more products because a product you have selected might not exist");
                return
            }
            if (product && product.stock < item.quantity) {
                // Abort the transaction and respond with an error
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send(`Insufficient stock for product ${item.product_id}`);
            }
        }

        const productUpdates = products_arr.map(item => ({ //getting an array of required updates ready. Update each product's quantity with reference from user's cart
            updateOne: {
                filter: { product_id: item.product_id },
                update: { $inc: { stock: Number(-item.quantity) } }
            }
        }));
        const updatedProducts = await Products.bulkWrite(productUpdates, { session });
        if (productUpdates.length !== updatedProducts.matchedCount && productUpdates.length !== updatedProducts.modifiedCount ) {
            res.status(400).send("Error updating cart with one or more products because a product you have selected might not exist");
        }

        const totalSum = products_arr.reduce((accumulator, product) => {
            return accumulator + product.price * product.quantity;
        }, 0);

        // Update the user with the products in the cart and ordersHistory
        await Users.updateOne(
            { id: user_id },
            {
                $set: {
                    cart: [...products_arr],
                    no_of_orders: user.no_of_orders,
                    total: totalSum,
                    ordersHistory: [
                        ...user.ordersHistory,
                        { products: products_arr, totalSum: totalSum }
                    ]
                }
            },
            { session }
        );

        // If everything is successful, commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).send('Products updated successfully');
    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        res.status(500).send("Error updating products");
    }
};

const checkout = async(req, res) => {
    const {user_id, discount_code} = req.body;

    try {  
        const user = await Users.findOne({id: user_id})
    
        if(!user){
            res.status(404).send("User not found") //No user found
            return
        }
        if(user && user.cart.length === 0){
            res.status(400).send("Empty Cart")
            return
        }
        if(user && discount_code === ''){
            await Users.updateOne({id: user_id},{$set:{no_of_orders: user.no_of_orders + 1}});
            res.status(200).json({
                message: "No discount applied", //If no discount code is recieved from the backend
                data: user
            })
            return 
        }
        
        const NoOfOrders = user.no_of_orders + 1
        const discount = (NoOfOrders) % 5 === 0;
        const discountTotal = discount ? user.total -( user.total * 0.1) : user.total;
    
        const isDiscount = await isValidDiscountCode(discount_code)
        if (discount_code && !isDiscount) { //if discount code is provided but not valid
            await Users.updateOne({id: user_id},{$set:{total: discountTotal, no_of_orders: user.no_of_orders + 1}});
            res.status(200).json({
                message: "Invalid Discount code",
                data: user
            });
            return
        }
        if(discount_code && !isDiscount && discount){ //discount code provided, its not valid and user is eligible for discount
            await Users.updateOne({id: user_id},{$set:{total: discountTotal, no_of_orders: user.no_of_orders + 1}});
            res.status(200).json({
                message: "Eligible for discount but no discount code applied",
                data: user
            })
            return
        }
        if(discount_code && isDiscount && !discount){ //discount code provided, its not valid and user is not eligible for discount
            await Users.updateOne({id: user_id},{$set:{total: discountTotal, no_of_orders: user.no_of_orders + 1}});
            res.status(200).json({
                message: "Not eligible for discount yet",
                data: user
            });
            return
        }
        if(discount_code && isDiscount && discount){ //discount code provided, its valid and user is eligible for discount
            console.log("is eligible")
            await Users.updateOne({id: user_id},{$set:{total: discountTotal, no_of_orders: user.no_of_orders + 1}});
            const updatedUser = await Users.findOne({id: user_id}).select("id first_name last_name email gender cart no_of_orders total ordersHistory -_id") //Send all parameters except _id
         
            console.log("updated user", updatedUser)
            res.status(200).json({
                message: "Updated total amount",
                data: updatedUser
            });
            return
        }  
    } catch (error) {
        res.status(500).send("Server error while checkout");
        return
    }
}

const generateOneDiscountCode = async(req, res) => { //discount code send to the user on request. Eligibilty checked before
    const {user_id} = req.body

    try {
        const user = await Users.findOne({id: user_id})
        
        if(!user){
            res.status(404).send("User not found")
            return
        }

        if(user && user.cart.length === 0 ){
            res.status(400).send("Empty Cart")
            return
        }

        if(user && user.no_of_orders === 0){
            res.status(400).send("User has not checked out yet")
            return
        }

        if(user && user.no_of_orders % 5 === 0){
            const discountCode = await generateUniqueDiscountCode();

            res.status(200).json(discountCode);
            return
        }

    } catch (error) {
        res.status(500).send("Something went wrong while fetching discount code");
    }
}

async function generateDiscountCodes(start = 100, end = 110) { //Generates all discount codes
    const codes = [];
    for (let i = start; i <= end; i++) {
        codes.push('GROCERY' + i);
    }
    return codes;
}

const getUserDetailsForAdmin = async(req, res) => {
    const {user_id} = req.body;

    const list_of_discount_codes = await generateDiscountCodes() //gets list of all available discount code for admin to check
    try {
        const user = await Users.findOne({id: user_id});

        if(!user){
            res.status(404).send("User not found");
            return
        }

        res.status(200).json({
           data: {
            items_purchased: user.cart.length,
            totalAmt: user.total,
            discountedAmt: user.no_of_orders % 5 === 0? (user.total*0.1) : user.total,
            list_of_discount_codes: list_of_discount_codes
            }
        })

        return
        
    } catch (error) {
        res.status(500).send("Server error while fetching user details");
    }
}

module.exports = {
    findUser,
    addToCart,
    checkout,
    generateOneDiscountCode,
    getUserDetailsForAdmin,
    isValidDiscountCode,
    generateDiscountCodes
}