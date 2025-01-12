import {renderTasks} from '/js/index/taskRender.mjs' // renderizar as tarefas
// gera o calendario
function generateCalendar() {
    const calendarElement = document.getElementById('calendar');
    // calculando os dias do mes
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstDayOfWeek = firstDay.getDay(); 
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate(); 
    // armazena os dias do mes
    let daysHtml = [];
    // cria os dias da semana (dom, seg...) 
    daysOfWeek.forEach(day => {
        daysHtml.push(`<div class="day-name">${day}</div>`);
    });
    // cria os dias vazios
    for (let i = 0; i < firstDayOfWeek; i++) {
        daysHtml.push('<div class="day"></div>');
    }
    // cria os dias clicaveis, coloca a classe today no dia atual e verifica se o dia foi clicado e adiciona a classe seleced
    for (let day = 1; day <= totalDays; day++) {
        const isToday = day === currentDay ? 'today' : '';
        const isSelected = day === selectedDay ? 'selected' : '';
        daysHtml.push(`
            <div class="day ${isToday} ${isSelected}" data-day="${day}">
                ${day}
            </div>
        `);
    }
    // insere os dias no calendario de forma organizada
    calendarElement.innerHTML = daysHtml.join('');
    // seleciona todos os dias
    const days = document.querySelectorAll('.day');
    // adiciona o click em todos os dias
    days.forEach(day => {
        day.addEventListener('click', () => {
            const dayNumber = day.getAttribute('data-day'); // pega o string numero do dia
            showTasks(Number(dayNumber));// passa o numero do dia
        });
    });
}
// Função para exibir as tarefas do dia selecionado
function showTasks(day) {
    // Armazena o dia selecionado 
    selectedDay = day;
    // atualiza a visualização do calendário
    generateCalendar();
    // pega as tarefas existentes e restaura a pagina
    const taskList = document.getElementById('task-items');
    // caso exista task list limpe a lista
    if(taskList) { taskList.innerHTML = '' }
    // Formata a data desejada (ajuste conforme necessário)
    const selectedDate = new Date(currentYear, currentMonth, day); // Criando o objeto Date
    // Formata a data para o formato ISO 8601 (como 2024-11-15T19:37:00.000Z)
    const isoDate = selectedDate.toISOString();
    // buscando tarefas para o dia especifico
    fetch(`/tarefas?data=${isoDate}`)
        .then(response => {
            if (!response.ok) { // Se a resposta não for ok (status diferente de 2xx)
                return response.json().then(err => { // Aqui você captura o corpo da resposta de erro
                    // Caso não haja tarefas
                    document.getElementById('task-list-title').innerText = ''
                    document.getElementById('p').innerText = 'Sem tarefas para este dia'
                    throw new Error(err.message || 'Erro desconhecido'); // Lança o erro com a mensagem do servidor
                });
            }
            return response.json()
        })
        .then(tasks => { 
            renderTasks(tasks, taskList); // file:///c:/nodejs/taskApp/public/js/index/taskRender.mjs
            document.getElementById('p').innerText = ''
            // Atualiza o título da lista de tarefas
            const taskListTitle = document.getElementById('task-list-title');
            const monthName = monthNames[currentMonth];
            const year = currentYear;
            taskListTitle.textContent = `Lista de Tarefas para o dia ${day}, de ${monthName}, de ${year}`;
        }) 
        .catch(error => console.error('Erro:', error));
}
// Função para atualizar o título do mês
function updateMonthTitle() {
    const monthTitle = document.getElementById('month-title');
    monthTitle.textContent = `Calendário de ${monthNames[currentMonth]} ${currentYear}`;
}
// Função para mudar o mês
function changeMonth(offset) {
    currentMonth += offset;
    // caso mude de ano
    if (currentMonth < 0) {
        currentMonth = 11; // mês atual recebe dezembro
        currentYear--; // Se o mês for menor que 0, volta para dezembro e subtrai 1 do ano
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++; // Se o mês for maior que 11, volta para janeiro e adiciona 1 ao ano
    }
    // Atualiza o título do mês
    updateMonthTitle(); 
    // Gera o calendário para o novo mês
    generateCalendar(); 
}
// armazena a data atual
let currentYear = new Date().getFullYear(); // Ano atual
let currentMonth = new Date().getMonth(); // Mês atual (0-11)
let currentDay = new Date().getDate(); // Dia atual
let selectedDay = null; // Armazena o dia selecionado
// armazena os nomes do mes e da semana
const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
// alternar os meses
document.getElementById('btn-lastMonth').addEventListener('click', () => changeMonth(-1))
document.getElementById('btn-nextMonth').addEventListener('click', () => changeMonth(1))
// Inicialização
updateMonthTitle(); // Atualiza o título do mês
generateCalendar(); // Gera o calendário
document.addEventListener('DOMContentLoaded', () => {
    showTasks(currentDay); // Exibe as tarefas do dia atual
})