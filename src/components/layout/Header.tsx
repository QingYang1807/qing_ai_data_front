'use client';

import React, { useState } from 'react';
import { Bell, Search, User, Settings, LogOut, Menu, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  avatar?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface HeaderProps {
  user?: User;
  notifications?: Notification[];
  onNotificationClick?: () => void;
  onUserMenuClick?: () => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  notifications = [], 
  onNotificationClick, 
  onUserMenuClick,
  onMenuClick
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header-glass sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b border-white/20 flex-shrink-0">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo and Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 text-shadow hidden sm:block">AI数据平台</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索数据源、数据集..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="input-glass w-full pl-10 pr-4 py-2 text-sm placeholder-gray-500"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Documentation */}
        <Link href="/product-docs">
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
            <BookOpen className="w-5 h-5" />
          </button>
        </Link>
        
        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce-subtle">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-glass-200 transition-colors duration-200"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name || '用户'}</span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-card py-2 animate-slide-up">
              <div className="px-4 py-2 border-b border-glass-200">
                <p className="text-sm font-medium text-gray-800">{user?.name || '用户'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                <p className="text-xs text-blue-600 capitalize">{user?.role || 'Admin'} · {user?.team || 'Default'}</p>
              </div>
              
              <button
                onClick={onUserMenuClick}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-glass-100 transition-colors duration-200 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>个人设置</span>
              </button>
              
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-glass-100 transition-colors duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>系统设置</span>
              </button>
              
              <hr className="my-2 border-glass-200" />
              
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header; 