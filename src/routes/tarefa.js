const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator'); // validaçao de formulários
const { generateTokenForTask } = require('../helpers/jsonwebtoken'); // gera token para id
const isAuthenticated = require('../helpers/isAuthenticated') // Middleware para verificar se o usuário está logado
const task = require('../models/task')

    router.get('/add', isAuthenticated, (req, res) => { 
        res.status(200).render('tarefa/addtarefa');
    })

    router.post('/novo', isAuthenticated, [ 
        // validação de formulário
        body('date')
            .notEmpty().withMessage('Adicione uma Data')
            .isISO8601().withMessage('Data Inválida, Formato correto: YYYY-MM-DD.'),
        body('title')
            .notEmpty().withMessage('Adicione um Titulo')
            .matches(/^[a-zA-Z0-9_,'!\-\s\.]+$/).withMessage('O título não pode conter caracteres especiais') 
            .isLength({ max: 50 }).withMessage('O título não pode ter mais de 50 caracteres')
            .trim() // Remove espaços extras antes e depois do título
            .escape(), // Escapa caracteres especiais para evitar XSS
        body('description')
            .optional() //  Esta validação permite que o campo de descrição seja vazio.
            .matches(/^[a-zA-Z0-9_,!\-\s\.]*$/).withMessage('A descrição não pode conter caracteres especiais')
            .trim() // Remove espaços extras antes e depois do título
            .escape(), // Escapa caracteres especiais para evitar XSS
    ],(req, res) => { 
        const userId = req.user._id; // Pega o _id do usuário logado no Passport ou outra autenticação
        
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            let errorsArray = validationResult(req).array()

            req.flash('errorMsg', errorsArray.map(err => err.msg))
            res.setHeader('X-Flash-Error', 'validação de formulário')
            res.redirect('/tarefa/add');  // Redireciona para a URL desejada
        } else {
            const data = new Date(req.body.date);
            // colocando os dados da req no schema da task
            new task({ 
                title: req.body.title, 
                description: req.body.description,
                date: data,
                userId: userId,
                token: generateTokenForTask(req.user._id) 
            }).save()
                .then((createdTask) => { 
                    req.flash("successMsg", 'Nova Tarefa Criada!') // atribui a msg a variavel global successMsg
                    res.setHeader('X-Flash-Success', 'Nova Tarefa Criada!')
                    // caso queira a tarefa como resposta em formato json
                    if (req.headers['json'] == 'true'){ 
                        const responseObject = {
                            title: createdTask.title,
                            description: createdTask.description,
                            date: createdTask.date,
                        };
                        return res.status(201).json({ responseObject });
                    } else { 
                        res.redirect('/') 
                    }
                })
                .catch((err) => { 
                    req.flash("errorMsg", 'Houve um erro ao criar a tarefa: ' + err)
                    res.setHeader('X-Flash-Error', 'Houve um erro ao criar a tarefa: ' + err)
                    res.redirect("/tarefa/add")
                })
        }
    })// 

    router.post('/deletar', isAuthenticated, (req, res) => { 
        task.findOne({ token: req.body.token, userId: req.user._id })
            .then(task => {
                if (task) 
                    return task.deleteOne();
                else 
                    throw new Error("Tarefa não encontrada ou não autorizada"); // entra no catch
            })
            .then(() => {
                req.flash("successMsg", 'Tarefa deletada com sucesso');
                if(req.headers['no-redirect'] === 'true'){
                    res.setHeader('X-Flash-Success', 'Tarefa deletada com sucesso')
                    return res.send('Success!!')
                }
                res.redirect('/');
            })
            .catch(err => {
                req.flash("errorMsg", err.message);
                if(req.headers['no-redirect'] === 'true'){
                    res.setHeader('X-Flash-Error', 'Tarefa não encontrada ou não autorizada')
                    return res.send('Error!!')
                }
                res.redirect('/');
            });
    })

    router.get('/editar', isAuthenticated, (req, res) => {
        task.findOne({token: req.query.token, userId: req.user._id})
            .then((task) => { 
                if(task){
                    const responseObject = {
                        title: task.title,
                        description: task.description,
                        date: task.date,
                        token: task.token
                    };
                    res.setHeader('X-Flash-Success', 'Tarefa encontrada com sucesso')
                    return res.status(200).render('tarefa/editTarefa', {task: responseObject})
                } else {
                    throw new Error('Tarefa não encontrada ou não autorizada')
                }
            }) 
            .catch((err) => {
                req.flash('errorMsg', err.message)
                if(req.headers['no-redirect'] === 'true'){
                    res.setHeader('X-Flash-Error', err.message)
                    return res.send(err.message)
                }
                res.redirect('/');
            })
    })
    
    router.post('/editar', isAuthenticated,[
        // validação de formulário e sanitização
        body('date')
            .notEmpty().withMessage('Adicione uma Data')
            .isISO8601().withMessage('Data Inválida, Formato correto: YYYY-MM-DD.'),
        body('title')
            .notEmpty().withMessage('Adicione um Titulo')
            .matches(/^[a-zA-Z0-9_,'\-\s\.]+$/).withMessage('O título não pode conter caracteres especiais') 
            .isLength({ max: 50 }).withMessage('O título não pode ter mais de 50 caracteres')
            .trim() // Remove espaços extras antes e depois do título
            .escape(), // Escapa caracteres especiais para evitar XSS
        body('description')
            .optional() //  Esta validação permite que o campo de descrição seja vazio.
            .matches(/^[a-zA-Z0-9_,\-\s\.]*$/).withMessage('A descrição não pode conter caracteres especiais')
            .trim().escape()
    ], (req, res) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            let errorsArray = validationResult(req).array()

            req.flash('errorMsg', errorsArray.map(err => err.msg))
            if(req.headers['no-redirect'] === 'true'){
                res.setHeader('X-Flash-Error', 'validação de formulário')
                return res.send('error!!')
            }
            res.redirect(`/tarefa/editar?token=${req.body.token}`); // redireciona a url usando req.query
        } else {
            // procura a task na db e faz as alterações
            task.findOne({ token: req.body.token, userId: req.user._id })
                .then((task) => {
                    if (!task) {
                        req.flash('errorMsg', 'Tarefa não encontrada');
                        if(req.headers['no-redirect'] === 'true'){
                            res.setHeader('X-Flash-Error', 'Tarefa não encontrada')
                            return res.send('error!!')
                        }
                        return res.redirect('/');
                    }

                    task.title = req.body.title;
                    task.description = req.body.description;
                    task.date = new Date(req.body.date);

                    return task.save();
                })
                .then((editedTask) => {
                    if (!editedTask) return; // Se a edição falhar por algum motivo

                    req.flash("successMsg", 'Tarefa editada com sucesso');
                    res.setHeader('X-Flash-Success', 'Tarefa editada com sucesso')
                    // caso queira receber como resposta a tarefa em formato json
                    if (req.headers['json'] === 'true'){ 
                        const responseObject = {
                            title: editedTask.title,
                            description: editedTask.description,
                            date: editedTask.date,
                        };
                        return res.status(200).json({ responseObject });
                    } else { 
                        res.redirect('/');  
                    }  
                })
                .catch((err) => {
                    req.flash('errorMsg', 'Houve um erro ao processar a tarefa');
                    if(req.headers['no-redirect'] === 'true'){
                        res.setHeader('X-Flash-Error', 'Houve um erro ao processar a tarefa')
                        return res.send('error!!')
                    }
                    res.redirect('/');
                });
        }
    })

module.exports = router