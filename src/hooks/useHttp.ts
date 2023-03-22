import { useState, useCallback } from 'react';

interface RequestConfig {
  url: string;
  method?: string;
  headers?: HeadersInit;
  body?: {};
}

const useHttp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const sendRequest = useCallback(
    async (requestConfig: RequestConfig, applyData: (data: any) => void) => {
      try {
        setIsLoading(true);
        const res = await fetch(requestConfig.url, {
          method: requestConfig.method ?? 'GET',
          headers: requestConfig.headers ?? {},
          body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} (${res.status})`);

        applyData(data);
        setError(undefined);
      } catch (e: any) {
        setError(e.message || 'Something went wrong!');
      }
      setIsLoading(false);
    },
    []
  );

  return {
    isLoading,
    error,
    sendRequest,
  };
};

export default useHttp;
