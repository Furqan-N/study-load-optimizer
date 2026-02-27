'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the token exists in the browser
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If no token, kick them to the login page
      router.push('/login');
    } else {
      // If token exists, unlock the dashboard
      setIsAuthenticated(true);
    }
  }, [router]);

  // Don't render the dashboard HTML until we confirm they are allowed to see it
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ); 
  }

  return <>{children}</>;
}