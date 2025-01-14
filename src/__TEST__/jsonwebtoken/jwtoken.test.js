const generateTokenForTask = require('./jwtoken')
const jwt = require('jsonwebtoken');

describe('generateTokenForTask', () => {

    test('retornar um token valido com 143 caracteres por padrão', () => {
        expect(generateTokenForTask(12121,'adasdv')).toHaveLength(143)
    })

    test('Verifica se o token é uma string, não está vazio e se tem o formato padrão', () => {
        const token = generateTokenForTask(12121,'adasdv')
        expect(typeof token).toBe('string');
        expect(token).not.toBe('');
        // Verifica o formato do token
        const parts = token.split('.');
        console.log(parts)
        expect(parts).toHaveLength(3); // Formato JWT: header.payload.signature
    })

    test('O token deve expirar após o tempo definido', (done) => {
        const taskId = '12345';
        const shortLivedToken = jwt.sign({ id: taskId }, 'SECRET_KEY', { expiresIn: '1s' });
    
        // Aguarde o tempo de expiração (1s) antes de verificar
        setTimeout(() => {
            jwt.verify(shortLivedToken, 'SECRET_KEY', (err) => {
                expect(err).toBeDefined(); // Verifica que houve erro na validação
                expect(err.name).toBe('TokenExpiredError');
                done(); // Finaliza o teste assíncrono
            });
        }, 1100); // Aguarda 1.1 segundos
    });
    
    test('O token deve conter o payload correto', () => {
        const taskId = '12345';
        const token = generateTokenForTask(taskId, 'SECRET_KEY');
    
        // Decodifica o token sem verificar a assinatura
        const decoded = jwt.decode(token);
    
        // Verifica o conteúdo do payload
        expect(decoded).toMatchObject({ id: taskId });
    });
    

    test('retornar erro caso a chave secreta nao esteja definida', () => {
        expect(() => { generateTokenForTask(4123) }).toThrow('A chave secreta JWT_SECRET não está definida no ambiente');
    })

    test('deve lançar erro se o taskId não for válido', () => {
        expect(() => { generateTokenForTask(undefined, 'chaveSecretaValida') }).toThrow('O taskId deve ser uma string ou número válido');
    });

    test('deve lançar erro se o payload contiver dados inválidos', () => {
        const invalidTaskId = { id: 'invalid' }; // Um objeto não serializável
        expect(() => { generateTokenForTask(invalidTaskId, 'chaveSecretaValida') }).toThrow('O taskId deve ser uma string ou número válido');
    });
})