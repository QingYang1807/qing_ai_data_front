'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingType, ProcessingStatus, OutputFormat, Dataset } from '@/types';
import { processingApi } from '@/api/processing';
import { datasetApi } from '@/api/dataset';
import { useToast } from '@/hooks/useToast';

export default function TestProcessingFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [createdTask, setCreatedTask] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [apiTestResult, setApiTestResult] = useState<string>('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAPI = async () => {
    setApiTestResult('测试中...');
    try {
      const response = await fetch('/api/processing/tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        setApiTestResult('✅ API连接成功');
        addTestResult('API路径测试成功');
      } else {
        setApiTestResult(`❌ API连接失败: ${response.status}`);
        addTestResult(`API路径测试失败: ${response.status}`);
      }
    } catch (error) {
      setApiTestResult(`❌ API连接错误: ${error}`);
      addTestResult(`API路径测试错误: ${error}`);
    }
  };

  const runFullTest = async () => {
    setTestResults([]);
    addTestResult('开始完整测试流程...');
    
    try {
      // 步骤1: 加载数据集
      addTestResult('步骤1: 加载数据集');
      await loadDatasets();
      if (datasets.length === 0) {
        addTestResult('❌ 没有可用的数据集，测试终止');
        return;
      }
      addTestResult(`✅ 成功加载 ${datasets.length} 个数据集`);
      
      // 步骤2: 选择第一个数据集
      const firstDataset = datasets[0];
      setSelectedDataset(firstDataset);
      addTestResult(`✅ 选择数据集: ${firstDataset.name}`);
      
      // 步骤3: 创建处理任务
      addTestResult('步骤2: 创建数据处理任务');
      const taskData = {
        name: `自动测试任务_${Date.now()}`,
        description: '自动化测试创建的数据处理任务',
        datasetId: String(firstDataset.id),
        processingType: ProcessingType.CLEANING,
        config: {
          outputFormat: OutputFormat.JSON,
          cleaning: {
            removeNulls: true,
            removeDuplicates: true
          }
        },
        outputFormat: OutputFormat.JSON
      };
      
      const response = await processingApi.createTask(taskData);
      setCreatedTask(response.data);
      addTestResult(`✅ 成功创建任务: ${response.data.name} (ID: ${response.data.id})`);
      
      // 步骤4: 启动任务
      addTestResult('步骤3: 启动处理任务');
      await processingApi.startTask(response.data.id);
      setTaskStatus('RUNNING');
      addTestResult('✅ 任务启动成功');
      
      // 步骤5: 检查任务状态
      addTestResult('步骤4: 检查任务状态');
      setTimeout(async () => {
        try {
          const statusResponse = await processingApi.getTask(response.data.id);
          const task = statusResponse.data;
          setTaskStatus(task.status);
          addTestResult(`✅ 任务状态: ${task.status}, 进度: ${task.progress}%`);
          
          if (task.status === ProcessingStatus.SUCCESS) {
            addTestResult('🎉 测试完成！数据处理任务执行成功');
          } else if (task.status === ProcessingStatus.FAILED) {
            addTestResult('❌ 测试失败！数据处理任务执行失败');
          } else {
            addTestResult('⏳ 任务仍在执行中，请稍后查看结果');
          }
        } catch (error) {
          addTestResult(`❌ 查询任务状态失败: ${error}`);
        }
      }, 2000);
      
    } catch (error) {
      addTestResult(`❌ 测试过程中发生错误: ${error}`);
      console.error('测试失败:', error);
    }
  };

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const response = await datasetApi.GetDatasets({ page: 1, size: 10 });
      setDatasets(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedDataset(response.data[0]);
      }
    } catch (error) {
      console.error('加载数据集失败:', error);
      showError('加载失败', '无法加载数据集列表');
    } finally {
      setLoading(false);
    }
  };

  const createProcessingTask = async (processingType: ProcessingType) => {
    if (!selectedDataset) {
      showError('错误', '请先选择数据集');
      return;
    }

    try {
      setLoading(true);
      const taskData = {
        name: `${processingType}处理任务_${Date.now()}`,
        description: `测试${processingType}处理任务`,
        datasetId: String(selectedDataset.id),
        processingType: processingType,
        config: {
          outputFormat: OutputFormat.JSON,
          cleaning: {
            removeNulls: true,
            removeDuplicates: true
          }
        },
        outputFormat: OutputFormat.JSON
      };

      const response = await processingApi.createTask(taskData);
      setCreatedTask(response.data);
      showSuccess('任务创建成功', `已创建${processingType}处理任务`);
      setStep(4);
    } catch (error) {
      console.error('创建任务失败:', error);
      showError('创建失败', '无法创建数据处理任务');
    } finally {
      setLoading(false);
    }
  };

  const startTask = async () => {
    if (!createdTask) return;

    try {
      setLoading(true);
      await processingApi.startTask(createdTask.id);
      showSuccess('任务启动成功', '数据处理任务已开始执行');
      setTaskStatus('RUNNING');
      setStep(5);
    } catch (error) {
      console.error('启动任务失败:', error);
      showError('启动失败', '无法启动数据处理任务');
    } finally {
      setLoading(false);
    }
  };

  const checkTaskStatus = async () => {
    if (!createdTask) return;

    try {
      const response = await processingApi.getTask(createdTask.id);
      const task = response.data;
      setTaskStatus(task.status);
      
      if (task.status === ProcessingStatus.SUCCESS) {
        showSuccess('任务完成', '数据处理任务已成功完成');
      } else if (task.status === ProcessingStatus.FAILED) {
        showError('任务失败', '数据处理任务执行失败');
      }
    } catch (error) {
      console.error('查询任务状态失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ProcessingStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case ProcessingStatus.RUNNING: return 'text-blue-600 bg-blue-100';
      case ProcessingStatus.SUCCESS: return 'text-green-600 bg-green-100';
      case ProcessingStatus.FAILED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case ProcessingStatus.PENDING: return '等待中';
      case ProcessingStatus.RUNNING: return '运行中';
      case ProcessingStatus.SUCCESS: return '成功';
      case ProcessingStatus.FAILED: return '失败';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            数据处理任务测试流程
          </h1>

          {/* API连接测试 */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-900">API连接测试</h3>
                <p className="text-sm text-yellow-700">测试前端是否能正确连接到后端数据处理服务</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${
                  apiTestResult.includes('✅') ? 'text-green-600' : 
                  apiTestResult.includes('❌') ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {apiTestResult || '未测试'}
                </span>
                <button
                  onClick={testAPI}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  测试API
                </button>
              </div>
            </div>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* 步骤1: 选择数据集 */}
          {step >= 1 && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">步骤1: 选择数据集</h2>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    选择要处理的数据集
                  </label>
                  <select
                    value={selectedDataset?.id || ''}
                    onChange={(e) => {
                      const dataset = datasets.find(d => String(d.id) === e.target.value);
                      setSelectedDataset(dataset || null);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">请选择数据集</option>
                    {datasets.map((dataset) => (
                      <option key={dataset.id} value={String(dataset.id)}>
                        {dataset.name} ({dataset.description})
                      </option>
                    ))}
                  </select>
                  {selectedDataset && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900">已选择数据集:</h3>
                      <p className="text-blue-800">{selectedDataset.name}</p>
                      <p className="text-blue-700 text-sm">{selectedDataset.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 步骤2: 选择处理类型 */}
          {step >= 2 && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">步骤2: 选择处理类型</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => createProcessingTask(ProcessingType.CLEANING)}
                    disabled={loading || !selectedDataset}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">数据清洗</h3>
                      <p className="text-sm text-gray-600 mt-1">CLEANING</p>
                    </div>
                  </button>
                  <button
                    onClick={() => createProcessingTask(ProcessingType.FILTERING)}
                    disabled={loading || !selectedDataset}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">数据过滤</h3>
                      <p className="text-sm text-gray-600 mt-1">FILTERING</p>
                    </div>
                  </button>
                  <button
                    onClick={() => createProcessingTask(ProcessingType.DEDUPLICATION)}
                    disabled={loading || !selectedDataset}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">数据去重</h3>
                      <p className="text-sm text-gray-600 mt-1">DEDUPLICATION</p>
                    </div>
                  </button>
                  <button
                    onClick={() => createProcessingTask(ProcessingType.FORMAT_CONVERSION)}
                    disabled={loading || !selectedDataset}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                  >
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">格式转换</h3>
                      <p className="text-sm text-gray-600 mt-1">FORMAT_CONVERSION</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤3: 任务创建结果 */}
          {step >= 4 && createdTask && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">步骤3: 任务创建结果</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">任务创建成功!</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">任务ID:</span> {createdTask.id}</p>
                    <p><span className="font-medium">任务名称:</span> {createdTask.name}</p>
                    <p><span className="font-medium">处理类型:</span> {createdTask.processingType}</p>
                    <p><span className="font-medium">状态:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(createdTask.status)}`}>
                        {getStatusText(createdTask.status)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={startTask}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '启动中...' : '启动任务'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤4: 任务执行状态 */}
          {step >= 5 && createdTask && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">步骤4: 任务执行状态</h2>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-blue-900">任务执行中...</h3>
                    <button
                      onClick={checkTaskStatus}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? '查询中...' : '刷新状态'}
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">当前状态:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(taskStatus)}`}>
                        {getStatusText(taskStatus)}
                      </span>
                    </p>
                    <p><span className="font-medium">任务ID:</span> {createdTask.id}</p>
                    <p><span className="font-medium">创建时间:</span> {new Date(createdTask.createdTime).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step <= 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => setStep(Math.min(5, step + 1))}
              disabled={step >= 5 || !selectedDataset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              下一步
            </button>
            <button
              onClick={runFullTest}
              disabled={loading || !selectedDataset}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              一键测试
            </button>
            <button
              onClick={() => {
                setStep(1);
                setSelectedDataset(null);
                setCreatedTask(null);
                setTaskStatus('');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              重新开始
            </button>
          </div>

          {/* 测试结果 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">测试结果:</h3>
            <div className="max-h-40 overflow-y-auto pr-2">
              {testResults.map((result, index) => (
                <p key={index} className="text-sm text-gray-800">{result}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}