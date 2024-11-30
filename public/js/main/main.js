// Ocultar loader e liberar rolagem quando a página carregar
window.addEventListener('load', () => {
    document.body.classList.remove('no-scroll');
    document.body.classList.add('loaded'); // Oculta o loader
});

// Ocultar mensagens flash após o tempo determinado
window.addEventListener('DOMContentLoaded', () => {
    // Ocultar todas as mensagens de sucesso
    const successMessages = document.querySelectorAll('.successMsg');
    successMessages.forEach((message) => {
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000); // Oculta após 2 segundos
    });

    // Ocultar todas as mensagens de erro
    const errorMessages = document.querySelectorAll('.errorMsg');
    errorMessages.forEach((message) => {
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000); // Oculta após 3 segundos
    });
});