// modules
    const express = require('express')
    const router = express.Router()
    const { body, validationResult } = require('express-validator'); 
    const usuario = require('../models/usuario')
    const bcrypt = require('bcryptjs') 
    const passport = require('passport')
// routes
    router.get('/registro', (req, res) => {
        res.status(200).render('usuarios/registro')
    })

    router.post('/registro/novo',[
        // validation and sanitization of user's name, email and possword
        body('userName')
            .notEmpty().withMessage('Nome é obrigatório')
            .isLength({ min: 2 }).withMessage('Nome muito pequeno')
            .trim() // removes extra spaces 
            .escape(), // escapes special characters
        body('email')
            .notEmpty().withMessage('E-mail é obrigatório')
            .isEmail().withMessage('E-mail inválido')
            .isLength({ min: 10 }).withMessage('E-mail muito pequeno')
            .normalizeEmail(), 
        body('password')
            .notEmpty().withMessage('Senha é obrigatória')
            .isLength({ min: 4 }).withMessage('Senha muito curta')
            .trim(), 
        body('password2')
            .notEmpty().withMessage('Confirmação de senha é obrigatória')
            .custom((value, { req }) => value === req.body.password).withMessage('As senhas não coincidem')
            .trim(),
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // gets the validation erros in array format
            let errorsArray = validationResult(req).array(); 

            if (errorsArray.length > 0) {
                req.flash('errorMsg', errorsArray.map(error => error.msg));
                res.redirect('/usuarios/registro')
            }            
        } else {
            // checks if the user's email exists in the database
            usuario.findOne({email: req.body.email}).then((conta) => {
                if(conta){
                    req.flash('errorMsg', 'Já existe uma conta com este e-mail no nosso sistema!')
                    res.setHeader('X-Flash-Error', 'Já existe uma conta com este e-mail no nosso sistema!')
                    res.redirect('/usuarios/registro')
                } else {
                    const novoUsuario = new usuario({
                        userName: req.body.userName,
                        email: req.body.email,
                        password: req.body.password
                    }) 
                    // before registering a new user, encrypt the password
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.password, salt, (err, hash) =>{
                            if(err){
                                req.flash('errorMsg', 'Houve um erro durante o salvamento do usuario')
                                res.redirect('/usuarios/registro')
                            } else {
                                // encrypts the password
                                novoUsuario.password = hash
                                // saves the new user
                                novoUsuario.save()
                                    .then(() => {
                                        req.flash('successMsg', 'Usuário criado com sucesso! Acesse sua conta!')
                                        if(req.headers['no-redirect'] === 'true'){
                                            res.setHeader('X-Flash-Success', 'Usuário criado com sucesso! Acesse sua conta!')
                                            return res.send('Sucess!!')
                                        }
                                        res.redirect('/')
                                    })
                                    .catch((err) => {
                                        req.flash('errorMsg', 'Houve um Erro ao criar o usuario tente novamente')
                                        res.setHeader('X-Flash-Error', 'Houve um Erro ao criar o usuario tente novamente')
                                        res.redirect('/usuarios/registro')
                                    })
                            }
                        })
                    })
                }
            }).catch((err) => {
                req.flash('errorMsg', 'Houve um Erro interno')
                res.redirect('/usuarios/registro')
            })
        }
    })

    router.get('/login', (req, res) => {
        res.status(200).render('usuarios/login')
    })

    router.post('/login/novo', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                res.setHeader('X-Flash-Error', 'Houve um Erro inesperado')
                return next(err);
            }
            if (!user) {
                req.flash('errorMsg', info.message || 'Erro de autenticação');
                res.setHeader('X-Flash-Error', 'Conta inexistente ou senha incorreta')
                return res.redirect('/usuarios/login'); 
            }
            // if the authetication is sucessful
            req.logIn(user, (err) => {
                if (err) {
                    res.setHeader('X-Flash-Error', 'Houve um erro inesperado')
                    return next(err);
                }
                if(req.headers['no-redirect'] === 'true'){
                    res.setHeader('X-Flash-Success', 'Login realizado com sucesso!')
                    return res.send('Sucess!!')
                }
                req.flash('successMsg', 'Login realizado com sucesso!');
                res.redirect('/'); 
            });
        })(req, res, next);
    });
    
    router.get('/logout', (req, res) => {
        req.logout((err) => {
            if(err){ 
                return next(err) 
            } else {
                req.flash("successMsg", 'Conta Deslogada!')
                if(req.headers['no-redirect'] === 'true'){
                    res.setHeader('X-Flash-Success', 'Conta Deslogada!')
                    return res.send('Sucess!!')
                }
                res.redirect('/')
            }
        })
    })
    
module.exports = router
