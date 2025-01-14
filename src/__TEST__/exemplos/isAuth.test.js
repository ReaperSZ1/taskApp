const isAuthenticated = require('../../helpers/isAuthenticated');

describe('Middleware isAuthenticated', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            isAuthenticated: jest.fn(),
            flash: jest.fn()
        };
        res = { redirect: jest.fn()};
        next = jest.fn();
    });

    test('Deve chamar next() se o usuário estiver autenticado', () => {
        req.isAuthenticated.mockReturnValue(true); // Simula o usuário autenticado

        isAuthenticated(req, res, next);

        expect(next).toHaveBeenCalled(); // Verifica se next foi chamado
        expect(res.redirect).not.toHaveBeenCalled(); // Não deve redirecionar
    });

    test('Deve redirecionar se o usuário não estiver autenticado', () => {
        req.isAuthenticated.mockReturnValue(false); // Simula o usuário não autenticado

        isAuthenticated(req, res, next);

        expect(req.flash).toHaveBeenCalledWith('errorMsg', 'Faça o login');
        expect(res.redirect).toHaveBeenCalledWith('/usuarios/login');
        expect(next).not.toHaveBeenCalled(); // Não deve chamar next
    });
});
