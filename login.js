ocument.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission
    const email = document.getElementById('login').value;
    const password = document.getElementById('senha').value;
    const errorMessageDiv = document.getElementById('mensagem-erro');
    // Clear previous error messages
    errorMessageDiv.textContent = '';
    try {
        // Send login data to the backend API
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
        // Handle successful login
        if (data.success) {
            // Redirect or perform actions on successful login
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        } else {
            throw new Error(data.message || 'Erro desconhecido.');
        }
    } catch (error) {
        // Display error message
        errorMessageDiv.textContent = error.message;
    }
});