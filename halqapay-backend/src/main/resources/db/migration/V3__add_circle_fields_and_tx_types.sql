-- Add new transaction types for wallet operations
DO $$ BEGIN
    ALTER TYPE transaction_type ADD VALUE 'TOPUP';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE transaction_type ADD VALUE 'WITHDRAWAL';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE transaction_type ADD VALUE 'DEPOSIT';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new fields to circles table
ALTER TABLE circles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE circles ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 2;
ALTER TABLE circles ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id);
