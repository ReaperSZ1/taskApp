const localStr = require('passport-local').Strategy
const passport = require('passport')
const bcrypt = require('bcryptjs') 
const usuario = require('../models/usuario')
// Local Authetication
module.exports = function(passport){
    // configures passeport use email and password as authetication method
    passport.use(new localStr({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        // find a user with te provided email fornecido in the database
        usuario.findOne({email: email}).then((usuario) => {
            // case the user doesn´t exist
            if(!usuario){ 
                return done(null, false, {message: 'Conta Não Encontrada, Registre uma Nova!'})
            }
            // compares the provided password with the encrypted user´s password
            bcrypt.compare(senha, usuario.password, (erro, ok) => {
                // check if the passwords match
                if(ok) 
                    return done(null, usuario, {message: 'Login realizado com sucesso!'})
                else 
                    return done(null, false, {message: 'Senha Incorreta'})
            })
        })
    }))
}
// it stores a small piece of user information (id) for convenvience
passport.serializeUser((usuario,done) => { 
    done(null, usuario.id) 
})
// it uses the user's id to retrieve the complete data from the database and pass it to passport
passport.deserializeUser((id, done)=>{
    // finds the user in the database using the save id from the session
    usuario.findById(id)
        .then((usuario) => { done(null, usuario) })
        .catch((err) => { done(null, false, {message:'algo deu errado'}) })
})