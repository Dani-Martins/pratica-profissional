-- Script para adicionar novos campos à tabela Fornecedores
-- Este script padroniza a tabela fornecedores para seguir o mesmo padrão da tabela clientes

-- Verificar se as colunas já existem antes de adicionar
SET @dbname = DATABASE();
SET @tablename = 'fornecedores';

-- Adicionar tipopessoa se não existir
SET @columnname = 'tipopessoa';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(1) DEFAULT ''J'' NOT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar nome se não existir
SET @columnname = 'nome';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar cpf se não existir
SET @columnname = 'cpf';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(14)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar inscricaoestadual se não existir
SET @columnname = 'inscricaoestadual';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Criar índices para melhorar performance (apenas se não existirem)
SET @indexname = 'idx_fornecedores_tipopessoa';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      INDEX_NAME = @indexname
  ) > 0,
  'SELECT 1',
  'CREATE INDEX idx_fornecedores_tipopessoa ON fornecedores(tipopessoa)'
));
PREPARE createIfNotExists FROM @preparedStatement;
EXECUTE createIfNotExists;
DEALLOCATE PREPARE createIfNotExists;

-- Criar índice para cpf
SET @indexname = 'idx_fornecedores_cpf';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      INDEX_NAME = @indexname
  ) > 0,
  'SELECT 1',
  'CREATE INDEX idx_fornecedores_cpf ON fornecedores(cpf)'
));
PREPARE createIfNotExists FROM @preparedStatement;
EXECUTE createIfNotExists;
DEALLOCATE PREPARE createIfNotExists;

-- Criar índice para cnpj
SET @indexname = 'idx_fornecedores_cnpj';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      TABLE_SCHEMA = @dbname AND
      TABLE_NAME = @tablename AND
      INDEX_NAME = @indexname
  ) > 0,
  'SELECT 1',
  'CREATE INDEX idx_fornecedores_cnpj ON fornecedores(cnpj)'
));
PREPARE createIfNotExists FROM @preparedStatement;
EXECUTE createIfNotExists;
DEALLOCATE PREPARE createIfNotExists;

-- Migrar dados existentes (assumindo que todos os fornecedores atuais são pessoa jurídica)
UPDATE fornecedores SET tipopessoa = 'J' WHERE tipopessoa IS NULL OR tipopessoa = '';

-- Validação: Verificar se a migração foi bem sucedida
SELECT 
    COUNT(*) as total_fornecedores,
    SUM(CASE WHEN tipopessoa = 'F' THEN 1 ELSE 0 END) as pessoa_fisica,
    SUM(CASE WHEN tipopessoa = 'J' THEN 1 ELSE 0 END) as pessoa_juridica
FROM fornecedores;