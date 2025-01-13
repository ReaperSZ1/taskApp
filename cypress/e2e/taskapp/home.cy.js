// npx cypress run --spec "cypress\e2e\taskapp/*"
const url = 'https://taskapp-481i.onrender.com'
// 'https://taskapp-481i.onrender.com' // 'http://localhost:8081'
describe('index', () => {
    describe('disconnected', () => {
        // visit 
        beforeEach(() => {
            cy.visit(url);
        })
        it('home page', () => {
            // it check if the user is logged out
            cy.get('p').should('have.text', 'Por favor, faça login para ver suas tarefas.');
            // interface tests on the home page
            UI_Tests()
        })
        it('other pages', () => {
            // click on the home button in the navbar
            cy.get('#navbarNav').contains('Home').click()
            cy.url().should('include', '/'); // check if you are at the correct url
            // click on the nova tarefa button in the navbar
            cy.get('#navbarNav').contains('Nova Tarefa').click()
            cy.url().should('include', '/usuarios/login');
            // click on the registro button in the navbar
            cy.get('#navbarNav').contains('Registro').click()
            cy.url().should('include', '/usuarios/registro');
            // logando na conta
            cy.get('#navbarNav').contains('Login').click()
            cy.url().should('include', '/usuarios/login');
            // typing
            cy.get(':nth-child(1) > .form-control').type('gabrielsil20177@gmail.com')
            cy.get(':nth-child(2) > .form-control').type('123123')
            // submit
            cy.get('form > .btn').click()
            cy.get('.btn').should('be.visible').should('have.text', 'Sair')
            // continue a partir daqui
        })
    });      
    describe('connected', () => {
        // getting set cookie
        before(()=> {
            // get a set-cookie from request
            cy.request({
                method: 'POST',
                url: `${url}/usuarios/login/novo`,
                body: {
                  email: 'gabrielsil20177@gmail.com',
                  senha: '123123'
                },
                headers: {
                    'no-redirect': 'true'
                }
            })
            .then((response) => {
                // Capturar o cabeçalho Set-Cookie da resposta
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader) {
                    // Extrai o token ou o valor do cookie necessário
                    const cookieValue = setCookieHeader.find(cookie => cookie.includes('connect.sid'));
                    if (cookieValue) {
                        // Armazenar o token em localStorage ou sessionStorage
                        window.localStorage.setItem('CookieAuth', cookieValue);
                        // Verificar se o token foi armazenado corretamente no localStorage
                        cy.window().should('have.property', 'localStorage').then((localStorage) => {
                            const cookie = localStorage.getItem('CookieAuth');
                            expect(cookie).to.exist; // Verificar se o token existe no localStorage
                            console.log('CookieAuth atualizado:', cookieValue);
                        });
                    } else {
                        console.log('Cookie de autenticação não encontrado no cabeçalho Set-Cookie.');
                    }
                    console.log('CookieAuth atualizado:', cookieValue);
                } else {
                    console.log('Cabeçalho Set-Cookie ausente na resposta.');
                }
            });
        })
        // visit
        beforeEach(() => {
            cy.visit(url);
        })
        it('tests', () => {
            // functions
            function navigateToJanuary() {
                const targetMonth = "Calendário de Janeiro 2025"; 
                const targetSelector = '#month-title'; 
                // extract the element from month-title
                cy.get(targetSelector).then(($el) => {
                    // it extract the text from the html element and removes spaces with trim()
                    const currentText = $el.text().trim(); 
                    // 
                    if (currentText !== targetMonth) {  
                        cy.get('#btn-lastMonth').click() // come back one month
                        cy.wait(500);
                        navigateToJanuary();
                    } else {
                        cy.log(`Data encontrada: ${currentText}`)// find the date
                        cy.get(targetSelector).should('have.text', targetMonth);
                    }
                });
            }        
            function taskTest(task, date) {
                // edit button and delete button
                function editButton() {
                    // functions
                    function taskValidation(task) {
                        // saving the task data
                            const title = task.title
                            const description = task.description
                            const date = new Date(task.date)
                            const year = date.getFullYear()
                            const month = date.getMonth()
                            const day = date.getDate()
                            const hour = date.getHours()
                            const minute = date.getMinutes()
                        // validation
                            cy.get('#title').should('have.value', `${title}`)
                            cy.get('#description').should('have.text', `${description}`)
                            cy.get('#hour').should('have.value', hour)
                            cy.get('#minute').should('have.value', minute)
                            cy.get('#day').should('have.value', day)
                            cy.get('#month').should('have.value', month)
                            cy.get('#year').should('have.value', year)
                    }
                    function deleteButton(task) {
                        // click
                        cy.get('button.delete-btn').first().click()
                        // alert
                        cy.on('window:confirm', (text) => {
                            expect(text).to.equal('Tem certeza que deseja deletar esta tarefa?');
                            return true; // Aceita o diálogo
                        });
                        // navigate
                        navigateToJanuary()
                        cy.wait(1000)
                        // intercepting
                        cy.intercept('GET', `/tarefas*`, (req) => {
                            // prevent error 304 NOT DEFINED
                            req.headers['cache-control'] = 'no-cache';
                            req.headers['pragma'] = 'no-cache';
                            req.continue((res) => {
                                res.headers['cache-control'] = 'no-store'; // Assegura que o cache também seja desabilitado na resposta
                                return res;
                            })
                        }).as('gT');
                        // click on a random date
                        cy.get(`[data-day='${date}']`).click();
                        // getting the interception
                        cy.wait('@gT').then((interception) => {
                            // if no have tasks
                            if(interception.response.body.message){
                                cy.get('#task-list').should('exist').and('be.visible');
                                cy.get('#p').should('contain.text', 'Sem tarefas para este dia')
                            } else {
                                const tarefas = interception.response.body;
                                // it filter tasks if have descriptions
                                const tarefasComDescricao = tarefas.filter((tarefa) => tarefa.description.trim() !== '');
                                const tarefaMaisCedoDepoisDoDel = tarefasComDescricao.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                                // ckeck if the task was deleted
                                expect(task.title).to.not.equal(tarefaMaisCedoDepoisDoDel.title);
                                expect(task.description).to.not.equal(tarefaMaisCedoDepoisDoDel.description);
                                expect(task.date).to.not.equal(tarefaMaisCedoDepoisDoDel.date);
                            }
                        })
                    }
                    // click
                    cy.get('button.edit-btn').first().click()

                    cy.url().should('include', '/tarefa/editar')
                    // checking if the task´s data was correctly added 
                    taskValidation(task)
                    // editing the task
                    cy.get('#title').clear().type('jooj')
                    cy.get('#description').clear().type('english')
                    cy.get('#hour').select('00',{ force: true })
                    cy.get('#minute').select('00',{ force: true })
                    // submit
                    cy.get('form > .btn').click()
                    cy.url().should('include', '/')
                    // navigate
                    navigateToJanuary()    
                    cy.wait(1000)
                    // intercepting 
                    cy.intercept('GET', `/tarefas*`, (req) => {
                        // prevent erro 304 NOT DEFINED
                        req.headers['cache-control'] = 'no-cache';
                        req.headers['pragma'] = 'no-cache';
                        req.continue((res) => {
                            res.headers['cache-control'] = 'no-store'; // Assegura que o cache também seja desabilitado na resposta
                            return res;
                        })
                    }).as('getTasks');      
                    // click on a random date  
                    cy.get(`[data-day='${date}']`).click();
                    // getting the intercept
                    cy.wait('@getTasks').then((interception) => {
                        // extracting the tasks
                        const tarefas = interception.response.body;
                        // filter teh tasks with descriptions
                        const tarefasComDescricao = tarefas.filter((tarefa) => tarefa.description.trim() !== '');
                        const tarefaMaisCedoDepois = tarefasComDescricao.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                        // checking if the task was edited
                        expect(tarefaMaisCedoDepois.title).to.not.equal(task.title, 'O título foi alterado');
                        expect(tarefaMaisCedoDepois.description).to.not.equal(task.description, 'A descrição foi alterada');
                        expect(tarefaMaisCedoDepois.date).to.not.equal(task.date, 'A data foi alterada');
                        // delete button tests
                        deleteButton(tarefaMaisCedoDepois) 
                    })
                }
                // verify title
                cy.get('#task-list-title')
                    .should('contain.text', `Lista de Tarefas para o dia ${date}, de Janeiro, de 2025`);
                // if tasks exist, validate the structure dinamically
                cy.get('li.task-item').should('have.length.greaterThan', 0).first().within(() => {
                    // validate the time of the first task
                    cy.get('span').first().invoke('text').then((hour) => {
                        expect(hour).to.match(/\d{2}:\d{2}/); 
                    });
                    // validate the task title 
                    cy.get('span').eq(1).invoke('text').then((text) => {
                        expect(text).to.not.be.empty; 
                    })
                    // validate the buttons
                    cy.get('button.delete-btn').should('exist').and('have.text', '🗑️');
                    cy.get('button.edit-btn').should('exist').and('have.text', '✏️'); 
                });
                // when exist description on the first task
                if (task) {
                    cy.get('button.description-btn').first().click()
                    cy.get('.modal-content > p').should('exist').and('not.be.empty')
                    cy.get('.close-btn').should('contain.text', 'Voltar').click()
                }
                // edit and delete button tests
                editButton()
            }
            // interface tests
            UI_Tests()
            // acessing the nova tarefa
            cy.get('#navbarNav').contains('Nova Tarefa').click()
            cy.url().should('include', '/tarefa/add');
            // creating a new tasks
            cy.get('#title').type('programar')
            cy.get('#description').type('criar test e2e no projeto')
            cy.get('#hour').select('00',{ force: true })
            cy.get('#minute').select('01',{ force: true })
            cy.get('#year').select('2025',{ force: true })
            cy.get('#month').select('0',{ force: true })
            cy.get('#day').select(`${10}`,{ force: true })
            // submit 
            cy.get('form > .btn').click()
            cy.url().should('include', '/')
            // navigate
            navigateToJanuary()
            // wait 
            cy.wait(1000)
            // Intercepting
            cy.intercept('GET', `/tarefas*`, (req) => {
                req.continue((res) => {
                    res.headers['cache-control'] = 'no-store'; // Desabilita o cache para o fetch ocorrer sempre
                    return res;
                });
            }).as('getTarefas');
            // click in a random date
            cy.get(`[data-day='${10}']`).click(); 
            // Intercepta a requisição e armazena a tarefa mais cedo
            cy.wait('@getTarefas').then((interception) => {
                if(interception.response.body.message){
                    cy.get('#task-list').should('exist').and('be.visible');
                    cy.get('#p').should('contain.text', 'Sem tarefas para este dia')
                } else {
                    const tarefas = interception.response.body;
                    const tarefasComDescricao = tarefas.filter((tarefa) => tarefa.description.trim() !== '');
                    const tarefaMaisCedo = tarefasComDescricao.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
                    // cy.log(`Tarefa mais cedo com descrição: ${JSON.stringify(tarefaMaisCedo, null, 2)}`);
                    taskTest(tarefaMaisCedo, 10);
                }
            });
            // logout account
            cy.get('.btn').click()
            cy.get('.alert').should('be.visible').and('have.text', 'Conta Deslogada!')
        });
       
    })
    function UI_Tests() {
        // stores the current date
        const today = new Date().getDate()
        let currentMonth = new Date().getMonth()
        let currentYear = new Date().getFullYear()
        let day = 9
        if(day == today) day = 11
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        // check a month title
        cy.get('#month-title').should('exist').and('have.text', `Calendário de ${monthNames[currentMonth]} ${currentYear}`)
        // come back a month
        cy.get('#btn-lastMonth').click()
        // come back a year
        if (currentMonth === 0) {
            currentMonth = 11; // mês atual recebe dezembro
            currentYear--; // Se o mês for menor que 0, volta para dezembro e subtrai 1 do ano
        } else {
            currentMonth--;
        }
        cy.get('#month-title').should('exist').and('have.text', `Calendário de ${monthNames[currentMonth]} ${currentYear}`)
        // advance a month
        cy.get('#btn-nextMonth').click()
        // advance a year
        if (currentMonth === 11) {
            currentMonth = 0; // mês atual recebe dezembro
            currentYear++; // Se o mês for menor que 0, volta para dezembro e subtrai 1 do ano
        } else {
            currentMonth++;
        }
        cy.get('#month-title').should('exist').and('have.text', `Calendário de ${monthNames[currentMonth]} ${currentYear}`)
        // Locate the div with the current day's number and check it has the correct class for today's date
        cy.get('#calendar.calendar').contains(today) .should('have.class', 'day today') 
        // when clicking on a day, check if it has the correct class
        cy.get(`[data-day="${day}"]`).click()
        cy.get(`[data-day="${day}"]`).should('have.class', 'day selected')
    }
})