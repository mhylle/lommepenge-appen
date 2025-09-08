-- PostgreSQL Database Initialization Script for Lommepenge App2
-- Creates app2_db database and user with all necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create app2 user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'app2_user') THEN
        CREATE USER app2_user WITH PASSWORD 'app2_secure_password';
        RAISE NOTICE 'Created app2_user with password';
    END IF;
END $$;

-- Create app2_db database
SELECT 'CREATE DATABASE app2_db OWNER app2_user' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'app2_db')\gexec

-- Grant privileges on database
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_database WHERE datname = 'app2_db') THEN
        GRANT ALL PRIVILEGES ON DATABASE app2_db TO app2_user;
        RAISE NOTICE 'Granted privileges on app2_db to app2_user';
    END IF;
END $$;

-- Connect to app2_db to create schema
\c app2_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO app2_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app2_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app2_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app2_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app2_user;

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- LOMMEPENGE APP SCHEMA - Family Pocket Money Management
-- ==============================================

-- Users table - Family members who can log in
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'child' CHECK (role IN ('parent', 'child', 'admin')),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Families table - Family groups
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    currency VARCHAR(3) DEFAULT 'DKK',
    timezone VARCHAR(50) DEFAULT 'Europe/Copenhagen',
    settings JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members relationship table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'child' CHECK (role IN ('parent', 'child')),
    nickname VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_family_user UNIQUE(family_id, user_id)
);

-- Pocket money accounts - Each child has an account
CREATE TABLE IF NOT EXISTS pocket_money_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    balance INTEGER DEFAULT 0, -- Amount in øre (cents)
    currency VARCHAR(3) DEFAULT 'DKK',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_family_user_account UNIQUE(family_id, user_id)
);

-- Transaction categories
CREATE TABLE IF NOT EXISTS transaction_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff', -- Hex color
    icon VARCHAR(50) DEFAULT 'money',
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions - All money movements
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES pocket_money_accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'allowance', 'bonus', 'penalty')),
    amount INTEGER NOT NULL, -- Amount in øre (cents), positive for income, negative for expense
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    
    -- Transfer-specific fields
    from_account_id UUID REFERENCES pocket_money_accounts(id),
    to_account_id UUID REFERENCES pocket_money_accounts(id),
    
    -- Scheduling and recurrence
    scheduled_date DATE,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- Store recurrence rules
    parent_transaction_id UUID REFERENCES transactions(id),
    
    -- Approval workflow
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allowance rules - Automatic pocket money rules
CREATE TABLE IF NOT EXISTS allowance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES pocket_money_accounts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    amount INTEGER NOT NULL, -- Amount in øre (cents)
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    last_processed_date DATE,
    next_payment_date DATE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals - Savings goals for children
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES pocket_money_accounts(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount INTEGER NOT NULL, -- Target amount in øre (cents)
    current_amount INTEGER DEFAULT 0, -- Current saved amount in øre (cents)
    target_date DATE,
    image_url VARCHAR(500),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chores/Tasks - Earn money through tasks
CREATE TABLE IF NOT EXISTS chores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    reward_amount INTEGER DEFAULT 0, -- Reward in øre (cents)
    estimated_minutes INTEGER DEFAULT 30,
    category VARCHAR(100) DEFAULT 'household',
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    age_min INTEGER DEFAULT 5,
    age_max INTEGER DEFAULT 18,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chore assignments and completions
CREATE TABLE IF NOT EXISTS chore_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'verified', 'rejected')),
    notes TEXT,
    completion_photos TEXT[], -- Array of photo URLs
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    transaction_id UUID REFERENCES transactions(id), -- Link to reward transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications and activity feed
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Families indexes
CREATE INDEX IF NOT EXISTS idx_families_created_by ON families(created_by);
CREATE INDEX IF NOT EXISTS idx_families_created_at ON families(created_at);

-- Family members indexes
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members(role);

-- Accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_family_id ON pocket_money_accounts(family_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON pocket_money_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON pocket_money_accounts(is_active);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_scheduled_date ON transactions(scheduled_date);

-- Transaction categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_family_id ON transaction_categories(family_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON transaction_categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON transaction_categories(is_active);

-- Allowance rules indexes
CREATE INDEX IF NOT EXISTS idx_allowance_family_id ON allowance_rules(family_id);
CREATE INDEX IF NOT EXISTS idx_allowance_account_id ON allowance_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_allowance_is_active ON allowance_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_allowance_next_payment ON allowance_rules(next_payment_date);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_family_id ON savings_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_goals_account_id ON savings_goals(account_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON savings_goals(status);

-- Chores indexes
CREATE INDEX IF NOT EXISTS idx_chores_family_id ON chores(family_id);
CREATE INDEX IF NOT EXISTS idx_chores_is_active ON chores(is_active);
CREATE INDEX IF NOT EXISTS idx_chore_assignments_family_id ON chore_assignments(family_id);
CREATE INDEX IF NOT EXISTS idx_chore_assignments_assigned_to ON chore_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_chore_assignments_status ON chore_assignments(status);
CREATE INDEX IF NOT EXISTS idx_chore_assignments_due_date ON chore_assignments(due_date);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_family_id ON notifications(family_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- ==============================================

CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_accounts_updated_at BEFORE UPDATE ON pocket_money_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON transaction_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_allowance_updated_at BEFORE UPDATE ON allowance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_chores_updated_at BEFORE UPDATE ON chores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_assignments_updated_at BEFORE UPDATE ON chore_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Insert test parent user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
('parent@test.com', '$2b$12$vtr7sPLsJhKQSKTXBNvQoeUaz84XvcGqhLffD2gaXIqLC8kQNxZUG', 'Test', 'Parent', 'parent', true),
('child1@test.com', '$2b$12$vtr7sPLsJhKQSKTXBNvQoeUaz84XvcGqhLffD2gaXIqLC8kQNxZUG', 'Emma', 'Nielsen', 'child', true),
('child2@test.com', '$2b$12$vtr7sPLsJhKQSKTXBNvQoeUaz84XvcGqhLffD2gaXIqLC8kQNxZUG', 'Oliver', 'Nielsen', 'child', true)
ON CONFLICT (email) DO NOTHING;

-- Insert test family
INSERT INTO families (name, description, currency, created_by) 
SELECT 'Nielsen Family', 'Test family for Lommepenge app development', 'DKK', u.id 
FROM users u WHERE u.email = 'parent@test.com'
ON CONFLICT DO NOTHING;

-- Add family members
DO $$
DECLARE
    family_uuid UUID;
    parent_uuid UUID;
    child1_uuid UUID;
    child2_uuid UUID;
BEGIN
    SELECT id INTO family_uuid FROM families WHERE name = 'Nielsen Family';
    SELECT id INTO parent_uuid FROM users WHERE email = 'parent@test.com';
    SELECT id INTO child1_uuid FROM users WHERE email = 'child1@test.com';
    SELECT id INTO child2_uuid FROM users WHERE email = 'child2@test.com';
    
    IF family_uuid IS NOT NULL AND parent_uuid IS NOT NULL THEN
        INSERT INTO family_members (family_id, user_id, role, nickname) VALUES
        (family_uuid, parent_uuid, 'parent', 'Mom/Dad'),
        (family_uuid, child1_uuid, 'child', 'Emma'),
        (family_uuid, child2_uuid, 'child', 'Oliver')
        ON CONFLICT (family_id, user_id) DO NOTHING;
        
        -- Create pocket money accounts for children
        INSERT INTO pocket_money_accounts (family_id, user_id, name, balance) VALUES
        (family_uuid, child1_uuid, 'Emma''s Pocket Money', 10000), -- 100 DKK
        (family_uuid, child2_uuid, 'Oliver''s Pocket Money', 7500)  -- 75 DKK
        ON CONFLICT (family_id, user_id) DO NOTHING;
        
        -- Create default transaction categories
        INSERT INTO transaction_categories (family_id, name, type, color, icon, is_system, created_by) VALUES
        (family_uuid, 'Weekly Allowance', 'income', '#28a745', 'calendar', true, parent_uuid),
        (family_uuid, 'Bonus', 'income', '#ffc107', 'star', true, parent_uuid),
        (family_uuid, 'Chore Reward', 'income', '#17a2b8', 'briefcase', true, parent_uuid),
        (family_uuid, 'Toys & Games', 'expense', '#dc3545', 'gamepad', false, parent_uuid),
        (family_uuid, 'Candy & Snacks', 'expense', '#fd7e14', 'cookie', false, parent_uuid),
        (family_uuid, 'Savings', 'transfer', '#6f42c1', 'piggy-bank', false, parent_uuid)
        ON CONFLICT DO NOTHING;
        
        -- Create sample savings goals
        INSERT INTO savings_goals (family_id, account_id, name, description, target_amount, current_amount, target_date, created_by)
        SELECT family_uuid, pma.id, 'New Bicycle', 'Save up for a cool new bike!', 150000, 5000, (CURRENT_DATE + INTERVAL '6 months')::DATE, parent_uuid
        FROM pocket_money_accounts pma JOIN users u ON pma.user_id = u.id 
        WHERE u.email = 'child1@test.com' AND pma.family_id = family_uuid
        ON CONFLICT DO NOTHING;
        
        INSERT INTO savings_goals (family_id, account_id, name, description, target_amount, current_amount, target_date, created_by)
        SELECT family_uuid, pma.id, 'LEGO Set', 'Cool LEGO Creator set I want!', 80000, 2500, (CURRENT_DATE + INTERVAL '3 months')::DATE, parent_uuid
        FROM pocket_money_accounts pma JOIN users u ON pma.user_id = u.id 
        WHERE u.email = 'child2@test.com' AND pma.family_id = family_uuid
        ON CONFLICT DO NOTHING;
        
        -- Create sample chores
        INSERT INTO chores (family_id, name, description, reward_amount, estimated_minutes, category, created_by) VALUES
        (family_uuid, 'Tidy bedroom', 'Make bed and put toys away', 2000, 15, 'bedroom', parent_uuid),
        (family_uuid, 'Load dishwasher', 'Put dirty dishes in dishwasher', 1500, 10, 'kitchen', parent_uuid),
        (family_uuid, 'Vacuum living room', 'Vacuum the carpet in living room', 3000, 20, 'cleaning', parent_uuid),
        (family_uuid, 'Take out trash', 'Empty bins and take to outside bin', 1000, 5, 'household', parent_uuid)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample data created successfully for Nielsen Family';
    END IF;
END $$;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Lommepenge App2 database setup completed successfully';
    RAISE NOTICE 'Created database: app2_db with user: app2_user';
    RAISE NOTICE 'Test login credentials:';
    RAISE NOTICE '  Parent: parent@test.com / Admin123!';
    RAISE NOTICE '  Child1: child1@test.com / Admin123! (Emma - 100 DKK)';
    RAISE NOTICE '  Child2: child2@test.com / Admin123! (Oliver - 75 DKK)';
    RAISE NOTICE 'Database includes: users, families, accounts, transactions, goals, chores';
END $$;