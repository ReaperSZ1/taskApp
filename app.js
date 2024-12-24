// Carregando modulos
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars') 
    const MongoStore = require('connect-mongo');
    const session = require("express-session")
    const flash = require("connect-flash") 
    const mongoose = require('mongoose')
    const helmet = require('helmet') // prevent xss attacks
    const path = require('path') 
    const cors = require('cors');
    
    const passport = require('passport');
    require('./config/auth')(passport)
    require('dotenv').config();

    const isAuthenticated = require('./helpers/isAuthenticated') // Middleware para verificar se o usuário está logado
    const User = require('./routes/usuario') 
    const Task = require('./routes/tarefa') 
    const task = require('./models/task')
    
// #region Settings 
    // MongoURI - verifica se vou rodar o server no local ou no render
        // alterna o valor do Uri - abra o node env e altere o valor: file:///c:\nodejs\taskApp\.env
        const mongoURI = process.env.NODE_ENV === 'production' 
            ? process.env.MONGO_URI_PROD 
            : process.env.MONGO_URI_DEV;

        if (!mongoURI) {
            console.error("Error: MongoDB URI is not defined.");
            process.exit(1); // Interrompe a execução se a URI não estiver definida
        }
    // Mongoose 
        mongoose.connect(mongoURI) // esse mongouri determina se vai conectar pelo local ou pelo server
            .then(() => { console.log('Mongo Connected'); })
            .catch((err) => { console.log('An error occurred when trying to connect to the server: ' + err); })
    // Body-Parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json()) 
    // Handlebars
        app.engine('handlebars', handlebars.engine({ 
            defaultLayout: 'main',
            partialsDir: path.join(__dirname, 'views/partials'),  // Define o diretório de partials
            runtimeOptions: { // config do each
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
         }))
        app.set('views', path.join(__dirname, 'views')); // Defina o caminho absoluto para o diretório de views
        app.set('view engine', 'handlebars')
    // CORS
        app.use(cors({
            origin: [
                'http://localhost:8081', // Domínio remoto
                //'http://localhost:8081' // Localhost para desenvolvimento
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
            credentials: true // Permite cookies e autenticação
        }));
    // Public  
        app.use(express.static(path.join(__dirname, 'public'))) 
    // Session 
        app.use(session({ 
            secret: process.env.SESSION_SECRET || 'jooj', resave: true, saveUninitialized: true, 
            cookie: { httpOnly: true}, // Evita XSS
            store: MongoStore.create({ 
                mongoUrl: mongoURI, 
                collectionName: 'sessions' 
            })
        }))
        app.use(passport.initialize()) 
        app.use(passport.session()) 
        app.use(flash()) 
    // Helmet
      app.use(
          helmet({
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"], // Permite recursos do próprio domínio
                scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], // Scripts externos permitidos
                styleSrc: [
                  "'self'",
                  "'unsafe-inline'", // Necessário se houver estilos inline
                  "https://www.gstatic.com", // Adicione esta origem
                ],
                styleSrcElem: [
                  "'self'",
                  "'unsafe-inline'", // Adicione para permitir estilos inline em elementos
                  "https://www.gstatic.com",
                ],
                imgSrc: ["'self'", "data:", "https:"], // Permite imagens inline e externas
                connectSrc: ["'self'", "https://your-api.com"], // APIs externas permitidas
              },
            },
          })
        );
        // MiddleWare 
        app.use((req, res, next) => {
            // variaveis globais acessiveis no handlebars
            res.locals.successMsg = req.flash('successMsg') // armazena mensagens de sucesso temporárias
            res.locals.errorMsg = req.flash('errorMsg') // armazena mensagens de erro personalizadas
            res.locals.error = req.flash('error') // armazena mensagens de erro padrão, especialmente para o Passport
            res.locals.user = req.user || null // armazena o usuário logado, ou null se não houver nenhum logado
            next() // continuar o trafégo normal
        })
// #endregion
// Routes
    app.get('/', (req, res) => {
        const isLoggedIn = req.isAuthenticated() 
        res.status(200).render('index', { isLoggedIn })
    })

    // Exemplo de rota no Express para buscar todas as tarefas de uma data específica
    app.get('/tarefas', isAuthenticated, async (req, res) => {
        const Data = req.query.data;    
        const userId = req.user?._id;

        // Validação do parâmetro `data`
        if (!Data || isNaN(new Date(Data).getTime())) {
            return res.status(400).json({ error: 'A data fornecida é inválida ou está ausente. Use o formato YYYY-MM-DD.' });
        }

        // Convertendo a data para o formato de início e fim do dia
        const startOfDay = new Date(Data);
        startOfDay.setHours(0, 0, 0, 0);  // Ajusta para 00:00:00.000

        const endOfDay = new Date(Data);
        endOfDay.setHours(23, 59, 59, 999); // Ajusta para 23:59:59.999

        try {
            // Buscando tarefas dentro do intervalo de tempo do dia
            const tarefas = await task.find({
                date: { $gte: startOfDay, $lte: endOfDay },
                userId: userId
            }).select('-_id -createdAt -updatedAt -userId'); // remove dados sensiveis do obj tarefa para nao expor
            
            if (!tarefas || tarefas.length === 0) {
                return res.status(404).json({ message: 'Nenhuma tarefa encontrada para esta data.' });
            }
            
            res.status(200).json(tarefas);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno ao buscar tarefas.' });
        }
    }); 

    app.use('/usuarios', User) 
    app.use('/tarefa', Task) 
// Others
    const PORT = process.env.PORT || 8081 
    app.listen(PORT, () => { 
        if(PORT == 8081)
            console.log('Server ON => LocalHost');
        else 
            console.log('Server ON => Remote');
     })
  
  
