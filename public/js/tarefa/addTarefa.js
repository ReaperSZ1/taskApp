document.addEventListener("DOMContentLoaded", function () {
    const minuteSelect = document.getElementById("minute");
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");
    const hourSelect = document.getElementById("hour");
    const daySelect = document.getElementById("day");
    const hiddenDateInput = document.getElementById("date");

    const date = new Date();
    const currentDay = date.getDate();
    const currentMonth = date.getMonth(); // Mês é 0-indexado (0 = Janeiro)
    const currentYear = date.getFullYear();

    const yearRange = 5; // Número de anos futuros para inclui

    // Preencher o campo "Ano"
    for (let i = currentYear; i <= currentYear + yearRange; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    // Preencher o campo "Mês"
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];

    months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = currentMonth;

    // Preencher o campo "Hora" e "Minuto"
    for (let i = 0; i < 24; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i < 10 ? `0${i}` : i;
        hourSelect.appendChild(option);
    }
    for (let i = 0; i < 60; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i < 10 ? `0${i}` : i;
        minuteSelect.appendChild(option);
    }

    // Função para atualizar os dias
    function populateDays(month, year) {
        const daysInMonth = new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
        daySelect.innerHTML = '<option value="" disabled selected>Dia</option>';
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }

    populateDays(currentMonth, currentYear);
    daySelect.value = currentDay;

    // Função para sanitizr os valores de select 
    function validateSelectValue(value, min, max) {
        const parsedValue = parseInt(value, 10);
        return !isNaN(parsedValue) && parsedValue >= min && parsedValue <= max;
    }

    function updateHiddenDateField() {
        const selectedDay = daySelect.value;
        const selectedMonth = monthSelect.value;
        const selectedYear = yearSelect.value;
        const selectedHour = hourSelect.value;
        const selectedMinute = minuteSelect.value;

        if (
            validateSelectValue(selectedDay, 1, 31) &&
            validateSelectValue(selectedMonth, 0, 11) &&
            validateSelectValue(selectedYear, currentYear, currentYear + yearRange) &&
            validateSelectValue(selectedHour, 0, 23) &&
            validateSelectValue(selectedMinute, 0, 59)
        ) {
            const formattedDate = new Date(
                parseInt(selectedYear, 10),
                parseInt(selectedMonth, 10),
                parseInt(selectedDay, 10),
                parseInt(selectedHour, 10),
                parseInt(selectedMinute, 10)
            );
            hiddenDateInput.value = formattedDate.toISOString();
            console.log(hiddenDateInput.value)
        } else {
            hiddenDateInput.value = "";
        }
    }

    // Eventos
    monthSelect.addEventListener("change", () => populateDays(monthSelect.value, yearSelect.value));
    yearSelect.addEventListener("change", () => populateDays(monthSelect.value, yearSelect.value));

    [daySelect, monthSelect, yearSelect, hourSelect, minuteSelect].forEach((element) => {
        element.addEventListener("change", updateHiddenDateField);
    });

    updateHiddenDateField();
});
