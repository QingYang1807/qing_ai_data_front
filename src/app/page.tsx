'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    // 等待 store 水合完成后再进行路由判断
    if (!hasHydrated) return;

    if (isAuthenticated) {
      // 如果已登录，跳转到主应用页面
      router.push('/dashboard');
    } else {
      // 如果未登录，跳转到欢迎页面
      router.push('/welcome');
    }
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
} 