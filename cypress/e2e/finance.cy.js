// assertions - https://docs.cypress.io/app/references/assertions
// npx cypress run --spec "cypress/e2e/test1.cy.js" // para renderizar um test especifico
// npx cypress run --spec "cypress\e2e\taskapp/*" // roda todos os arquivos da pasta especifica

describe("transações", () => {
    // hook
    beforeEach(() => {
        // antes de cada test ele acessa o site
        cy.visit('https://devfinance-agilizei.netlify.app/#')
    })
    it('entradas', () => {
        // cria uma nova transação
        newTransaction('freelancer', 150, '2024-04-12')
        newTransaction('salario', 800, '2025-01-05')
        // pega um description que contenha um valor especifico e espera que o elemento tenha um texto especifico
        cy.contains('.description', 'freelancer').should("have.text", 'freelancer')
    })
    it('Saida', () => {
        newTransaction('pizza', -30, '2024-12-30')
        cy.get('.description').should("have.text", 'pizza')
    })
    it('excluir transação', () => {
        newTransaction('pizza', -30, '2024-12-30')
        newTransaction('jooj', 30, '2024-12-30')
        // acessa pizza se move até o pai do elemento, procura o elemento imagem (excluir) e faz um click
        cy.contains(".description", 'pizza').parent().find('img').click()
        // verifica se existe apenas 1 transação na tela
        cy.get('tbody tr').should('have.length', 1)
    })
})
function newTransaction(description, value, date) {
    // procura o elemento nova transação e faz um click
    cy.contains('Nova Transação').click()
    // pega o campo input e digita um valor
    cy.get('#description').type(description)
    cy.get('#amount').type(value)
    cy.get('#date').type(date)
    // finaliza a transação -  cy.get('button').click()
    cy.contains('button', 'Salvar').click() // seleciona o botao salvar
}