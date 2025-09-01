'use client';

import React, { useState } from 'react';
import { Database, FileText, Settings, Play, CheckCircle, AlertCircle } from 'lucide-react';

export default function CompleteProcessingDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      id: 1,
      title: '连接数据源',
      description: '配置并连接到您的数据源',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: '选择数据集',
      description: '从数据源中选择要处理的数据集',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: '配置处理任务',
      description: '设置数据处理参数和规则',
      icon: Settings,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      title: '执行处理',
      description: '启动数据处理任务并监控进度',
      icon: Play,
      color: 'bg-orange-500'
    },
    {
      id: 5,
      title: '查看结果',
      description: '检查处理结果并下载输出文件',
      icon: CheckCircle,
      color: 'bg-teal-500'
    }
  ];

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < 5) {
      setCurrentStep(stepId + 1);
    }
  };

  const startProcessing = () => {
    setIsProcessing(true);
    // 模拟处理过程
    setTimeout(() => {
      setIsProcessing(false);
      completeStep(4);
      completeStep(5);
    }, 3000);
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => currentStep === stepId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            完整的数据处理流程演示
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            从数据源连接到结果输出的完整数据处理工作流程，涵盖数据清洗、转换、分析和导出等全链路操作。
          </p>
        </div>

        {/* 流程步骤 */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* 步骤圆圈 */}
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
                    isStepCompleted(step.id) ? 'bg-green-500' : 
                    isStepActive(step.id) ? step.color : 'bg-gray-300'
                  }`}>
                    {isStepCompleted(step.id) ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <step.icon className="w-8 h-8" />
                    )}
                  </div>
                  
                  {/* 步骤编号 */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                    {step.id}
                  </div>
                </div>

                {/* 步骤信息 */}
                <div className="ml-4 min-w-[200px]">
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>

                {/* 连接线 */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block mx-8 flex-1 h-1 bg-gray-300 relative">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ${
                        isStepCompleted(step.id) ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 功能特性展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">多源数据接入</h3>
            </div>
            <p className="text-gray-600">
              支持MySQL、PostgreSQL、MongoDB、API等多种数据源，统一管理和访问。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">灵活配置</h3>
            </div>
            <p className="text-gray-600">
              提供丰富的数据处理配置选项，支持自定义规则和模板复用。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">实时监控</h3>
            </div>
            <p className="text-gray-600">
              实时监控处理进度，提供详细的日志记录和错误处理机制。
            </p>
          </div>
        </div>

        {/* 交互演示区域 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">流程演示</h2>
          
          <div className="space-y-6">
            {/* 步骤1: 连接数据源 */}
            <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              isStepActive(1) ? 'border-blue-500 bg-blue-50' : 
              isStepCompleted(1) ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isStepCompleted(1) ? 'bg-green-500' : 'bg-blue-500'
                  } text-white`}>
                    {isStepCompleted(1) ? <CheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">连接数据源</h3>
                    <p className="text-gray-600">配置数据库连接参数</p>
                  </div>
                </div>
                {isStepActive(1) && (
                  <button
                    onClick={() => completeStep(1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    配置完成
                  </button>
                )}
              </div>
              {isStepActive(1) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">数据库类型</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>MySQL</option>
                        <option>PostgreSQL</option>
                        <option>MongoDB</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">连接名称</label>
                      <input type="text" placeholder="输入连接名称" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 步骤2: 选择数据集 */}
            <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              isStepActive(2) ? 'border-green-500 bg-green-50' : 
              isStepCompleted(2) ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isStepCompleted(2) ? 'bg-green-500' : 'bg-gray-300'
                  } text-white`}>
                    {isStepCompleted(2) ? <CheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">选择数据集</h3>
                    <p className="text-gray-600">选择要处理的数据表</p>
                  </div>
                </div>
                {isStepActive(2) && (
                  <button
                    onClick={() => completeStep(2)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    选择完成
                  </button>
                )}
              </div>
              {isStepActive(2) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-2">
                    {['用户表', '订单表', '产品表'].map((table) => (
                      <div key={table} className="p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer">
                        <div className="font-medium text-gray-900">{table}</div>
                        <div className="text-sm text-gray-600">约 10,000 条记录</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 步骤3: 配置处理任务 */}
            <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              isStepActive(3) ? 'border-purple-500 bg-purple-50' : 
              isStepCompleted(3) ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isStepCompleted(3) ? 'bg-green-500' : 'bg-gray-300'
                  } text-white`}>
                    {isStepCompleted(3) ? <CheckCircle className="w-5 h-5" /> : '3'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">配置处理任务</h3>
                    <p className="text-gray-600">设置数据处理规则</p>
                  </div>
                </div>
                {isStepActive(3) && (
                  <button
                    onClick={() => completeStep(3)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    配置完成
                  </button>
                )}
              </div>
              {isStepActive(3) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">处理类型</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>数据清洗</option>
                        <option>数据转换</option>
                        <option>数据过滤</option>
                        <option>数据导出</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">输出格式</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option>JSON</option>
                        <option>CSV</option>
                        <option>Excel</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 步骤4-5: 执行处理和查看结果 */}
            <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
              isStepActive(4) || isStepActive(5) ? 'border-orange-500 bg-orange-50' : 
              isStepCompleted(5) ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isStepCompleted(5) ? 'bg-green-500' : 
                    isStepActive(4) || isStepActive(5) ? 'bg-orange-500' : 'bg-gray-300'
                  } text-white`}>
                    {isStepCompleted(5) ? <CheckCircle className="w-5 h-5" /> : 
                     isStepActive(4) || isStepActive(5) ? '4' : '4'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isStepActive(4) ? '执行处理' : isStepActive(5) ? '查看结果' : '执行处理'}
                    </h3>
                    <p className="text-gray-600">
                      {isStepActive(4) ? '启动数据处理任务' : 
                       isStepActive(5) ? '检查处理结果' : '启动数据处理任务'}
                    </p>
                  </div>
                </div>
                {isStepActive(4) && (
                  <button
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {isProcessing ? '处理中...' : '开始处理'}
                  </button>
                )}
              </div>
              {(isStepActive(4) || isStepActive(5)) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {isProcessing ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">正在处理数据，请稍候...</p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full transition-all duration-1000" style={{ width: '65%' }} />
                      </div>
                    </div>
                  ) : isStepCompleted(5) ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">处理完成！</p>
                      <p className="text-gray-600 mb-4">成功处理 8,500 条记录</p>
                      <div className="flex justify-center space-x-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          下载结果
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                          查看详情
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">准备就绪</p>
                      <p className="text-gray-600">点击"开始处理"按钮启动数据处理任务</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 重置按钮 */}
          {completedSteps.length === 5 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setCompletedSteps([]);
                  setIsProcessing(false);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                重新演示
              </button>
            </div>
          )}
        </div>

        {/* 总结 */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">完整流程已实现</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">✅ 已完成功能</h3>
              <ul className="space-y-1 text-blue-100">
                <li>• 数据源连接与管理</li>
                <li>• 数据集选择与预览</li>
                <li>• 处理任务配置与创建</li>
                <li>• 实时处理进度监控</li>
                <li>• 结果查看与下载</li>
                <li>• 处理历史记录</li>
                <li>• 模板管理与复用</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🚀 核心特性</h3>
              <ul className="space-y-1 text-blue-100">
                <li>• 可视化配置界面</li>
                <li>• 多种数据处理类型</li>
                <li>• 灵活的配置选项</li>
                <li>• 实时状态反馈</li>
                <li>• 完整的错误处理</li>
                <li>• 用户友好的交互</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}