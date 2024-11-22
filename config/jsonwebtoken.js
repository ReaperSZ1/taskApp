const jwt = require('jsonwebtoken');

// Defina uma chave secreta para assinar o token (isso deve ser mantido em segredo)
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error('A chave secreta JWT_SECRET não está definida no ambiente');
}

// Função para gerar o token para a tarefa
function generateTokenForTask(taskId) {
    // Você pode incluir informações extras no payload, se necessário
    const payload = { id: taskId };
    
    // Gera o token com um tempo de expiração (exemplo: 1 hora)
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

    return token;
}

module.exports = { generateTokenForTask };
