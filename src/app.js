// Carregando modulos
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars') 
    const flash = require("connect-flash") 
    const path = require('path') 
    const passport = require('passport');
    require('./config/auth')(passport)
    require('dotenv').config();
 // Configurações
    const connectDB = require('./config/db');
    const sessionConfig = require('./config/session');
    const helmetConfig = require('./config/helmet');
    const isAuthenticated = require('./helpers/isAuthenticated') // Middleware para verificar se o usuário está logado
    const User = require('./routes/usuario') 
    const Task = require('./routes/tarefa') 
    const task = require('./models/task')
// #region Settings 
    // MongoURI - alterna entre desenvolvimento e produção dinamicamente. Atalho: file:///c:\nodejs\taskApp\.env
        const mongoURI = process.env.NODE_ENV === 'production' 
            ? process.env.MONGO_URI_PROD 
            : process.env.MONGO_URI_DEV

        if (!mongoURI) {
            console.error("Error: MongoDB URI is not defined.");
            process.exit(1); // Interrompe a execução se a URI não estiver definida
        }
    // Conexão com o banco de dados
        connectDB(mongoURI);
    // Body-Parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json()) 
    // Session 
        app.use(sessionConfig(mongoURI));
        app.use(passport.initialize()) 
        app.use(passport.session()) 
        app.use(flash()) 
    // Helmet
        app.use(helmetConfig);
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
    // Arquivos estáticos
        app.use(express.static(path.join(__dirname, '../public'))) 
    // Variáveis globais
        app.use((req, res, next) => {
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
    // api
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
        //
        const endOfDay = new Date(Data);
        endOfDay.setHours(23, 59, 59, 999); // Ajusta para 23:59:59.999
        //
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
// inicialização do Servidor
    const PORT = process.env.PORT || 8081 
    app.listen(PORT, () => { 
        if(PORT == 8081)
            console.log('Server ON => LocalHost');
        else 
            console.log('Server ON => Remote');
     })
  
  
