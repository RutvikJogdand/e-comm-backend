const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensuring the price is non-negative
  },
  stock: {
    type: Number,
    required: true,
  },
  product_image: {
    type: String,
    required: true,
  },
}, {
  versionKey: false,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
