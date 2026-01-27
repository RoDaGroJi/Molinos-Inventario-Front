/**
 * Hook personalizado para manejo de peticiones HTTP
 */

import { useState, useCallback } from 'react';
import CONFIG from '../config';

export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiFunction, onSuccess, onError) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await apiFunction();
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || CONFIG.ERRORS.ERROR;
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
}

/**
 * Hook para operaciones CRUD
 */
export function useCrud(apiFunction) {
  const [items, setItems] = useState([]);
  const { loading, error, execute, reset } = useApiCall();

  const fetchItems = useCallback(async (params) => {
    return execute(
      () => apiFunction(params),
      (result) => setItems(Array.isArray(result) ? result : [])
    );
  }, [apiFunction, execute]);

  const createItem = useCallback((newItem) => {
    return execute(
      () => apiFunction('create', newItem),
      (result) => setItems([result, ...items])
    );
  }, [apiFunction, items, execute]);

  const updateItem = useCallback((id, updatedItem) => {
    return execute(
      () => apiFunction('update', id, updatedItem),
      (result) => {
        setItems(items.map((item) => (item.id === id ? result : item)));
      }
    );
  }, [apiFunction, items, execute]);

  const deleteItem = useCallback((id) => {
    return execute(
      () => apiFunction('delete', id),
      () => setItems(items.filter((item) => item.id !== id))
    );
  }, [apiFunction, items, execute]);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reset,
  };
}
