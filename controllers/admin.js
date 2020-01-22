const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Stevans Auto Spares: Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        description: description,
        price: price
      },
      errorMessage: 'Attached file is not an image!',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Stevans Auto Spares: Add Product',
      path: '/admin/add-product',
      editing:false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  const imageUrl = image.path;

  const product = new Product({
    title: title, 
    imageUrl: imageUrl, 
    description: description,
    price: price,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('CREATED PRODUCT!');
      res.redirect('/admin/products')
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Stevans Auto Spares: Add Product',
      //   path: '/admin/edit-product',
      //   editing:false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     image: image,
      //     description: description,
      //     price: price,
      //   },
      //   errorMessage:'Database Operation Failed! Please try again. ',
      //   validationErrors: []
      // });
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
      
  };

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedDesc = req.body.description;
  const updatedPrice = req.body.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Stevans Auto Spares: Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        _id: prodId,
        title: updatedTitle,
        description: updatedDesc,
        price: updatedPrice
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  Product.findById(prodId)
  .then(product => {
    if (product.userId.toString() !== req.user._id.toString() ) {
      return res.redirect('/');
    }
    product.title = updatedTitle;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    product.description = updatedDesc;
    product.price = updatedPrice;
    product.save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
  }) 
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title price - _id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Error! Product Not Found!'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({
        message: 'Success!'
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Deleting Product Failed!'
      });
    });
};