CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE circle_status AS ENUM ('OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE membership_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DEFAULTED');
CREATE TYPE transaction_type AS ENUM ('CONTRIBUTION', 'PAYOUT', 'REFUND');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE currency_code AS ENUM ('EGP', 'SAR', 'AED', 'USD', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    country         VARCHAR(100) NOT NULL,
    currency        currency_code NOT NULL DEFAULT 'USD',
    salary          DECIMAL(15, 2) NOT NULL CHECK (salary > 0),
    wallet_balance  DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    kyc_verified    BOOLEAN NOT NULL DEFAULT TRUE,
    risk_score      INTEGER NOT NULL DEFAULT 750 CHECK (risk_score BETWEEN 0 AND 1000),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE circles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(255) NOT NULL,
    total_value             DECIMAL(15, 2) NOT NULL CHECK (total_value > 0),
    duration_months         INTEGER NOT NULL CHECK (duration_months >= 1),
    monthly_contribution    DECIMAL(15, 2) GENERATED ALWAYS AS (total_value / duration_months) STORED,
    currency                currency_code NOT NULL DEFAULT 'USD',
    max_members             INTEGER NOT NULL CHECK (max_members >= 2),
    current_members         INTEGER NOT NULL DEFAULT 0,
    current_month           INTEGER NOT NULL DEFAULT 0,
    status                  circle_status NOT NULL DEFAULT 'OPEN',
    payout_order            INTEGER[] DEFAULT '{}',
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE circle_memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    circle_id       UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    slot_number     INTEGER NOT NULL,
    status          membership_status NOT NULL DEFAULT 'ACTIVE',
    joined_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(circle_id, slot_number),
    UNIQUE(user_id, circle_id)
);

CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    circle_id       UUID REFERENCES circles(id),
    type            transaction_type NOT NULL,
    amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency        currency_code NOT NULL,
    status          transaction_status NOT NULL DEFAULT 'COMPLETED',
    description     TEXT,
    month_number    INTEGER,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE monthly_cycles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id           UUID NOT NULL REFERENCES circles(id),
    month_number        INTEGER NOT NULL CHECK (month_number >= 1),
    payout_user_id      UUID REFERENCES users(id),
    total_collected     DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    payout_amount       DECIMAL(15, 2),
    cycle_date          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed           BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(circle_id, month_number)
);

CREATE TABLE fx_rates (
    id              SERIAL PRIMARY KEY,
    from_currency   currency_code NOT NULL,
    to_currency     currency_code NOT NULL DEFAULT 'USD',
    rate            DECIMAL(15, 6) NOT NULL,
    UNIQUE(from_currency, to_currency)
);

INSERT INTO fx_rates (from_currency, to_currency, rate) VALUES
    ('EGP', 'USD', 0.0204),
    ('SAR', 'USD', 0.2667),
    ('AED', 'USD', 0.2723),
    ('KWD', 'USD', 3.2520),
    ('QAR', 'USD', 0.2747),
    ('BHD', 'USD', 2.6525),
    ('OMR', 'USD', 2.5974),
    ('JOD', 'USD', 1.4104),
    ('USD', 'USD', 1.0000);

CREATE INDEX idx_memberships_user ON circle_memberships(user_id);
CREATE INDEX idx_memberships_circle ON circle_memberships(circle_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_circle ON transactions(circle_id);
CREATE INDEX idx_circles_status ON circles(status);
CREATE INDEX idx_cycles_circle ON monthly_cycles(circle_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_circles_updated BEFORE UPDATE ON circles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
