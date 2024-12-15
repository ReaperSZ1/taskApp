import {renderTasks} from '/js/index/taskRender.mjs' // renderizar as tarefas

let currentYear = new Date().getFullYear(); // Ano atual
let currentMonth = new Date().getMonth(); // Mês atual (0-11)
let currentDay = new Date().getDate(); // Dia atual
let selectedDay = null; // Armazena o dia selecionado

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function generateCalendar() {
    const calendarElement = document.getElementById('calendar');
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstDayOfWeek = firstDay.getDay(); 
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate(); 

    let daysHtml = [];

    daysOfWeek.forEach(day => {
        daysHtml.push(`<div class="day-name">${day}</div>`);
    });

    for (let i = 0; i < firstDayOfWeek; i++) {
        daysHtml.push('<div class="day"></div>');
    }

    for (let day = 1; day <= totalDays; day++) {
        const isToday = day === currentDay ? 'today' : '';
        const isSelected = day === selectedDay ? 'selected' : '';
        daysHtml.push(`
            <div class="day ${isToday} ${isSelected}" data-day="${day}">
                ${day}
            </div>
        `);
    }
    
    calendarElement.innerHTML = daysHtml.join('');

    // ao clicar em um dia ele chama showtasks com o dia selecionado
    const days = calendarElement.querySelectorAll('.day');
    days.forEach(day => {
        day.addEventListener('click', () => {
            const dayNumber = day.getAttribute('data-day');
            showTasks(Number(dayNumber)); // Passa o número do dia
        });
    });
}

// Função para exibir as tarefas do dia selecionado
function showTasks(day) {
    // Armazena o dia selecionado e atualiza a visualização do calendário
    selectedDay = day;
    generateCalendar();

    // Atualiza o título da lista de tarefas
    const taskListTitle = document.getElementById('task-list-title');
    const monthName = monthNames[currentMonth];
    const year = currentYear;

    const taskList = document.getElementById('task-items');
    taskList.innerHTML = ''

    // Formata a data desejada (ajuste conforme necessário)
    const selectedDate = new Date(currentYear, currentMonth, day); // Criando o objeto Date

    // Formata a data para o formato ISO 8601 (como 2024-11-15T19:37:00.000Z)
    const isoDate = selectedDate.toISOString();

    // buscando tarefas para o dia especifico
    fetch(`/tarefas?data=${isoDate}`) // quero modularizar tudo isso
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

    updateMonthTitle(); // Atualiza o título do mês
    generateCalendar(); // Gera o calendário para o novo mês
}

// alternar os meses
document.getElementById('btn-lastMonth').addEventListener('click', () => changeMonth(-1))
document.getElementById('btn-nextMonth').addEventListener('click', () => changeMonth(1))

// Inicialização
updateMonthTitle(); // Atualiza o título do mês
generateCalendar(); // Gera o calendário
showTasks(currentDay); // Exibe as tarefas do dia atual