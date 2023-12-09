const Users = require("../models/users_model")
const Products = require("../models/products_model");
const mongoose = require('mongoose');

function isValidDiscountCode(code) {

    if (!code.startsWith('GROCERY')) {
        return false;
    }

    const numberPart = parseInt(code.substring('GROCERY'.length), 10);
    return numberPart >= 100 && numberPart <= 110;
}

const generatedCodes = new Set();
const maxCodes = 110;
const minCodes = 100;

function generateUniqueDiscountCode() {
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
                    no_of_orders: user.no_of_orders + 1,
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
        console.log(error);
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        res.status(500).send("Error updating products");
    }
};

const checkout = async(req, res) => {
    const {totalSum, user_id, discount_code} = req.body;

    const user = await Users.findOne({id: user_id})

    if(!user){
        res.status(404).send("User not found")
    }

    const discount = user.no_of_orders % 5 === 0;
    const discountTotal = discount ? totalSum * 0.1 : totalSum;

    if(discount_code === null || discount_code === ''){
        res.send("You have not applied any discount");
    }
    if (discount_code && !isValidDiscountCode(discount_code)) {
        res.send("Invalid Discount code");
    }
    if(discount_code && isValidDiscountCode(discount_code) && !discount){
        res.send("Not eligible for discount yet");
    }
    if(discount_code && isValidDiscountCode(discount_code) && discount){
        await Users.update({id: user_id},{$set:{total: discountTotal}});

        user.total = discountTotal;

        res.send("Discount Code Applied");
    }  
}

const generateOneDiscountCode = async(req, res) => {
    const {user_id} = req.body

    try {
        const user = await Users.findOne({id: user_id})

        if(!user){
            res.status(404).send("User not found")
        }

        if(user.no_of_orders % 5 === 0){
            const discountCode = await generateUniqueDiscountCode();

            res.status(200).json(discountCode);
        }
        
    } catch (error) {
        res.status(500).send("Something went wrong while fetching discount code");
    }
}

function generateDiscountCodes(start = 100, end = 110) { //To be called only when user is eligible for discount
    const codes = [];
    for (let i = start; i <= end; i++) {
        codes.push('GROCERY' + i);
    }
    return codes;
}

const getUserDetailsForAdmin = async(req, res) => {
    const {user_id} = req.body;

    const list_of_discount_codes = await generateDiscountCodes()
    try {

        if(!user_id){
            res.status(404).send("This user does not exist");
        }
        const user = await Users.findOne({id: user_id});

        if(!user){
            res.status(404).send("User not found");
        }

        res.send(200).json({
            items_purchased: user.cart.length,
            totalAmt: user.total,
            discountedAmt: user.no_of_orders % 5 === 0? (user.total*0.1) : user.total,
            list_of_discount_codes: list_of_discount_codes
        })
        
    } catch (error) {
        res.status(500).send("Server error while fetching user details");
    }
}

module.exports = {
    findUser,
    addToCart,
    checkout
}