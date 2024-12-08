export function renderTasks(tasks, taskListElement) {
    // Ordenar tarefas por hora (crescente)
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

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

        // Adicionar botão de visualização da descrição se existir descrição
        if (task.description) {
            const descriptionBtn = document.createElement('button');
            descriptionBtn.classList.add('description-btn');
            descriptionBtn.innerHTML = '📓'; // Emoji de caderno
            descriptionBtn.style.marginLeft = '10px'; // Espaço à esquerda do botão
            descriptionBtn.type = 'button'; // Tipo de botão para evitar submeter o formulário

             // Exibir descrição ao clicar no botão
            descriptionBtn.addEventListener('click', function() {
                // Criar o modal de descrição
                const modal = document.createElement('div');
                modal.classList.add('modal');

                // Criar o bloco de conteúdo da descrição
                const modalContent = document.createElement('div');
                modalContent.classList.add('modal-content');

                // Adicionar o conteúdo da descrição
                const descriptionText = document.createElement('p');
                descriptionText.textContent = task.description;
                modalContent.appendChild(descriptionText);

                // Criar o botão de voltar
                const closeBtn = document.createElement('button');
                closeBtn.textContent = 'Voltar';
                closeBtn.classList.add('close-btn');

                // Fechar o modal ao clicar no botão
                closeBtn.addEventListener('click', function() {
                    document.body.removeChild(modal); // Remove o modal da página
                });

                modalContent.appendChild(closeBtn);

                // Adicionar o conteúdo e o modal ao corpo da página
                modal.appendChild(modalContent);
                document.body.appendChild(modal);
            });
            taskItem.appendChild(descriptionBtn);

            // Mover o texto da tarefa para a direita
            taskText.style.marginLeft = '50px'; // Adiciona um pequeno deslocamento à esquerda do texto
        }

        // Formulário de exclusão
        const deleteForm = document.createElement('form');
        deleteForm.action = `/tarefa/deletar`;
        deleteForm.method = 'POST';
        deleteForm.classList.add('delete-form');

        const delHidInput = document.createElement('input');
        delHidInput.type = 'hidden';
        delHidInput.name = 'token';
        delHidInput.value = task.token;

        deleteForm.appendChild(delHidInput);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.type = 'submit';
        deleteBtn.innerHTML = '🗑️';

        deleteForm.appendChild(deleteBtn);
        taskItem.appendChild(deleteForm);

        // Formulário de edição
        const editForm = document.createElement('form');
        editForm.action = `/tarefa/editar`;
        editForm.method = 'get';
        editForm.classList.add('edit-form');

        const editHidInput = document.createElement('input');
        editHidInput.type = 'hidden';
        editHidInput.name = 'token';
        editHidInput.value = task.token;

        editForm.appendChild(editHidInput);

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
}
