module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) //if the user is not logged in redirect to login page
        return res.redirect('/login');
    next();
}