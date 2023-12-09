const Products = require("../models/products_model");

const allProducts = async(req, res) => {

    try {
        const products_arr = await Products.find()
        if(products_arr?.length > 0){
            res.status(200).json(products_arr)
        }
      
        res.status(200).json([])
    } catch (error) {
        
        res.status(500).send("Server error while getting products")
    }
}

module.exports={
    allProducts
}