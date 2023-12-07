const Users = require("../models/users_model")
const Products = require("../models/products_model");

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
    const { user_id, products_arr } = req.body; //get the parameters sent by the frontend from the request body
    try {
        const user = await Users.findOne({ //finds the user based on id
          id: user_id,
        }).then(res => res).catch(err => err);

        if(!user){ //send a error message in case user is not found
            res.status(404).send("User not found")
            return
        }

        const totalSum = products_arr.reduce((accumulator, product) => { //get total
            console.log('inside adder')
            return accumulator +(product.price * product.quantity);
          }, 0); 

        if((user.no_of_orders + 1)%5 === 0){ // check if order number is divisble by 5
            await Users.updateOne( // update the concerned user with the products in his/her cart
                {id: user_id},
                {$set: {cart: [...user.cart, ...products_arr], no_of_orders: user.no_of_orders + 1, total: totalSum*0.1}} // give discount of 10% for every 5th order
            )
        }
        if((user.no_of_orders + 1)%5 !== 0){
            await Users.updateOne( // update the concerned user with the products in his/her cart
                {id: user_id},
                {$set: {cart: [...user.cart, ...products_arr], no_of_orders: user.no_of_orders + 1, total: totalSum}}
            )
        }

        for (const item of products_arr) { //looping through the array of products added to the cart by the user
          const { product_id, quantity } = item; //destructuring the values needed from each product in the cart
    
            // Updating the quantity of the specified product:
            await Products.updateOne(
            { product_id: product_id }, //finding each product by id
                { $inc: { stock: -quantity }} // doing stock = stock -quantity for each product
            );
        }
        res.status(200).send('Products updated successfully'); //success message 
        
    } catch (error) {
        res.status(500).send("Error updating products") //error message
    }
        
};

module.exports = {
    findUser,
    addToCart
}