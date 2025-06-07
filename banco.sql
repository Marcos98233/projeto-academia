-- SQL script to create database schema for login and student registration

-- Table for user accounts (for login)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL DEFAULT 'Aluno',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for student profile information
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    plan VARCHAR(50) NOT NULL CHECK (plan IN ('Básico', 'Premium', 'Black')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by email in users table
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Optional: Trigger to update updated_at on row update
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

-- Notes:
-- Store password as hashed values (e.g. bcrypt) in password_hash
-- user_type can be extended for roles other than 'Aluno' if needed
-- The 'students' table links one-to-one with 'users' table
