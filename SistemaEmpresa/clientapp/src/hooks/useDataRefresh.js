import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar atualizações de dados
 */
const useDataRefresh = (fetchFunction, interval = 0, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Função para buscar dados
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Efeito para primeira carga e quando dependências mudarem
  useEffect(() => {
    refresh();
  }, [...dependencies]);

  // Efeito para atualizações periódicas
  useEffect(() => {
    if (interval <= 0) return;
    
    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [interval, refresh]);

  return { data, loading, error, refresh, lastUpdated };
};

export default useDataRefresh;