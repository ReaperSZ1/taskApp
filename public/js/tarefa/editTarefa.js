document.addEventListener("DOMContentLoaded", function() {
    const monthSelect = document.getElementById('month');
    const yearSelect = document.getElementById('year');
    const daySelect = document.getElementById('day');
    const hourSelect = document.getElementById('hour');
    const minuteSelect = document.getElementById('minute');

    const date = new Date();
    const currentDay = date.getDate();
    const currentMonth = date.getMonth(); // Mês é 0-indexado (0 = Janeiro)
    const currentYear = date.getFullYear();

    // Preencher o campo "Ano" com o ano atual e alguns próximos anos
    const yearRange = 5; // Número de anos futuros para incluir
    for (let i = currentYear; i <= currentYear + yearRange; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option); // cria os options e coloca no select year
    }

    // Preencher o campo "Mês" com os meses do ano
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Preencher o campo "Hora" com as opções de 00 a 23
    for (let i = 0; i < 24; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i < 10 ? `0${i}` : i;
        hourSelect.appendChild(option);
    }

    // Preencher o campo "Minuto" com as opções de 00 a 59
    for (let i = 0; i < 60; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i < 10 ? `0${i}` : i;
        minuteSelect.appendChild(option);
    }
    
    // Divida a data da tarefa no formato YYYY-MM-DD
    const tD = document.getElementById('task.date').value
    const taskDate = new Date(tD); // Substitua pela data real que vem do backend
    const taskMinute = taskDate.getMinutes();
    const taskHour = taskDate.getHours();
    const taskDay = taskDate.getDate();
    const taskMonth = taskDate.getMonth();
    const taskYear = taskDate.getFullYear();

    // Defina os valores dos selects com a data da tarefa
    yearSelect.value = taskYear;
    monthSelect.value = taskMonth;
    populateDays(taskMonth, taskYear); // Popule os dias com base no mês e ano
    daySelect.value = taskDay;
    hourSelect.value = taskHour;
    minuteSelect.value = taskMinute;

// Função para atualizar o número de dias com base no mês e no ano
    function populateDays(month, year) {
        // calcular o número de dias em um mês específico de um determinado ano.
        const daysInMonth = new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
        daySelect.innerHTML = '<option value="" disabled selected>Dia</option>'; // Limpar opções anteriores
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }

    populateDays(currentMonth, currentYear);
    daySelect.value = taskDay;

    // Atualizar campo oculto de data no formato desejado
    function updateHiddenDateField() {
        const selectedDay = parseInt(daySelect.value);
        const selectedMonth = parseInt(monthSelect.value);
        const selectedYear = parseInt(yearSelect.value);
        const selectedHour = parseInt(hourSelect.value);
        const selectedMinute = parseInt(minuteSelect.value);
        // sanitização
        if (
            !isNaN(selectedDay) && !isNaN(selectedMonth) && !isNaN(selectedYear) &&
            !isNaN(selectedHour) && !isNaN(selectedMinute)
        ) {
            const formattedDate = new Date(selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute);

            // Validação extra para evitar datas inválidas
            if (!isNaN(formattedDate.getTime())) {
                document.getElementById("date").value = formattedDate.toISOString();
            } else {
                console.error("Data inválida gerada no frontend");
            }
        } else {
            console.error("Entradas inválidas no formulário");
        }
    }


    // Adicionar ouvintes de eventos para atualizar a data oculta
    [daySelect, monthSelect, yearSelect, hourSelect, minuteSelect].forEach(element => {
        element.addEventListener("change", updateHiddenDateField);
    });

    monthSelect.addEventListener("change", () => populateDays(monthSelect.value, yearSelect.value));
    yearSelect.addEventListener("change", () => populateDays(monthSelect.value, yearSelect.value));

    updateHiddenDateField()
});