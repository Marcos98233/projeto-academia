-- Script SQL para criar esquema de banco de dados para login e registro de alunos

-- Tabela para contas de usuários (para login)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL DEFAULT 'Aluno',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para informações do perfil do aluno
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('Básico', 'Premium', 'Black')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para consultas mais rápidas por e-mail na tabela de usuários
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Opcional: gatilho para atualizar updated_at na atualização da linha
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_modtime BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER students_update_modtime BEFORE UPDATE ON students
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Observações:
-- Armazene a senha como valores hash (por exemplo, bcrypt) em password_hash
-- user_type pode ser estendido para funções diferentes de "Aluno", se necessário
-- A tabela "students" vincula-se diretamente à tabela "users"