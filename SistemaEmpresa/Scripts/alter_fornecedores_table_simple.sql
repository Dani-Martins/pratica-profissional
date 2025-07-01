-- Script alternativo simplificado para adicionar novos campos à tabela Fornecedores (MySQL/MariaDB)
-- Este script deve ser executado com cautela, verificando manualmente se as colunas já existem

-- Adicionar novas colunas (executar uma a uma e verificar se a coluna já existe)
ALTER TABLE fornecedores ADD COLUMN tipopessoa VARCHAR(1) DEFAULT 'J' NOT NULL;
ALTER TABLE fornecedores ADD COLUMN nome VARCHAR(100);
ALTER TABLE fornecedores ADD COLUMN cpf VARCHAR(14);
ALTER TABLE fornecedores ADD COLUMN inscricaoestadual VARCHAR(20);

-- Criar índices (executar um a um e verificar se o índice já existe)
CREATE INDEX idx_fornecedores_tipopessoa ON fornecedores(tipopessoa);
CREATE INDEX idx_fornecedores_cpf ON fornecedores(cpf);
CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj);

-- Migrar dados existentes
UPDATE fornecedores SET tipopessoa = 'J' WHERE tipopessoa IS NULL OR tipopessoa = '';

-- Validação
SELECT 
    COUNT(*) as total_fornecedores,
    SUM(CASE WHEN tipopessoa = 'F' THEN 1 ELSE 0 END) as pessoa_fisica,
    SUM(CASE WHEN tipopessoa = 'J' THEN 1 ELSE 0 END) as pessoa_juridica
FROM fornecedores;
