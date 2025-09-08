-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
    color VARCHAR(7) DEFAULT '#007bff',
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
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    from_account_id UUID REFERENCES pocket_money_accounts(id),
    to_account_id UUID REFERENCES pocket_money_accounts(id),
    scheduled_date DATE,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    parent_transaction_id UUID REFERENCES transactions(id),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
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
    amount INTEGER NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
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
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0,
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
    reward_amount INTEGER DEFAULT 0,
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
    completion_photos TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    transaction_id UUID REFERENCES transactions(id),
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

-- Insert test users
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

-- Add family members and accounts
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
        -- Add family members
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
    END IF;
END $$;