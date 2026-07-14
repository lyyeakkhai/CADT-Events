import { useState, useEffect } from 'react';

export function useUrlSearch(key: string = 'q') {
  const [value, setValue] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get(key) || '';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const currentVal = new URLSearchParams(window.location.search).get(key) || '';
      if (currentVal !== value) {
        setValue(currentVal);
      }
    };
    
    window.addEventListener('urlchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('urlchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [key, value]);

  const updateValue = (newValue: string) => {
    setValue(newValue);
    const params = new URLSearchParams(window.location.search);
    if (newValue) {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
    window.dispatchEvent(new Event('urlchange'));
  };

  return [value, updateValue] as const;
}
