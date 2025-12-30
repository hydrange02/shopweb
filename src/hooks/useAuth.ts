"use client";
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);

    const handleAuthChange = () => {
      const token = getToken();
      setIsLoggedIn(!!token);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return { isLoggedIn };
}
