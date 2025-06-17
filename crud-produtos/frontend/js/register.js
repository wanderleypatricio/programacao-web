const nomeUser = document.getElementById('nome').value;
const emailUser = document.getElementById('email').value;
const senhaUser = document.getElementById('senha').value;
const mensagemUser = document.getElementById('mensagem');
const erroUser = document.getElementById('erro');

function registrar() {

    fetch(`${apiURL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeUser, emailUser, senhaUser })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao cadastrar. Verifique os dados.');
            }
            return response.json();
        })
        .then(data => {
            mensagem.textContent = 'Usuário cadastrado com sucesso!';
            erro.textContent = '';
        })
        .catch(err => {
            mensagem.textContent = '';
            erro.textContent = err.message;
        });
}
