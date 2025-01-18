const jwt = require('jsonwebtoken');

module.exports = function (taskId, SECRET_KEY) {
    // check the secret key
    if (!SECRET_KEY) {
        throw new Error('A chave secreta JWT_SECRET não está definida no ambiente');
    }
    // check the payload (taskId)
    if (typeof taskId !== 'string' && typeof taskId !== 'number') {
        throw new Error('O taskId deve ser uma string ou número válido');
    }
    const payload = { id: taskId };
    // generate the token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    return token;
};
