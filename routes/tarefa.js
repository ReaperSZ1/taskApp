const express = require('express')
const router = express.Router()
const task = require('../models/task')
const { generateTokenForTask } = require('../config/jsonwebtoken'); // gera token para id
const isAuthenticated = require('../helpers/isAuthenticated') // Middleware para verificar se o usuário está logado

    router.get('/add', isAuthenticated, (req, res) => { 
        const erros = req.flash('erros');
        res.render('tarefa/addtarefa', {  erros });
    })

    router.post('/novo', (req, res) => { 
        const userId = req.user._id; // Pega o _id do usuário logado no Passport ou outra autenticação
        // validação de formulário
            const erros = []
            if (!req.body.date || isNaN(Date.parse(req.body.date))) {
                erros.push({ texto: 'Data inválida ou ausente' });
            }
            
            if(!req.body.title || typeof req.body.title == undefined || req.body.title == null || req.body.title.length == 0){
                erros.push({texto: 'Titulo inválido'})
            } 
            if (erros.length > 0) {
                req.flash('erros', erros);  // Passa os erros para a sessão
                return res.redirect('/tarefa/add');  // Redireciona para a URL desejada
            } else {
                const data = new Date(req.body.date);
                // colocando os dados da req no schema da task
                new task({ 
                    title: req.body.title, 
                    description: req.body.description,
                    date: data,
                    userId: userId,
                    token: generateTokenForTask(req.body.id) 
                }).save()
                    .then(() => { 
                        req.flash("successMsg", 'Nova Tarefa Criada!') // atribui a msg a variavel global successMsg
                        res.redirect('/') 
                    })
                    .catch((err) => { 
                        req.flash("errorMsg", 'Houve um erro ao criar a tarefa' + err)
                        res.redirect("/tarefa/add")
                    })
            }
    })

    // rota para deletar
    router.post('/deletar', isAuthenticated, (req, res) => { 
        task.findOne({ token: req.body.token, userId: req.user.id })
        .then(task => {
            if (task) 
                return task.deleteOne();
            else 
                throw new Error("Tarefa não encontrada ou não autorizada");
        })
        .then(() => {
            req.flash("successMsg", 'Tarefa deletada com sucesso');
            res.redirect('/');
        })
        .catch(err => {
            req.flash("errorMsg", err.message);
            res.redirect('/');
        });
    })

    router.get('/editar/:token', (req, res) => {
        task.findOne({token: req.params.token}).then((task) => {
            res.render('tarefa/editTarefa', {task: task})
        }).catch((err) => {
            req.flash('errorMsg', 'Tarefa não encontrada')
            res.redirect('/')
        })
    })
    router.post('/editar', (req, res) => {
        // validação de formulário
            const erros = []
            
            if (!req.body.date || isNaN(Date.parse(req.body.date))) {
                erros.push({ texto: 'Data inválida ou ausente' });
            }
            if(!req.body.title || typeof req.body.title == undefined || req.body.title == null || req.body.title.length == 0){
                erros.push({texto: 'Titulo inválido'})
            } 
            if (erros.length > 0) {
                req.flash('erros', erros);  // Passa os erros para a sessão
                return res.redirect('/tarefa/editar');  // Redireciona para a URL desejada
            } else {
                const data = new Date(req.body.date);
                // procura a task na db e faz as alterações
                task.findOne({token: req.body.token, userId: req.user.id}).then((task) => {
                    task.title = req.body.title, 
                    task.description = req.body.description,
                    task.date = data
                    
                    task.save().then(() => {
                        req.flash("successMsg", 'Tarefa editada com sucesso') 
                        res.redirect('/')
                    }).catch((err) => {
                        req.flash('errorMsg', 'houve um erro ao editar a Tarefa')
                        res.redirect('/')
                    })
                }).catch((err) => {
                    req.flash('errorMsg', 'houve um erro ao encontrar a Tarefa')
                    res.redirect('/')
                })
            }
    })

module.exports = router