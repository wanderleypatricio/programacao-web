// login.js
async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    console.log(email, senha);
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) {
            throw new Error('Login inválido');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
}
