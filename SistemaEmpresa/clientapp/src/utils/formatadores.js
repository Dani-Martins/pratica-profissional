// Funções utilitárias para formatação de dados

/**
 * Formata um número de CPF (apenas dígitos) para o formato 999.999.999-99
 * @param {string} cpf - CPF somente com números ou parcialmente formatado
 * @returns {string} - CPF formatado
 */
export const formatarCPF = (cpf) => {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const apenasDigitos = cpf.replace(/[^\d]/g, '');
  
  // Limita a 11 dígitos
  const digitosLimitados = apenasDigitos.substring(0, 11);
  
  // Aplica a máscara
  if (digitosLimitados.length <= 3) {
    return digitosLimitados;
  } else if (digitosLimitados.length <= 6) {
    return `${digitosLimitados.substring(0, 3)}.${digitosLimitados.substring(3)}`;
  } else if (digitosLimitados.length <= 9) {
    return `${digitosLimitados.substring(0, 3)}.${digitosLimitados.substring(3, 6)}.${digitosLimitados.substring(6)}`;
  } else {
    return `${digitosLimitados.substring(0, 3)}.${digitosLimitados.substring(3, 6)}.${digitosLimitados.substring(6, 9)}-${digitosLimitados.substring(9)}`;
  }
};

/**
 * Formata um número de CNPJ (apenas dígitos) para o formato 99.999.999/0001-99
 * @param {string} cnpj - CNPJ somente com números ou parcialmente formatado
 * @returns {string} - CNPJ formatado
 */
export const formatarCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  // Remove caracteres não numéricos
  const apenasDigitos = cnpj.replace(/[^\d]/g, '');
  
  // Limita a 14 dígitos
  const digitosLimitados = apenasDigitos.substring(0, 14);
  
  // Aplica a máscara
  if (digitosLimitados.length <= 2) {
    return digitosLimitados;
  } else if (digitosLimitados.length <= 5) {
    return `${digitosLimitados.substring(0, 2)}.${digitosLimitados.substring(2)}`;
  } else if (digitosLimitados.length <= 8) {
    return `${digitosLimitados.substring(0, 2)}.${digitosLimitados.substring(2, 5)}.${digitosLimitados.substring(5)}`;
  } else if (digitosLimitados.length <= 12) {
    return `${digitosLimitados.substring(0, 2)}.${digitosLimitados.substring(2, 5)}.${digitosLimitados.substring(5, 8)}/${digitosLimitados.substring(8)}`;
  } else {
    return `${digitosLimitados.substring(0, 2)}.${digitosLimitados.substring(2, 5)}.${digitosLimitados.substring(5, 8)}/${digitosLimitados.substring(8, 12)}-${digitosLimitados.substring(12)}`;
  }
};

/**
 * Formata um CEP (apenas dígitos) para o formato 99999-999
 * @param {string} cep - CEP somente com números ou parcialmente formatado
 * @returns {string} - CEP formatado
 */
export const formatarCEP = (cep) => {
  if (!cep) return '';
  
  // Remove caracteres não numéricos
  const apenasDigitos = cep.replace(/[^\d]/g, '');
  
  // Limita a 8 dígitos
  const digitosLimitados = apenasDigitos.substring(0, 8);
  
  // Aplica a máscara
  if (digitosLimitados.length <= 5) {
    return digitosLimitados;
  } else {
    return `${digitosLimitados.substring(0, 5)}-${digitosLimitados.substring(5)}`;
  }
};

/**
 * Formata um número de telefone para o formato (99) 99999-9999 ou (99) 9999-9999
 * @param {string} telefone - Telefone somente com números ou parcialmente formatado
 * @returns {string} - Telefone formatado
 */
export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  
  // Remove caracteres não numéricos
  const apenasDigitos = telefone.replace(/[^\d]/g, '');
  
  // Limita a 11 dígitos (para celular com DDD)
  const digitosLimitados = apenasDigitos.substring(0, 11);
  
  // Aplica a máscara
  if (digitosLimitados.length <= 2) {
    return `(${digitosLimitados}`;
  } else if (digitosLimitados.length <= 6) {
    return `(${digitosLimitados.substring(0, 2)}) ${digitosLimitados.substring(2)}`;
  } else if (digitosLimitados.length <= 10) {
    // Telefone fixo: (99) 9999-9999
    return `(${digitosLimitados.substring(0, 2)}) ${digitosLimitados.substring(2, 6)}-${digitosLimitados.substring(6)}`;
  } else {
    // Celular: (99) 99999-9999
    return `(${digitosLimitados.substring(0, 2)}) ${digitosLimitados.substring(2, 7)}-${digitosLimitados.substring(7)}`;
  }
};

/**
 * Formata um valor para moeda brasileira (R$)
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} - Valor formatado como moeda
 */
export const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
  
  const numero = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.')) : valor;
  
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Converte uma string monetária (R$ 1.234,56) para um número (1234.56)
 * @param {string} valor - Valor no formato monetário
 * @returns {number} - Valor numérico
 */
export const converterMoedaParaNumero = (valor) => {
  if (!valor) return 0;
  
  // Remove o símbolo da moeda e quaisquer caracteres não numéricos, exceto vírgula e ponto
  const apenasNumeros = valor.replace(/[^\d,.-]/g, '');
  
  // Converte de formato brasileiro (1.234,56) para formato numérico (1234.56)
  // Primeiro remove os pontos e depois substitui a vírgula por ponto
  const valorFormatado = apenasNumeros.replace(/\./g, '').replace(',', '.');
  
  // Converte para número e garante que tenha 2 casas decimais
  const numero = parseFloat(valorFormatado);
  
  // Verifica se é um número válido
  return isNaN(numero) ? 0 : numero;
};

/**
 * Formata uma data no padrão dd/mm/aaaa
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} - Data formatada
 */
export const formatarData = (data) => {
  if (!data) return '';
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  
  // Verifica se é uma data válida
  if (isNaN(dataObj.getTime())) return '';
  
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
};
