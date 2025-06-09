ocument.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impedir o envio do formulário padrão
    const email = document.getElementById('login').value;
    const password = document.getElementById('senha').value;
    const errorMessageDiv = document.getElementById('mensagem-erro');
    // Limpar mensagens de erro anteriores
    errorMessageDiv.textContent = '';
    try {
        // Enviar dados de login para a API de backend
        const response = await fetch('https://your-backend-api.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error('Login falhou. Verifique suas credenciais.');
             }
        const data = await response.json();
        // Lidar com login bem sucedido
        if (data.success) {
            // Redirecionar ou executar ações em caso de login bem-sucedido
            window.location.href = 'dashboard.html'; // Redirecionar para o painel

        } else {
            throw new Error(data.message || 'Erro desconhecido.');
        }
    } catch (error) {
        //Mostra mensagem de erro
        errorMessageDiv.textContent = error.message;
    }
});