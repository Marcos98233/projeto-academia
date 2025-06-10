document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impedir o envio do formulário padrão
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const plano = document.getElementById('plano').value;
    const mensagemCadastroDiv = document.getElementById('mensagem-cadastro');
    //Limpa mensagens anteriores
    mensagemCadastroDiv.textContent = '';
    try {
        // Enviar dados de registro para a API de backend
        const response = await fetch('https://your-backend-api.com/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, telefone, plano }),
        });
        if (!response.ok) {
            throw new Error('Cadastro falhou. Tente novamente.');
        }
        const data = await response.json();
        // Lida com registro bem-sucedido
        if (data.success) {
            mensagemCadastroDiv.textContent = 'Cadastro realizado com sucesso!';
            mensagemCadastroDiv.className = 'success-message'; // Adicione uma classe para estilização
            document.getElementById('cadastroForm').reset();//Reseta o formulário
        } else {
            throw new Error(data.message || 'Erro desconhecido.');
        }
    } catch (error) {
        //Mostra mensagem de erro
        mensagemCadastroDiv.textContent = error.message;
        mensagemCadastroDiv.className = 'error-message'; // Adicione uma classe para estilização
    }
});