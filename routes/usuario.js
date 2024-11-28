const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator'); // validaçao de formulários
const usuario = require('../models/usuario')
const bcrypt = require('bcryptjs') // isto serve para proteger passwords contra hackers, encriptando-as
const passport = require('passport')

// routes
    router.get('/registro', (req, res) => {
        res.render('usuarios/registro')
    })

    router.post('/registro/novo',[
        // validação de formulário
        body('userName')
            .notEmpty().withMessage('Nome é obrigatório') // verifica se não ta vazio
            .isLength({ min: 2 }).withMessage('Nome muito pequeno'), // tamanho minimo 2
        body('email')
            .notEmpty().withMessage('E-mail é obrigatório') 
            .isEmail().withMessage('E-mail inválido') // Valida se o valor é um e-mail no formato correto.
            .isLength({ min: 10 }).withMessage('E-mail muito pequeno'),
        body('password')
            .notEmpty().withMessage('Senha é obrigatório') 
            .isLength({ min: 4 }).withMessage('Senha muito curta'),
        body('password2')
            .notEmpty().withMessage('Segunda Senha é obrigatório') 
            .custom((value, { req }) => value === req.body.password).withMessage('As senhas não coincidem')
            // personalizado, O valor de password2 é comparado com o campo password enviado no corpo da requisição (req.body.password).
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let errorsArray = validationResult(req).array(); // Captura os erros de validação em forma de array

            if (errorsArray.length > 0) {
                req.flash('errorMsg', errorsArray.map(error => error.msg)); // Salva todas as mensagens de erro como um array
                res.redirect('/usuarios/registro')
            }            
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
                                    req.flash('successMsg', 'Usuário criado com sucesso! Acesse sua conta!')
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
                console.log()
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
