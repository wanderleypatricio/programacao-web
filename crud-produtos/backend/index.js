const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

// Configurar a aplicação
const app = express();
const port = 3000;

app.use(cors());
// Configurar o body-parser para processar dados JSON
app.use(bodyParser.json());

// Configurar a conexão com o MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Substitua pelo seu usuário MySQL
    password: '', // Substitua pela sua senha MySQL
    database: 'crudprodutos_db'
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

// Rotas CRUD

// 1. Criar produto (POST)
app.post('/produtos', (req, res) => {
    const { nome, preco, descricao } = req.body;
    const sql = 'INSERT INTO produtos (nome, preco, descricao) VALUES (?, ?, ?)';
    db.query(sql, [nome, preco, descricao], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(201).json({ id: result.insertId, nome, preco, descricao });
    });
});

// 2. Listar todos os produtos (GET)
app.get('/produtos', (req, res) => {
    const sql = 'SELECT * FROM produtos';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(200).json(results);
    });
});

// 3. Buscar produto por ID (GET)
app.get('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM produtos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(200).json(result[0]);
    });
});

// 4. Atualizar produto por ID (PUT)
app.put('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, preco, descricao } = req.body;
    const sql = 'UPDATE produtos SET nome = ?, preco = ?, descricao = ? WHERE id = ?';
    db.query(sql, [nome, preco, descricao, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(200).json({ id, nome, preco, descricao });
    });
});

// 5. Deletar produto por ID (DELETE)
app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM produtos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.status(204).send();
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
