"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      if (session.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/landing');
    }
  }, [session, status, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div className="spinner"></div>
    </div>
  );
}
