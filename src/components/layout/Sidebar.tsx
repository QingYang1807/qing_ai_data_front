'use client';

import React from 'react';
import { 
  BarChart3, 
  Database, 
  FileText, 
  Filter, 
  Zap, 
  Tag, 
  Settings, 
  Workflow,
  Brain,
  Bot,
  Home
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed?: boolean;
}

const menuItems = [
  { id: 'dashboard', name: '数据概览', icon: Home },
  { id: 'datasource', name: '数据源管理', icon: Database },
  { id: 'dataset', name: '数据集管理', icon: FileText },
  { id: 'processing', name: '数据处理', icon: Filter },
  { id: 'quality', name: '数据质量', icon: BarChart3 },
  { id: 'workflow', name: '工作流配置', icon: Workflow },
  { id: 'knowledge', name: '知识抽取', icon: Brain },
  { id: 'automation', name: '自动化处理', icon: Bot },
  { id: 'settings', name: '系统设置', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isCollapsed = false 
}) => {
  return (
    <aside className={clsx(
      'sidebar-glass h-full flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group',
                isActive 
                  ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30 shadow-glass' 
                  : 'text-gray-700 hover:bg-glass-200 hover:text-gray-900'
              )}
            >
              <Icon className={clsx(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
              )} />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-glass-200">
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

export default Sidebar; 