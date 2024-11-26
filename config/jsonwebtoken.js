const jwt = require('jsonwebtoken');

// Defina uma chave secreta para assinar o token (isso deve ser mantido em segredo)
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error('A chave secreta JWT_SECRET não está definida no ambiente');
}

// Função para gerar o token para a tarefa
function generateTokenForTask(taskId) {
    // Validar o payload
    const idTask = typeof taskId === 'object' && taskId.toString ? taskId.toString() : taskId;

    if (typeof idTask !== 'string' && typeof idTask !== 'number') 
        throw new Error('O taskId deve ser uma string ou número válido');

    const payload = { id: idTask };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // criando o token
    return token;    
}

module.exports = { generateTokenForTask };

// codigo testado: '../__TEST__/jsonwebtoken'