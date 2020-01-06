const path =require('path');
const express = require('express');

const productsController = require('../controllers/products');

const router = express.Router();

const products = [];

router.get('/add-product', productsController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', productsController.postAddProduct);

module.exports = router;