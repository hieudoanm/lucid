CREATE TABLE micro_core_banking.audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL, -- e.g., "ACCOUNT_CREATED", "DEPOSIT", "WITHDRAWAL"
    entity_type VARCHAR(50) NOT NULL, -- e.g., "Account", "Transaction"
    entity_id INT NOT NULL,
    message TEXT,
    created_by VARCHAR(50) DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at ON micro_core_banking.audit_logs(created_at);
