const express = require('express')
const router = express.Router()
const usuario = require('../models/usuario')
const bcrypt = require('bcryptjs') // isto serve para proteger passwords contra hackers, encriptando-as
const passport = require('passport')

// routes
    router.get('/registro', (req, res) => {
        res.render('usuarios/registro')
    })

    router.post('/registro/novo', (req, res) => {
        // validação de formulário
            let erros = []

            if(!req.body.userName || typeof req.body.userName == undefined || req.body.userName == null){
                erros.push({texto: 'Nome Inválido'})
            } 
            if(req.body.userName.length < 2){
                erros.push({texto: 'Nome muito pequeno'})
            }
            if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
                erros.push({texto: 'Email inválido'})
            } 
            if(req.body.email.length < 10){
                erros.push({texto: 'Email muito pequeno'})
            }
            if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
                erros.push({texto: 'senha inválida'})
            } 
            if(req.body.password.length < 4){
                erros.push({texto: 'senha muito curta'})
            }
            if(req.body.password != req.body.password2){
                erros.push({texto: 'as senhas são diferentes, Tente Novamente'})
            }
            if(erros.length > 0){            
                res.render('usuarios/registro', {erros: erros})
            } else {
                // verificar se o email do usuario já existe na db
                    usuario.findOne({email: req.body.email}).then((conta) => {
                        if(conta){
                            req.flash('errorMsg', 'Já existe uma conta com este e-mail no nosso sistema!')
                            res.redirect('/usuarios/registro')
                        } else {
                            const novoUsuario = new usuario({
                                userName: req.body.userName,
                                email: req.body.email,
                                password: req.body.password
                            }) // antes de registrar o usuario usando o .save(), encripte a password
                            
                            //  Gera um valor aleatório para adicionar à password antes de criptografá-la.
                            bcrypt.genSalt(10, (erro, salt) => {
                                bcrypt.hash(novoUsuario.password, salt, (erro, hash) =>{
                                    //caso encontre algum erro
                                    if(erro){
                                        req.flash('errorMsg', 'Houve um erro durante o salvamento do usuario')
                                        res.redirect('/usuarios/registro')
                                    } else {
                                        // encripta a password
                                        novoUsuario.password = hash

                                        novoUsuario.save().then(() => {
                                            req.flash('successMsg', 'Usuário criado com sucesso!')
                                            res.redirect('/')
                                        }).catch((err) => {
                                            req.flash('errorMsg', 'Houve um Erro ao criar o usuario tente novamente')
                                            res.redirect('/usuarios/registro')
                                        })
                                    }
                                })
                            })
                        }
                    }).catch((err) => {
                        req.flash('errorMsg', 'Houve um Erro interno')
                        res.redirect('/')
                    })
            }
    })

    router.get('/login', (req, res) => {
        res.render('usuarios/login')
    })

    router.post('/login/novo', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err); // Trate qualquer erro
            }
            if (!user) {
                req.flash('errorMsg', info.message || 'Erro de autenticação');
                return res.redirect('/usuarios/login'); // Se não autenticado, redireciona de volta ao login
            }
    
            // Se a autenticação for bem-sucedida
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
    
                // Mensagem de sucesso após login
                req.flash('successMsg', 'Login realizado com sucesso!');
    
                // Redireciona para a página inicial após login bem-sucedido
                return res.redirect('/');
            });
        })(req, res, next);
    });
    
    // logout do usuario logado
    router.get('/logout', (req, res) => {
        req.logout((err) => {
            if(err){ 
                return next(err) 
            } else {
                req.flash("successMsg", 'Conta Deslogada!')
                res.redirect('/')
            }
        })
    })
    
module.exports = router
