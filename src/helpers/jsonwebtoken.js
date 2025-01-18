const jwt = require('jsonwebtoken');
require('dotenv').config()
// define a secret key to sign the token 
const SECRET_KEY = process.env.JWT_SECRET;
// if the secret key is not defined
if (!SECRET_KEY) {
    throw new Error('A chave secreta JWT_SECRET não está definida no ambiente');
}
// function to generate a token for a task
function generateTokenForTask(taskId) {
    // validate the payload
    const idTask = typeof taskId === 'object' && taskId.toString ? taskId.toString() : taskId;
    // check the type of idtask 
    if (typeof idTask !== 'string' && typeof idTask !== 'number') 
        throw new Error('O taskId deve ser uma string ou número válido');
    // create the payload
    const payload = { id: idTask };
    // create the token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); 
    return token;    
}
module.exports = { generateTokenForTask };
