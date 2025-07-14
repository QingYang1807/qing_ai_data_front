'use client';

import React, { useState, useEffect } from 'react';
import { datasetApi } from '@/api/dataset';
import { Dataset } from '@/types';

export default function TestDatasetPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  // 测试API连接
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await datasetApi.GetDatasets({ page: 1, size: 10 });
      setDatasets(response.data || []);
      setConnectionStatus('connected');
      console.log('API Response:', response);
    } catch (err: any) {
      setError(err.message || 'API连接失败');
      setConnectionStatus('error');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 创建测试数据集
  const createTestDataset = async () => {
    setLoading(true);
    setError(null);
    try {
      const testDataset = {
        name: `测试数据集_${Date.now()}`,
        type: 'TEXT' as any,
        description: '这是一个测试数据集',
        format: 'JSON',
        isPublic: false
      };
      
      const response = await datasetApi.CreateDataset(testDataset);
      console.log('Created dataset:', response);
      
      // 重新加载数据集列表
      await testConnection();
    } catch (err: any) {
      setError(err.message || '创建数据集失败');
      console.error('Create Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">数据集API测试</h1>
        
        {/* 连接状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">连接状态</h2>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' && '已连接到数据集API'}
              {connectionStatus === 'error' && 'API连接失败'}
              {connectionStatus === 'unknown' && '连接状态未知'}
            </span>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          <div className="flex space-x-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '测试中...' : '测试连接'}
            </button>
            <button
              onClick={createTestDataset}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建测试数据集'}
            </button>
          </div>
        </div>

        {/* 数据集列表 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">数据集列表</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : datasets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无数据集</p>
          ) : (
            <div className="space-y-4">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dataset.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                        <span>类型: {dataset.type}</span>
                        <span>状态: {dataset.status}</span>
                        <span>文件数: {dataset.fileCount || 0}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      ID: {dataset.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API信息 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">API信息</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>数据集服务:</strong> http://localhost:9101</p>
            <p><strong>数据源服务:</strong> http://localhost:9102</p>
            <p><strong>API路径:</strong> /api/v1/datasets</p>
            <p><strong>前端服务:</strong> http://localhost:3000</p>
          </div>
        </div>
      </div>
    </div>
  );
} 