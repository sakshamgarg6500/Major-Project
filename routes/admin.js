const express = require('express');
const { body } = require('express-validator/check');

const router = express.Router(); //this Router is like a tiny express app linked to upper express app

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is_auth');

//'router' is same as 'app'
router.get('/add_product', isAuth, adminController.getAddProduct); //this will handle only a 'get' request; requests are parsed left to right

//path name is same but request handling method is different
router.post('/add_product', 
    [
        body('title').isString().isLength({min:3}).trim(),
        body('image').isURL(),
        body('price').isNumeric(),
        body('author').isLength({min:5})
    ]
, isAuth, adminController.postAddProduct); //this will handle only a 'post' request

router.get('/product_list', isAuth, adminController.getProducts);

router.get('/edit_product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit_product',
    [
        body('title').isString().isLength({min:3}).trim(),
        body('image').isURL(),
        body('price').isNumeric(),
        body('author').isLength({min:5})
    ]
, isAuth, adminController.postEditProduct);

router.post('/delete_product', isAuth, adminController.postDeleteProduct);

exports.routes = router;