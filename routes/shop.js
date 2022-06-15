const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is_auth");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.get("/checkout/success", isAuth, shopController.postOrder);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/orders", isAuth, shopController.getOrders);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart_delete_item", isAuth, shopController.postCartDeleteProduct);

router.post("/create_order", isAuth, shopController.postOrder);

router.get("/session", isAuth, shopController.createCheckoutSession);

exports.routes = router;
