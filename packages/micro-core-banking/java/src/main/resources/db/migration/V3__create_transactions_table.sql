CREATE TABLE micro_core_banking.transactions (
    id SERIAL PRIMARY KEY,
    transaction_ref VARCHAR(36) UNIQUE NOT NULL,
    account_id INT NOT NULL REFERENCES micro_core_banking.accounts(id),
    related_account_id INT REFERENCES micro_core_banking.accounts(id), -- for transfers
    transaction_type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRANSFER
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_transactions_account_id ON micro_core_banking.transactions(account_id);
CREATE INDEX idx_transactions_transaction_type ON micro_core_banking.transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON micro_core_banking.transactions(created_at);
