// Middleware para verificar se o usuário está logado
module.exports = function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Se o usuário estiver logado, permite continuar para a próxima função
    } else {
        req.flash('errorMsg', 'Faça o login')
        res.setHeader('X-Flash-Error', 'Faça o login')
        res.redirect('/usuarios/login'); // Se o usuário não estiver logado, redireciona para a página de login
    }
}

