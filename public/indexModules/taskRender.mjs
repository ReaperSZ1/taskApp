export function renderTasks(tasks, taskListElement) {
    // Ordenar tarefas por hora (crescente)
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (tasks.length > 0) {
        tasks.forEach(task => {
            // Criar item de tarefa
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            taskItem.style.display = 'flex'; // Ativa layout flexível
            taskItem.style.alignItems = 'center'; // Alinha verticalmente
            taskItem.style.justifyContent = 'space-between'; // Espaço entre os itens

            // Exibir horário no canto esquerdo
            const taskTime = document.createElement('span');
            const taskDate = new Date(task.date);
            taskTime.textContent = taskDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            taskTime.style.marginRight = 'auto'; // Posiciona à esquerda
            taskTime.style.fontWeight = 'bold'; // Destaque para o horário

            taskItem.appendChild(taskTime);

            // Exibir título da tarefa (centralizado)
            const taskText = document.createElement('span');
            taskText.textContent = task.title;
            taskText.style.textAlign = 'center'; // Centraliza internamente
            taskText.style.flex = '1'; // Permite ocupar o espaço disponível
            taskText.style.margin = '0 auto'; // Centraliza horizontalmente

            taskItem.appendChild(taskText);

            // Formulário de exclusão
            const deleteForm = document.createElement('form');
            deleteForm.action = `/tarefa/deletar`;
            deleteForm.method = 'POST';
            deleteForm.classList.add('delete-form');

            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = 'token';
            methodInput.value = task.token;

            deleteForm.appendChild(methodInput);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.type = 'submit';
            deleteBtn.innerHTML = '🗑️';

            deleteForm.appendChild(deleteBtn);
            taskItem.appendChild(deleteForm);

            // Formulário de edição
            const editForm = document.createElement('form');
            editForm.action = `/tarefa/editar/${task.token}`;
            editForm.method = 'get';
            editForm.classList.add('edit-form');

            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.type = 'submit';
            editBtn.innerHTML = '✏️';

            editForm.appendChild(editBtn);
            taskItem.appendChild(editForm);

            // Adicionar tarefa na lista
            taskListElement.appendChild(taskItem);
        });

        // Confirmar exclusão
        taskListElement.querySelectorAll('.delete-form').forEach(form => {
            form.addEventListener('submit', function (event) {
                event.preventDefault(); // Previne o envio imediato do formulário

                const confirmDelete = confirm("Tem certeza que deseja deletar esta tarefa?");
                if (confirmDelete) {
                    form.submit(); // Envia o formulário para a rota especificada no atributo `action`
                }
            });
        });
    } else {
        // Caso não haja tarefas
        taskListElement.innerHTML = '<p>Sem tarefas para este dia.</p>';
    }
}
