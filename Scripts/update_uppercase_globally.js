/**
 * Script para aplicar a transformação para maiúsculo globalmente em todos os formulários
 * Este script identifica padrões de formulários e aplica o utilitário uppercaseTransformer
 */

const fs = require('fs');
const path = require('path');

// Diretórios que contêm formulários
const formDirectories = [
  'SistemaEmpresa/clientapp/src/pages',
  'SistemaEmpresa/SistemaEmpresa/clientapp/src/pages'
];

// Padrões de arquivos de formulário
const formFilePatterns = [
  '*Form.js',
  '*ModalForm.js'
];

// Função para encontrar todos os arquivos de formulário
function findFormFiles(baseDir) {
  const formFiles = [];
  
  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (file.endsWith('Form.js') || file.endsWith('ModalForm.js')) {
        formFiles.push(fullPath);
      }
    });
  }
  
  searchDir(baseDir);
  return formFiles;
}

// Função para verificar se o arquivo já tem o import do uppercaseTransformer
function hasUppercaseImport(content) {
  return content.includes('handleUpperCaseChange') || 
         content.includes('uppercaseTransformer');
}

// Função para adicionar o import se necessário
function addUppercaseImport(content) {
  if (hasUppercaseImport(content)) {
    return content;
  }
  
  // Procurar a última linha de import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Adicionar o import após a última linha de import
    lines.splice(lastImportIndex + 1, 0, "import { handleUpperCaseChange } from '../../../utils/uppercaseTransformer';");
    return lines.join('\n');
  }
  
  return content;
}

// Função para transformar onChange handlers simples
function transformSimpleOnChange(content) {
  // Padrão: onChange={e => setNome(e.target.value)}
  content = content.replace(
    /onChange=\{e => set(\w+)\(e\.target\.value\)\}/g,
    'onChange={e => set$1(handleUpperCaseChange(\'$1\'.toLowerCase(), e.target.value))}'
  );
  
  // Padrão: onChange={(e) => setNome(e.target.value)}
  content = content.replace(
    /onChange=\{\(e\) => set(\w+)\(e\.target\.value\)\}/g,
    'onChange={(e) => set$1(handleUpperCaseChange(\'$1\'.toLowerCase(), e.target.value))}'
  );
  
  return content;
}

// Função para transformar handleChange functions
function transformHandleChange(content) {
  // Procurar por handleChange function e adicionar transformação
  const handleChangePattern = /(const handleChange = \([^)]+\) => \{[\s\S]*?)(setFormData\([^)]+\))/g;
  
  content = content.replace(handleChangePattern, (match, p1, p2) => {
    if (match.includes('handleUpperCaseChange')) {
      return match; // Já transformado
    }
    
    // Adicionar transformação antes do setFormData
    const transformation = `
    // Aplicar transformação para maiúsculo em campos de texto
    const transformedValue = handleUpperCaseChange(name, value);
    `;
    
    return p1.replace('const { name, value } = e.target;', 
                     'const { name, value } = e.target;' + transformation) +
           p2.replace('value', 'transformedValue');
  });
  
  return content;
}

// Função principal para processar um arquivo
function processFormFile(filePath) {
  try {
    console.log(`Processando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Adicionar import se necessário
    content = addUppercaseImport(content);
    
    // Transformar onChange handlers simples
    content = transformSimpleOnChange(content);
    
    // Transformar handleChange functions
    content = transformHandleChange(content);
    
    // Verificar se houve mudanças
    if (content !== originalContent) {
      // Fazer backup do arquivo original
      fs.writeFileSync(filePath + '.backup', originalContent);
      
      // Escrever o arquivo modificado
      fs.writeFileSync(filePath, content);
      
      console.log(`✅ Arquivo transformado: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Nenhuma mudança necessária: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função principal
function main() {
  console.log('🚀 Iniciando transformação global para maiúsculo...\n');
  
  let totalFiles = 0;
  let transformedFiles = 0;
  
  // Procurar em todos os diretórios de formulários
  formDirectories.forEach(dir => {
    const fullDir = path.resolve(dir);
    console.log(`📁 Procurando formulários em: ${fullDir}`);
    
    const formFiles = findFormFiles(fullDir);
    
    formFiles.forEach(file => {
      totalFiles++;
      if (processFormFile(file)) {
        transformedFiles++;
      }
    });
  });
  
  console.log(`\n📊 Resumo:`);
  console.log(`   Total de arquivos processados: ${totalFiles}`);
  console.log(`   Arquivos transformados: ${transformedFiles}`);
  console.log(`   Arquivos sem mudanças: ${totalFiles - transformedFiles}`);
  
  if (transformedFiles > 0) {
    console.log(`\n💾 Backups criados com extensão .backup`);
    console.log(`⚠️  Teste os formulários para garantir que tudo está funcionando corretamente`);
  }
  
  console.log('\n✨ Transformação concluída!');
}

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, processFormFile, findFormFiles };
