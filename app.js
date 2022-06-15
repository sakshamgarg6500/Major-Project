const path = require("path"); //node core module

const express = require("express"); //this exports a function //third party packages
const bodyParser = require("body-parser"); //npm install --save body-parser

const app = express(); //this initializes an object

app.set("view engine", "pug"); //setting the templating engine
app.set("views", "views"); //templating engine folder

const adminRoutes = require("./routes/admin"); //importing our own routes file
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

const mongoose = require("mongoose");
const session = require("express-session"); //importing third party package
const csrf = require("csurf"); //importing csurf package
const flash = require("connect-flash");
const MongoDBStore = require("connect-mongodb-session")(session); //third party package to help us store session in the database to which we pass our [session]
// [MongoDBStore] yields a constructor function

const csrfProtection = csrf();

const User = require("./models/user"); //importing the user model

const MONGODB_URI =
	"mongodb+srv://saksham:hellcat@cluster0.0o0tx.mongodb.net/test";

const store = new MongoDBStore({
	uri: MONGODB_URI, //on which database to your session data
	collection: "sessions",
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //anything that tries to find a css file will automatically come into this public folder

//we initialize the session middleware when we start up our server, so that the session can be used for every incoming request
app.use(
	session({
		secret: "my secret",
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
//secret: the string which will be encrypted
//resave: the session will not be saved for every request, instead it will only be saved whenever there is some change in the session
//saveUnitialized also means the same as resave
//store: where to store session data
//[session] middleware sets a cookie by itself

app.use(csrfProtection); //csrfProtection middleware declared after initialization of session because it would use our session
//csrf tokens are looked in POST requests as we change data via POST requests
app.use(flash()); //[flash] function can be used after intitialization of a session

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn; //these fields will be rendered with every view
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	// throw new Error('Sync Dummy'); //outside async code we can just throw the error
	if (!req.session.user) return next();

	User.findById(req.session.user._id) //obtaining user from the database
		.then((user) => {
			if (!user)
				//if the user is deleted from the database in between
				return next();
			//creating [User] object and pasing it to the request
			req.user = user;
			next();
		})
		.catch((err) => {
			next(new Error(err)); //inside of async codes, we need to use next
		});
});

app.use("/admin", adminRoutes.routes); //url starting with 'admin' will be handeled by this middleware [filtering paths]
app.use(shopRoutes.routes);
app.use(authRoutes);
app.use("/500", errorController.get500);
app.use(errorController.get404); //catch all middleware

app.use((error, req, res, next) => {
	//error handling middleware
	res.status(500).render("500", { pageTitle: "Error" });
});

mongoose
	.connect(MONGODB_URI)
	.then(() => app.listen(3000))
	.catch((err) => console.log(err));
