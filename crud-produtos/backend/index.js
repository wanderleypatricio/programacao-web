const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const SECRET = 'minha-chave-secreta'; // Em produção, use uma variável de ambiente

// Servir as imagens estaticamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sua senha do MySQL
    database: 'produtos_db'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

// Middleware de autenticação
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    jwt.verify(token, SECRET, (err, usuario) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.usuario = usuario;
        next();
    });
}

// Rota para registrar usuário
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    const hashedPassword = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao registrar' });
        res.status(201).json({ id: result.insertId, nome, email });
    });
});

// Rota de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no login' });
        if (results.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ error: 'Senha inválida' });

        const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// CRUD de Produtos (protegido por autenticação)

// Criar produto
app.post('/produtos', autenticarToken, (req, res) => {
    const { nome, preco, descricao } = req.body;
    const sql = 'INSERT INTO produtos (nome, preco, descricao) VALUES (?, ?, ?)';
    db.query(sql, [nome, preco, descricao], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ id: result.insertId, nome, preco, descricao });
    });
});

// Listar produtos
app.get('/produtos', (req, res) => {
    const sql = `
        SELECT 
    p.*, 
    GROUP_CONCAT(i.caminho) AS imagens
FROM produtos p
LEFT JOIN imagens_produto i ON p.id = i.produto_id
GROUP BY p.id
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        results.forEach(prod => {
            try {
                prod.imagens = JSON.parse(prod.imagens);
            } catch {
                prod.imagens = [];
            }
        });
        res.json(results);
    });
});


// Buscar produto por ID
app.get('/produtos/:id', autenticarToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM produtos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.status(200).json(result[0]);
    });
});

// Atualizar produto
app.put('/produtos/:id', autenticarToken, (req, res) => {
    const { id } = req.params;
    const { nome, preco, descricao } = req.body;
    const sql = 'UPDATE produtos SET nome = ?, preco = ?, descricao = ? WHERE id = ?';
    db.query(sql, [nome, preco, descricao, id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.status(200).json({ id, nome, preco, descricao });
    });
});

// Deletar produto
app.delete('/produtos/:id', autenticarToken, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM produtos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.status(204).send();
    });
});

app.post('/produtos/:id/imagens', upload.array('imagens', 5), (req, res) => {
    const produtoId = req.params.id;
    const arquivos = req.files;

    if (!arquivos || arquivos.length === 0) {
        return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
    }

    const valores = arquivos.map(file => [produtoId, `/uploads/${file.filename}`]);
    const sql = 'INSERT INTO imagens_produto (produto_id, caminho) VALUES ?';

    db.query(sql, [valores], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.status(201).json({ mensagem: 'Imagens adicionadas com sucesso!' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
