const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Stevans Auto Spares: Our Products',
            path: '/products'
        });
    });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Stevans Auto Spares',
            path: '/'
        });
    });
};

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        pageTitle: 'Stevans Auto Spares: My Cart',
        path: '/cart'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Stevans Auto Spares: Checkout',
        path: '/checkout'
    });
};