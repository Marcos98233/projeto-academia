document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const plano = document.getElementById('plano').value;
    const mensagemCadastroDiv = document.getElementById('mensagem-cadastro');
    // Clear previous messages
    mensagemCadastroDiv.textContent = '';
    try {
        // Send registration data to the backend API
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
        // Handle successful registration
        if (data.success) {
            mensagemCadastroDiv.textContent = 'Cadastro realizado com sucesso!';
            mensagemCadastroDiv.className = 'success-message'; // Add a class for styling
            document.getElementById('cadastroForm').reset(); // Reset the form
        } else {
            throw new Error(data.message || 'Erro desconhecido.');
        }
    } catch (error) {
        // Display error message
        mensagemCadastroDiv.textContent = error.message;
        mensagemCadastroDiv.className = 'error-message'; // Add a class for styling
    }
});