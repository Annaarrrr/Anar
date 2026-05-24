-- ANAR FULL DATABASE SCHEMA

-- 1. AUTH SERVICE: Users and Security
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. GOAL SERVICE: User Goals
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_goal UNIQUE (user_id) -- MVP rule: 1 Goal per User
);

-- 3. TASK SERVICE: Goal Breakdown & Progress
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. NOTIFICATION SERVICE: FCM Push Notification Tokens
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    device_type VARCHAR(50), -- e.g., 'ios', 'android', 'web'
    last_updated TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_device_token UNIQUE (user_id, device_token)
);

-- 5. CHAT LOGS: AI Breakdown Conversation History
CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_fcm_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_chat_goal_id ON conversation_logs(goal_id);
