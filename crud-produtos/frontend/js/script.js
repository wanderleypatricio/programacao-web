const apiUrl = 'http://localhost:3000/produtos'; // URL da API
    const token = localStorage.getItem('token');
    console.log(token);
// Verificar se o usuário está autenticado
document.addEventListener('DOMContentLoaded', () => {
    const paginasPublicas = ['login.html', 'register.html'];
    const paginaAtual = window.location.pathname.split('/').pop();

    if (!paginasPublicas.includes(paginaAtual)) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        carregarProdutos(); // somente se logado e não for página pública
    }
});

// Carregar produtos ao carregar a página
document.addEventListener('DOMContentLoaded', carregarProdutos);

// Referências aos elementos DOM
var form = document.getElementById("produto-form");
const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const descricaoInput = document.getElementById('descricao');
const produtoIdInput = document.getElementById('produto-id');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const tabelaCorpo = document.querySelector('#produtos-tabela tbody');

// Carregar a lista de produtos
function carregarProdutos() {
    fetch(apiUrl, {
        method:'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(produtos => {
            console.log(produtos);
            tabelaCorpo.innerHTML = ''; // Limpa a tabela
            produtos.forEach(produto => {
                adicionarProdutoNaTabela(produto);
            });
        })
        .catch(function (error) { console.log('Erro ao carregar produtos:' + error) });
}

// Adicionar produto na tabela
function adicionarProdutoNaTabela(produto) {
    const row = document.createElement('tr');
    const primeiraImagem = produto.imagens && produto.imagens.length > 0 
        ? `<img src="http://localhost:3000${produto.imagens[0]}" width="100">` 
        : '';
    row.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.preco}</td>
        <td>${produto.descricao}</td>
        <td>
            ${primeiraImagem}
        </td>
        <td>
            <button class="action-btn edit-btn" 
            onclick="editarProduto(${produto.id})">Editar</button>
            <button class="action-btn delete-btn" 
            onclick="deletarProduto(${produto.id})">Excluir</button>
        </td>
    `;
    tabelaCorpo.appendChild(row);
}

// Enviar formulário (Cadastrar ou Atualizar)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const produto = {
        nome: nomeInput.value,
        preco: parseFloat(precoInput.value),
        descricao: descricaoInput.value
    };

    const produtoId = produtoIdInput.value;

    if (produtoId) {
        atualizarProduto(produtoId, produto);
    } else {
        cadastrarProduto(produto);
    }
});

// Cadastrar novo produto
async function cadastrarProduto(produto) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(produto)
    });

    const produtodb = await response.json();

    // 2º: Enviar imagens
    const formData = new FormData();
    const imagens = document.getElementById('imagens').files;
    for (let img of imagens) {
        formData.append('imagens', img);
    }

    await fetch(`${apiUrl}/${produtodb.id}/imagens`, {
        method: 'POST',
        body: formData
    });

    alert('Produto cadastrado com imagens!');
    form.reset();
    carregarProdutos();
}

// Editar produto
function editarProduto(id) {
    fetch(`${apiUrl}/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(produto => {
            produtoIdInput.value = produto.id;
            nomeInput.value = produto.nome;
            precoInput.value = produto.preco;
            descricaoInput.value = produto.descricao;

            submitBtn.textContent = 'Atualizar';
            resetBtn.classList.remove('hidden');
        })
        .catch(error => console.error('Erro ao buscar produto:', error));
}

// Atualizar produto
function atualizarProduto(id, produto) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(produto)
    })
        .then(response => response.json())
        .then(produtoAtualizado => {
            carregarProdutos();
            form.reset();
            produtoIdInput.value = '';
            submitBtn.textContent = 'Cadastrar';
            resetBtn.classList.add('hidden');
        })
        .catch(error => console.error('Erro ao atualizar produto:', error));
}

// Deletar produto
function deletarProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                carregarProdutos();
            })
            .catch(error => console.error('Erro ao excluir produto:', error));
    }
}

document.getElementById('btnLogout').addEventListener('click', () => {
    // Limpa o token de autenticação
    localStorage.removeItem('token');

    // Redireciona para a tela de login
    window.location.href = 'login.html';
});

// Resetar formulário ao cancelar edição
resetBtn.addEventListener('click', () => {
    form.reset();
    produtoIdInput.value = '';
    submitBtn.textContent = 'Cadastrar';
    resetBtn.classList.add('hidden');
});