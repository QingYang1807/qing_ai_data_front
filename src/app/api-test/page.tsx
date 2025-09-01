'use client';

import React, { useState } from 'react';

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setTestResult('测试中...');
    
    try {
      // 测试GET请求
      const getResponse = await fetch('/api/processing/tasks');
      const getData = await getResponse.json();
      
      console.log('GET响应:', getData);
      
      if (getResponse.ok) {
        setTestResult(`✅ GET请求成功\n状态码: ${getResponse.status}\n响应数据: ${JSON.stringify(getData, null, 2)}`);
      } else {
        setTestResult(`❌ GET请求失败\n状态码: ${getResponse.status}\n错误信息: ${JSON.stringify(getData, null, 2)}`);
      }
    } catch (error: any) {
      setTestResult(`❌ 请求异常: ${error.message}`);
      console.error('API测试失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTask = async () => {
    setLoading(true);
    setTestResult('创建任务测试中...');
    
    try {
      const taskData = {
        taskName: '测试任务',
        taskDescription: 'API测试创建的任务',
        datasetId: 1,
        processingType: 'CLEANING',
        config: '{"outputFormat":"JSON","cleaning":{"removeNulls":true}}'
      };
      
      const response = await fetch('/api/processing/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      console.log('POST响应:', data);
      
      if (response.ok) {
        setTestResult(`✅ 创建任务成功\n状态码: ${response.status}\n响应数据: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ 创建任务失败\n状态码: ${response.status}\n错误信息: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setTestResult(`❌ 创建任务异常: ${error.message}`);
      console.error('创建任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            数据处理API测试
          </h1>
          
          <div className="space-y-6">
            <div className="flex space-x-4">
              <button
                onClick={testApi}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '测试中...' : '测试GET请求'}
              </button>
              
              <button
                onClick={testCreateTask}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '测试中...' : '测试创建任务'}
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">测试结果:</h3>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96">
                {testResult || '点击按钮开始测试...'}
              </pre>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">说明:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 确保后端数据处理服务在9104端口运行</li>
                <li>• 确保Next.js代理配置正确</li>
                <li>• 查看浏览器开发者工具的网络面板</li>
                <li>• 查看控制台输出的详细日志</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 