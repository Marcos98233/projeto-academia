/**
 * Servidor backend para registro e login de usuários
* Utiliza Express, PostgreSQL, bcrypt, JWT e CORS
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configurar pool de conexões do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: '*', // Ajuste à origem do seu frontend em produção
}));
app.use(express.json());

// Função utilitária para gerar token JWT
function generateToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, userType: user.user_type },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// ponto final do registro
app.post('/register', async (req, res) => {
  const { nome, email, telefone, plano, password } = req.body;

  if (!nome || !email || !telefone || !plano || !password) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verifique se o usuário já existe
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Usuário já cadastrado com este e-mail.' });
    }

    //Hash senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir na tabela de usuários
    const userInsert = await pool.query(
      `INSERT INTO users (email, password_hash, user_type) 
       VALUES ($1, $2, $3) RETURNING user_id`,
      [email, passwordHash, 'Aluno']
    );
    const userId = userInsert.rows[0].user_id;

    // Inserir na tabela de alunos
    await pool.query(
      `INSERT INTO students (user_id, name, phone, plan) 
       VALUES ($1, $2, $3, $4)`,
      [userId, nome, telefone, plano]
    );

    return res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso.' });
  } catch (error) {
    console.error('Error in /register:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Login ponto final
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Encontrar usuário por e-mail
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];

    // Compare senha hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    // Gerar token JWT
    const token = generateToken(user);

    return res.json({ success: true, token, message: 'Login realizado com sucesso.' });
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Endpoint de verificação de integridade
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//Iniciar servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});