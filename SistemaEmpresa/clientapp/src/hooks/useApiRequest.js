// src/hooks/useApiRequest.js
import { useState, useCallback } from 'react';

export const useApiRequest = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.userMessage || err.message || 'Ocorreu um erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute, setData };
};