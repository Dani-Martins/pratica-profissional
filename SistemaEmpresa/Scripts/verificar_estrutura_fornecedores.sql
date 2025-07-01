-- Script para verificar a estrutura atual da tabela fornecedores
DESCRIBE fornecedores;

-- Verificar se as colunas necessárias já existem
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE() AND
    TABLE_NAME = 'fornecedores'
ORDER BY
    ORDINAL_POSITION;
