// middleware to check if the user is logged in
module.exports = function isAuthenticated(req, res, next) {
    // if the user is logged in
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('errorMsg', 'Faça o login')
        res.redirect('/usuarios/login'); 
    }
}

