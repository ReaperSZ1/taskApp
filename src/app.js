// modules
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars') 
    const flash = require("connect-flash") 
    const path = require('path') 
    const passport = require('passport');
    require('./config/auth')(passport)
    require('dotenv').config();
 // Config
    const connectDB = require('./config/db');
    const sessionConfig = require('./config/session');
    const helmetConfig = require('./config/helmet');
    const isAuthenticated = require('./helpers/isAuthenticated') // Middleware to verify if user is logged
    const User = require('./routes/usuario') 
    const Task = require('./routes/tarefa') 
    const task = require('./models/task')
// #region Settings 
    // MongoURI - alternate between developement ad production dinamically
        const mongoURI = process.env.NODE_ENV === 'production' 
            ? process.env.MONGO_URI_PROD 
            : process.env.MONGO_URI_DEV
        // Stop the execution if URI is not defined
        if (!mongoURI) {
            console.error("Error: MongoDB URI is not defined.");
            process.exit(1); 
        }
    // Connection to the database
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
            partialsDir: path.join(__dirname, 'views/partials'),  // Defines the partials directory
            runtimeOptions: { // each Config
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
        }))
        app.set('views', path.join(__dirname, 'views')); // Sets the absolute path for the views directory
        app.set('view engine', 'handlebars')  
    // Static files 
        app.use(express.static(path.join(__dirname, '../public'))) 
    // Global Variables
        app.use((req, res, next) => {
            res.locals.successMsg = req.flash('successMsg') // temporary success messages
            res.locals.errorMsg = req.flash('errorMsg') // personalized error messages 
            res.locals.error = req.flash('error') // default error message for passport
            res.locals.user = req.user || null // logged user or null if not logged in
            next() 
        })
// #endregion
// Routes
    app.get('/', (req, res) => {
        const isLoggedIn = req.isAuthenticated() 
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
        res.status(200).render('index', { isLoggedIn })
    })
    app.get('/tarefas', isAuthenticated, async (req, res) => {
        const Data = req.query.data;    
        const userId = req.user?._id;
        // Parametter validation
        if (!Data || isNaN(new Date(Data).getTime())) {
            return res.status(400).json({ error: 'A data fornecida é inválida ou está ausente. Use o formato YYYY-MM-DD.' });
        }
        // convert the date to the start of the day format
        const startOfDay = new Date(Data);
        startOfDay.setHours(0, 0, 0, 0);  // Adjusts to 00:00:00.000
        // convert the date to the end of the day format 
        const endOfDay = new Date(Data);
        endOfDay.setHours(23, 59, 59, 999); // adjusts to 23:59:59.999
        // Response
        try {
            // find tasks within the time interval of the day
            const tarefas = await task.find({
                date: { $gte: startOfDay, $lte: endOfDay },
                userId: userId
            }).select('-_id -createdAt -updatedAt -userId'); // remove sensitive data from the task object 
            // if no tasks are found 
            if (!tarefas || tarefas.length === 0) {
                return res.status(404).json({ message: 'Nenhuma tarefa encontrada para esta data.' });
            }
            // On success, return the task object
            res.status(200).json(tarefas);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno ao buscar tarefas.' });
        }
    }); 
// other routes
    app.use('/usuarios', User) 
    app.use('/tarefa', Task) 
// Server initialization
    const PORT = process.env.PORT || 8081 
    app.listen(PORT, () => { 
        if(PORT == 8081)
            console.log('Server ON => LocalHost');
        else 
            console.log('Server ON => Remote');
     })