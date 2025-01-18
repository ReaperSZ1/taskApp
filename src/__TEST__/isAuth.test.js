const isAuthenticated = require('../helpers/isAuthenticated');

describe('Middleware isAuthenticated', () => {
    let req, res, next;
    // mock
    beforeEach(() => {
        req = {
            isAuthenticated: jest.fn(),
            flash: jest.fn()
        };
        res = { redirect: jest.fn()};
        next = jest.fn();
    });
    test('Should call next() if user is authenticated' , () => {
        // simulate the autheticated user
        req.isAuthenticated.mockReturnValue(true); 

        isAuthenticated(req, res, next);

        expect(next).toHaveBeenCalled(); // Verifica se next foi chamado
        expect(res.redirect).not.toHaveBeenCalled(); // Não deve redirecionar
    });

    test('should redirect if the user is not autheticated', () => {
        // simulate the not autheticated user
        req.isAuthenticated.mockReturnValue(false); 

        isAuthenticated(req, res, next);

        expect(req.flash).toHaveBeenCalledWith('errorMsg', 'Faça o login');
        expect(res.redirect).toHaveBeenCalledWith('/usuarios/login');
        expect(next).not.toHaveBeenCalled(); 
    });
});
