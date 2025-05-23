const apiUrl = 'http://localhost:3000/produtos'; // URL da API

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

    fetch(apiUrl)
        .then(response => response.json())
        .then(produtos => {
            tabelaCorpo.innerHTML = ''; // Limpa a tabela
            produtos.forEach(produto => {
                adicionarProdutoNaTabela(produto);
            });
        })
        .catch(function(error) { console.log('Erro ao carregar produtos:'+ error)});    
}

// Adicionar produto na tabela
function adicionarProdutoNaTabela(produto) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.preco}</td>
        <td>${produto.descricao}</td>
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
form.addEventListener('submit', (e) => {
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
function cadastrarProduto(produto) {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(novoProduto => {
        adicionarProdutoNaTabela(novoProduto);
        form.reset();
    })
    .catch(error => console.error('Erro ao cadastrar produto:', error));
}

// Editar produto
function editarProduto(id) {
    fetch(`${apiUrl}/${id}`)
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
            'Content-Type': 'application/json'
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
            method: 'DELETE'
        })
        .then(() => {
            carregarProdutos();
        })
        .catch(error => console.error('Erro ao excluir produto:', error));
    }
}

// Resetar formulário ao cancelar edição
resetBtn.addEventListener('click', () => {
    form.reset();
    produtoIdInput.value = '';
    submitBtn.textContent = 'Cadastrar';
    resetBtn.classList.add('hidden');
});