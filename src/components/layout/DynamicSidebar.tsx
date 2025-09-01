'use client';

import React, { useEffect } from 'react';
import { Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useMenuStore, MenuItem } from '@/stores/useMenuStore';
import { useAuthStore } from '@/stores/useAuthStore';
import clsx from 'clsx';

interface DynamicSidebarProps {
  isCollapsed?: boolean;
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  'DatabaseOutlined': <Database className="w-5 h-5" />,
  'CloudServerOutlined': <Server className="w-5 h-5" />,
  'CloudDownloadOutlined': <Download className="w-5 h-5" />,
  'ToolOutlined': <Filter className="w-5 h-5" />,
  'EditOutlined': <Edit className="w-5 h-5" />,
  'PlusOutlined': <Plus className="w-5 h-5" />,
  'MergeCellsOutlined': <Merge className="w-5 h-5" />,
  'BarChartOutlined': <BarChart3 className="w-5 h-5" />,
  'ReloadOutlined': <RefreshCw className="w-5 h-5" />,
  'ShoppingOutlined': <ShoppingCart className="w-5 h-5" />,
  'UnorderedListOutlined': <List className="w-5 h-5" />,
  'SafetyCertificateOutlined': <Shield className="w-5 h-5" />,
  'TransactionOutlined': <CreditCard className="w-5 h-5" />,
  'StarOutlined': <Star className="w-5 h-5" />,
  'SafetyOutlined': <Shield className="w-5 h-5" />,
  'EyeInvisibleOutlined': <EyeOff className="w-5 h-5" />,
  'LockOutlined': <Lock className="w-5 h-5" />,
  'FileTextOutlined': <FileText className="w-5 h-5" />,
  'DashboardOutlined': <Home className="w-5 h-5" />,
  'TrendingUpOutlined': <TrendingUp className="w-5 h-5" />,
  'ExportOutlined': <Download className="w-5 h-5" />,
  'RobotOutlined': <Bot className="w-5 h-5" />,
  'AppstoreOutlined': <Grid className="w-5 h-5" />,
  'PlayCircleOutlined': <Play className="w-5 h-5" />,
  'CheckCircleOutlined': <CheckCircle className="w-5 h-5" />,
  'RocketOutlined': <Rocket className="w-5 h-5" />,
  'ThunderboltOutlined': <Zap className="w-5 h-5" />,
  'ShopOutlined': <Store className="w-5 h-5" />,
  'UploadOutlined': <Upload className="w-5 h-5" />,
  'DeploymentUnitOutlined': <Workflow className="w-5 h-5" />,
  'NodeIndexOutlined': <GitBranch className="w-5 h-5" />,
  'ClockCircleOutlined': <Clock className="w-5 h-5" />,
  'CreditCardOutlined': <CreditCard className="w-5 h-5" />,
  'SettingOutlined': <Settings className="w-5 h-5" />,
  'UserOutlined': <User className="w-5 h-5" />,
  'TeamOutlined': <Users className="w-5 h-5" />,
  'KeyOutlined': <Key className="w-5 h-5" />,
  'ProjectOutlined': <FolderOpen className="w-5 h-5" />,
  'ExperimentOutlined': <FlaskConical className="w-5 h-5" />,
  'CodeOutlined': <Code className="w-5 h-5" />,
  'BookOutlined': <BookOpen className="w-5 h-5" />,
};

// 导入图标
import {
  Database, Server, Download, Filter, Edit, Plus, Merge, BarChart3, RefreshCw,
  ShoppingCart, List, Shield, CreditCard, Star, EyeOff, Lock, FileText, Home,
  TrendingUp, Bot, Grid, Play, CheckCircle, Rocket, Zap, Store, Upload, Workflow,
  GitBranch, Clock, Settings, User, Users, Key, FolderOpen, FlaskConical, Code, BookOpen
} from 'lucide-react';

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ isCollapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { userMenus, loadUserMenus, isLoading } = useMenuStore();

  useEffect(() => {
    if (user?.id) {
      loadUserMenus(user.id);
    }
  }, [user?.id, loadUserMenus]);

  // 递归构建菜单项
  const buildMenuItems = (menus: MenuItem[]): any[] => {
    return menus.map(menu => ({
      key: menu.path || menu.permissionCode,
      icon: iconMap[menu.icon] || <Database className="w-5 h-5" />,
      label: isCollapsed ? null : menu.permissionName,
      children: menu.children && menu.children.length > 0 ? buildMenuItems(menu.children) : undefined,
      onClick: () => {
        if (menu.path && !menu.children?.length) {
          router.push(menu.path);
        }
      },
    }));
  };

  const menuItems = buildMenuItems(userMenus);

  // 根据当前路径找到选中的菜单项
  const getSelectedKeys = () => {
    const findSelectedKey = (menus: MenuItem[]): string[] => {
      for (const menu of menus) {
        if (menu.path === pathname) {
          return [menu.path || menu.permissionCode];
        }
        if (menu.children && menu.children.length > 0) {
          const childResult = findSelectedKey(menu.children);
          if (childResult.length > 0) {
            return childResult;
          }
        }
      }
      return [];
    };
    return findSelectedKey(userMenus);
  };

  const getOpenKeys = () => {
    const findOpenKeys = (menus: MenuItem[]): string[] => {
      const openKeys: string[] = [];
      for (const menu of menus) {
        if (menu.children && menu.children.length > 0) {
          const hasActiveChild = menu.children.some(child => 
            child.path === pathname || findOpenKeys([child]).length > 0
          );
          if (hasActiveChild) {
            openKeys.push(menu.path || menu.permissionCode);
            openKeys.push(...findOpenKeys(menu.children));
          }
        }
      }
      return openKeys;
    };
    return findOpenKeys(userMenus);
  };

  if (isLoading) {
    return (
      <div className={clsx(
        'h-full flex items-center justify-center',
        isCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <aside className={clsx(
      'sidebar-glass h-full flex flex-col transition-all duration-300 border-r border-white/20',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          className="border-0 bg-transparent"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
          }}
        />
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-glass-200 flex-shrink-0">
          <div className="glass-card p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-600">系统状态</span>
            </div>
            <p className="text-xs text-gray-500">
              所有服务正常运行
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DynamicSidebar; 