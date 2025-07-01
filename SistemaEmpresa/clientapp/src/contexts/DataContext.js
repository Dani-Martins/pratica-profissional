import React, { createContext, useState, useContext, useCallback, useMemo } from 'react'; // Adicionar useMemo
import axios from 'axios'; // Ou sua configuração de apiClient

// Criar o contexto
export const DataContext = createContext();

// Hook para facilitar o uso do contexto
export const useDataContext = () => useContext(DataContext);

// Supondo que apiClient seja uma instância do axios
const apiClient = axios.create({
  baseURL: 'https://localhost:7234/api',
  withCredentials: true, // Importante para CORS com cookies
  // outras configurações...
});

// Adicionar interceptor para lidar com erros de CORS ou SSL
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Erro na requisição:', error);
    
    if (error.message === 'Network Error') {
      console.warn('Erro de rede detectado. Isso pode ser devido a CORS ou certificados SSL');
      // Você pode adicionar código para tentar novamente com HTTP se HTTPS falhar
      // ou mostrar uma mensagem amigável para o usuário
    }
    
    return Promise.reject(error);
  }
);

// Provedor de dados
export const DataProvider = ({ children }) => {
  // Estado para controlar atualizações
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Função para forçar atualização de todos os dados
  const refreshAll = useCallback(() => {
    console.log('>>> DataContext: refreshAll chamado. Atualizando refreshTrigger.');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Disponibilizar valores pelo contexto
  // Memoizar o objeto value para que ele só mude de identidade se refreshTrigger ou refreshAll mudarem
  const value = useMemo(() => ({
    apiClient, // <<< PRECISA ESTAR AQUI
    refreshTrigger,
    refreshAll,
  }), [refreshTrigger, refreshAll]); // refreshAll está em useCallback, então sua identidade é estável

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};