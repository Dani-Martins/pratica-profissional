-- Script para corrigir possíveis problemas em fornecedores existentes

-- 1. Atualizar todos os fornecedores pessoa física para ter CNPJ = "ISENTO"
UPDATE fornecedores 
SET cnpj = 'ISENTO' 
WHERE 
    tipopessoa = 'F' AND 
    (cnpj IS NULL OR cnpj = '' OR cnpj != 'ISENTO');

-- 2. Garantir que fornecedores sem CPF que são pessoa física tenham valores padrão corretos
UPDATE fornecedores 
SET 
    cpf = NULL,
    inscricaoestadual = 'ISENTO'
WHERE 
    tipopessoa = 'F' AND 
    (cpf IS NULL OR cpf = '') AND
    (inscricaoestadual IS NULL OR inscricaoestadual = '');

-- 3. Corrigir razão social para fornecedores pessoa física (adicionar prefixo [PF] se não tiver)
UPDATE fornecedores 
SET razao_social = CONCAT('[PF] ', nome)
WHERE 
    tipopessoa = 'F' AND 
    nome IS NOT NULL AND nome != '' AND
    (razao_social IS NULL OR razao_social = '' OR NOT razao_social LIKE '[PF]%');

-- 4. Corrigir nome fantasia para fornecedores pessoa física (copiar da razão social)
UPDATE fornecedores 
SET nome_fantasia = razao_social
WHERE 
    tipopessoa = 'F' AND 
    razao_social IS NOT NULL AND razao_social != '' AND
    (nome_fantasia IS NULL OR nome_fantasia = '');

-- 5. Verificar e corrigir casos em que pessoa física tem NOME nulo mas tem razão social
UPDATE fornecedores 
SET nome = REPLACE(razao_social, '[PF] ', '')
WHERE 
    tipopessoa = 'F' AND 
    (nome IS NULL OR nome = '') AND
    razao_social LIKE '[PF]%';

-- Validação após as correções
SELECT 
    id,
    tipopessoa,
    nome,
    cpf,
    razao_social,
    nome_fantasia,
    cnpj,
    inscricaoestadual
FROM 
    fornecedores
WHERE 
    tipopessoa = 'F'
ORDER BY
    id;
