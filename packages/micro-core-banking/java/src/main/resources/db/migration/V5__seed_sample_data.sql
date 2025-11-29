-- Create sample accounts
INSERT INTO micro_core_banking.accounts (account_number, customer_id, account_type, balance, currency, status)
VALUES
    ('ACC-000001', 'CUST-001', 'SAVINGS', 1000.00, 'USD', 'ACTIVE'),
    ('ACC-000002', 'CUST-001', 'CHECKING', 500.00, 'USD', 'ACTIVE'),
    ('ACC-000003', 'CUST-002', 'SAVINGS', 250.00, 'USD', 'ACTIVE');

-- Create sample transactions
INSERT INTO micro_core_banking.transactions (transaction_ref, account_id, transaction_type, amount, currency, description)
VALUES
    ('TXN-ABC123', 1, 'DEPOSIT', 100.00, 'USD', 'Initial deposit'),
    ('TXN-DEF456', 2, 'WITHDRAWAL', 50.00, 'USD', 'ATM withdrawal'),
    ('TXN-GHI789', 3, 'TRANSFER', 25.00, 'USD', 'Transfer to friend');
