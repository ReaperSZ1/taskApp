const jwt = require('jsonwebtoken');

module.exports = function (taskId, SECRET_KEY) {
    // Valida a chave secreta
    if (!SECRET_KEY) {
        throw new Error('A chave secreta JWT_SECRET não está definida no ambiente');
    }

    // Valida o payload (taskId)
    if (typeof taskId !== 'string' && typeof taskId !== 'number') {
        throw new Error('O taskId deve ser uma string ou número válido');
    }

    const payload = { id: taskId };

    // Gera o token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    return token;
};
