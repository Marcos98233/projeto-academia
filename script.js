/**
 * Backend server for user registration and login
 * Uses Express, PostgreSQL, bcrypt, JWT, and CORS
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Setup PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: '*', // Adjust to your frontend origin in production
}));
app.use(express.json());

// Utility function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, userType: user.user_type },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// Registration endpoint
app.post('/register', async (req, res) => {
  const { nome, email, telefone, plano, password } = req.body;

  if (!nome || !email || !telefone || !plano || !password) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Check if user already exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Usuário já cadastrado com este e-mail.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert into users table
    const userInsert = await pool.query(
      `INSERT INTO users (email, password_hash, user_type) 
       VALUES ($1, $2, $3) RETURNING user_id`,
      [email, passwordHash, 'Aluno']
    );
    const userId = userInsert.rows[0].user_id;

    // Insert into students table
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

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];

    // Compare password hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.json({ success: true, token, message: 'Login realizado com sucesso.' });
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});