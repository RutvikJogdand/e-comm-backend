const Users = require("../models/users_model")
const Products = require("../models/products_model");
const mongoose = require('mongoose');

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
                update: { $inc: { stock: -item.quantity } }
            }
        }));
        const updatedProducts = await Products.bulkWrite(productUpdates, { session });
        if (productUpdates.length !== updatedProducts.matchedCount && productUpdates.length !== updatedProducts.modifiedCount ) {
            throw new Error("Error updating cart with one or more products");
        }

        const totalSum = products_arr.reduce((accumulator, product) => {
            return accumulator + product.price * product.quantity;
        }, 0);

        const discount = (user.no_of_orders + 1) % 5 === 0;
        const discountTotal = discount ? totalSum * 0.1 : totalSum;

        // Update the user with the products in the cart and ordersHistory
        await Users.updateOne(
            { id: user_id },
            {
                $set: {
                    cart: [...products_arr],
                    no_of_orders: user.no_of_orders + 1,
                    total: discountTotal,
                    ordersHistory: [
                        ...user.ordersHistory,
                        { products: products_arr, totalSum: totalSum, discount: discount }
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
        console.error(error);
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        res.status(500).send("Error updating products");
    }
};

module.exports = {
    findUser,
    addToCart
}