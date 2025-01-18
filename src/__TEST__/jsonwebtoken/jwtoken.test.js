const generateTokenForTask = require('./jwtoken')
const jwt = require('jsonwebtoken');

describe('generateTokenForTask', () => {
    test('verify the token', () => {
        const token = generateTokenForTask(12121,'adasdv')
        const parts = token.split('.');
        // check if the token is a string
        expect(typeof token).toBe('string');
        // check if the token is not empty
        expect(token).not.toBe('');
        // check the token format
        expect(parts).toHaveLength(3); // JWT format: header.payload.signature
        // Should return a valid token with 143 characters by default
        expect(token).toHaveLength(143)
    })
    test('the token should expire after the defined time', (done) => {
        const taskId = '12345';
        const shortLivedToken = jwt.sign({ id: taskId }, 'SECRET_KEY', { expiresIn: '1s' });
        // wait for the expiration time (1s) before checking
        setTimeout(() => {
            jwt.verify(shortLivedToken, 'SECRET_KEY', (err) => {
                expect(err).toBeDefined(); 
                expect(err.name).toBe('TokenExpiredError');
                done();
            });
        }, 1100); 
    });
    test('the token should contain the correxct payload', () => {
        const taskId = '12345';
        const token = generateTokenForTask(taskId, 'SECRET_KEY');
        // Decode the Token without verifying the signature
        const decoded = jwt.decode(token);
        // verify the content of payload
        expect(decoded).toMatchObject({ id: taskId });
    });
    test('should return error when the secret key is not defined', () => {
        expect(() => { generateTokenForTask(4123) }).toThrow('A chave secreta JWT_SECRET não está definida no ambiente');
    })
    test('should throw error if the taskid is not defined', () => {
        expect(() => { generateTokenForTask(undefined, 'chaveSecretaValida') }).toThrow('O taskId deve ser uma string ou número válido');
    });
    test('should throw erro if the payload contains invalid datas', () => {
        const invalidTaskId = { id: 'invalid' }; 
        expect(() => { generateTokenForTask(invalidTaskId, 'chaveSecretaValida') }).toThrow('O taskId deve ser uma string ou número válido');
    });
})