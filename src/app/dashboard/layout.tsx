'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import DynamicSidebar from '@/components/layout/DynamicSidebar';
import { ToastContainer } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/useAuthStore';

// 模拟通知数据
const mockNotifications = [
  {
    id: '1',
    title: '数据处理完成',
    message: '用户行为数据清洗任务已完成',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    type: 'success' as const
  },
  {
    id: '2',
    title: '系统更新',
    message: '系统将于今晚进行例行维护',
    timestamp: '2024-01-15T09:00:00Z',
    read: true,
    type: 'info' as const
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toasts, removeToast } = useToast();

  // 检查认证状态 - 等待 store 水合完成后再检查
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleUserMenuClick = () => {
    console.log('User menu clicked');
  };

  const handleMenuClick = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 在 store 水合完成前或未认证时显示加载器
  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col fixed inset-0">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* Header - Fixed at top */}
      <Header
        user={user ? {
          id: user.id.toString(),
          name: user.realName,
          email: user.email,
          role: 'Admin',
          team: 'Data Team',
          avatar: user.avatar
        } : undefined}
        notifications={mockNotifications}
        onNotificationClick={handleNotificationClick}
        onUserMenuClick={handleUserMenuClick}
        onMenuClick={handleMenuClick}
      />

      {/* Main Content - Fill remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed left, full height */}
        <DynamicSidebar isCollapsed={sidebarCollapsed} />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-6 w-96 glass-card p-4 z-50 animate-slide-up max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">通知</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              ×
            </button>
          </div>

          {mockNotifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无通知</p>
          ) : (
            <div className="space-y-3">
              {mockNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors duration-200 ${notification.read
                    ? 'bg-glass-50 border-glass-200'
                    : 'bg-blue-50/50 border-blue-200'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
