const Product = require("../models/product");
const Order = require("../models/order");

const stripe = require("stripe")(
	"sk_test_51JgPrNSDAYyoQR1x4AG2koiSErxAMPHMhi8lGACsRzWNCoJfN1dDBdnMygVbAos2JsyT8K5zpr0BFH80AQXwYBac00KNbp8NeB"
);

//FOR SHOP [Home Page]
exports.getIndex = (req, res, next) => {
	Product.find()
		.then((products) =>
			res.render("./shop/index", {
				prods: products,
				pageTitle: "Shop",
				path: "/",
			})
		)
		.catch((err) => console.log(err));
};

//FOR PRODUCTS
exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) =>
			res.render("./shop/product_list", {
				prods: products,
				pageTitle: "All Products",
				path: "/products",
			})
		)
		.catch((err) => console.log(err));
};

//FOR DETAILS OF A PRODUCT
exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId) //here [findById] method is provided by mongoose
		.then((product) =>
			res.render("shop/product_detail", {
				product: product,
				pageTitle: product.title,
				path: "/products",
			})
		)
		.catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
	req.user
		.populate("cart.items.productId") //[populate] function to fetch data at [cart.items.productId]
		.execPopulate() //to get a promise
		.then((user) => {
			res.render("./shop/cart", {
				pageTitle: "Your Cart",
				path: "/cart",
				products: user.cart.items,
			});
			// console.log(user.cart.items);
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then(() => res.redirect("/cart"))
		.catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId) //we need an additonal method and not [findByIdAndRemove] because we are not deleting the entire user but modifying the document
		.then(() => res.redirect("/cart"))
		.catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
	let products;
	let total = 0;
	req.user
		.populate("cart.items.productId")
		.execPopulate()
		.then((user) => {
			products = user.cart.items;
			products.forEach((p) => (total += p.productId.price * p.quantity));
		})
		.then(() => {
			res.render("shop/checkout", {
				path: "/checkout",
				pageTitle: "Checkout",
				products: products,
				totalSum: total,
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.execPopulate()
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return { product: { ...i.productId._doc }, quantity: i.quantity };
			});
			const order = new Order({
				products: products,
				user: {
					email: req.user.email,
					userId: req.user._id,
				},
			});
			req.user.clearCart();
			return order.save();
		})
		.then(() => res.redirect("/orders"))
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
	Order.find({ "user.userId": req.user._id })
		.then((orders) =>
			res.render("./shop/orders", {
				pageTitle: "Your Orders",
				path: "/orders",
				orders: orders,
			})
		)
		.catch((err) => console.log(err));
};

exports.createCheckoutSession = (req, res) => {
	console.log("In createCheckoutSession");
	let products;
	req.user
		.populate("cart.items.productId")
		.execPopulate()
		.then((user) => {
			products = user.cart.items;
		})
		.then(async () => {
			const session = await stripe.checkout.sessions.create({
				line_items: products.map((p) => {
					return {
						name: p.productId.title,
						description: p.productId.description,
						amount: p.productId.price * 100,
						currency: "inr",
						quantity: p.quantity,
					};
				}),
				payment_method_types: ["card"],
				mode: "payment",
				success_url: "http://localhost:3000/checkout/success",
				cancel_url: "http://localhost:3000/checkout/cancel",
			});
			res.redirect(303, session.url);
		});
};
