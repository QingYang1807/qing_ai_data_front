'use client';

import React, { useState } from 'react';
import DataSourceList from '@/components/datasource/DataSourceList';
import DataSourceForm from '@/components/datasource/DataSourceForm';
import DataSourceConnections from '@/components/datasource/DataSourceConnections';
import DataSourceTables from '@/components/datasource/DataSourceTables';
import { DataSource, DataSourceLevel } from '@/types';

export default function TestDataSourceManagement() {
  const [showForm, setShowForm] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);

  // 模拟数据源
  const mockDataSource: DataSource = {
    id: 1,
    name: '测试数据源',
    type: 'MYSQL' as any,
    level: DataSourceLevel.INTERNAL,
    config: {
      host: 'localhost',
      port: 3306,
      database: 'test_db',
      username: 'root',
      password: 'password'
    },
    description: '这是一个测试数据源',
    status: 1,
    enabled: true,
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            数据源管理功能测试
          </h1>
          <p className="text-gray-600">
            测试数据源管理的用户连接、数据库表登记和分级管理功能
          </p>
        </div>

        {/* 功能测试按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-gray-900 mb-2">创建数据源</h3>
            <p className="text-sm text-gray-600">测试数据源创建和分级管理</p>
          </button>

          <button
            onClick={() => {
              setSelectedDataSource(mockDataSource);
              setShowConnections(true);
            }}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-gray-900 mb-2">连接管理</h3>
            <p className="text-sm text-gray-600">测试用户连接和权限管理</p>
          </button>

          <button
            onClick={() => {
              setSelectedDataSource(mockDataSource);
              setShowTables(true);
            }}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h3 className="font-semibold text-gray-900 mb-2">表管理</h3>
            <p className="text-sm text-gray-600">测试数据库表登记和同步</p>
          </button>

          <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">功能说明</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 数据源分级：公开、内部、机密、秘密</li>
              <li>• 用户连接：权限管理和连接历史</li>
              <li>• 表管理：表登记和同步管理</li>
            </ul>
          </div>
        </div>

        {/* 数据源列表 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">数据源列表</h2>
            <p className="text-gray-600 mt-1">查看和管理所有数据源</p>
          </div>
          <DataSourceList />
        </div>
      </div>

      {/* 模态框 */}
      <DataSourceForm
        visible={showForm}
        onCancel={() => setShowForm(false)}
      />

      {selectedDataSource && (
        <>
          <DataSourceConnections
            dataSourceId={Number(selectedDataSource.id)}
            visible={showConnections}
            onClose={() => {
              setShowConnections(false);
              setSelectedDataSource(null);
            }}
          />

          <DataSourceTables
            dataSourceId={Number(selectedDataSource.id)}
            visible={showTables}
            onClose={() => {
              setShowTables(false);
              setSelectedDataSource(null);
            }}
          />
        </>
      )}
    </div>
  );
} 