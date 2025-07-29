'use client';

import React, { useState } from 'react';
import DataSourceForm from '@/components/datasource/DataSourceForm';
import DataSourceSettings from '@/components/datasource/DataSourceSettings';
import { DataSource, DataSourceType, DataSourceLevel } from '@/types';

const TestModalsPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 模拟数据源数据
  const mockDataSource: DataSource = {
    id: '1',
    name: '测试MySQL数据库',
    type: DataSourceType.MYSQL,
    level: DataSourceLevel.INTERNAL,
    config: {
      host: 'localhost',
      port: 3306,
      database: 'test_db',
      username: 'admin',
    },
    host: 'localhost',
    port: 3306,
    database: 'test_db',
    username: 'admin',
    description: '这是一个测试用的MySQL数据库连接',
    connectionUrl: 'jdbc:mysql://localhost:3306/test_db',
    status: 1,
    enabled: true,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    creator: '张三'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">数据源弹窗样式测试</h1>
        
        <div className="glass-card p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-glass-primary py-4 px-6 text-lg font-semibold"
            >
              测试添加数据源弹窗
            </button>
            
            <button
              onClick={() => setShowEditForm(true)}
              className="btn-glass-primary py-4 px-6 text-lg font-semibold"
            >
              测试编辑数据源弹窗
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="btn-glass-primary py-4 px-6 text-lg font-semibold"
            >
              测试数据源设置弹窗
            </button>
          </div>
          
          <div className="mt-8 p-6 bg-blue-50/50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">样式和功能说明</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• 使用了 glass morphism 毛玻璃效果</li>
              <li>• 渐变色标题栏（蓝色调）</li>
              <li>• 半透明背景和模糊效果</li>
              <li>• 平滑的动画过渡</li>
              <li>• 统一的按钮和输入框样式</li>
              <li>• 点击弹窗外部区域可关闭弹窗</li>
              <li>• 按下 ESC 键可关闭弹窗</li>
              <li>• 操作完成后不会重新加载页面</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 添加数据源弹窗 */}
      <DataSourceForm
        visible={showAddForm}
        onCancel={() => setShowAddForm(false)}
      />

      {/* 编辑数据源弹窗 */}
      <DataSourceForm
        visible={showEditForm}
        onCancel={() => setShowEditForm(false)}
        editingDataSource={mockDataSource}
      />

      {/* 数据源设置弹窗 */}
      <DataSourceSettings
        dataSource={mockDataSource}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default TestModalsPage; 