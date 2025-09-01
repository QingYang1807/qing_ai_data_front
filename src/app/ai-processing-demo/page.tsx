'use client';

import React, { useState } from 'react';
import AIAssistant from '@/components/processing/AIAssistant';
import IntelligentConfigPanel from '@/components/processing/IntelligentConfigPanel';
import QualityAssessment from '@/components/processing/QualityAssessment';
import { mockAIApi } from '@/api/ai-processing';
import { ProcessingConfig, QualityAssessmentResult, OutputFormat, AIModelType, KnowledgeBaseFormat, TrainingFormat } from '@/types';

export default function AIProcessingDemo() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'config' | 'quality'>('assistant');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ProcessingConfig>({
    outputFormat: OutputFormat.JSON,
    cleaning: {
      removeNulls: true,
      removeDuplicates: true,
      trimWhitespace: true
    },
    aiProcessing: {
      modelType: AIModelType.GPT,
      temperature: 0.7,
      intelligentCleaning: {
        semanticAnomalyDetection: true,
        missingValueImputation: true
      }
    },
    knowledgeBase: {
      format: KnowledgeBaseFormat.QA_PAIR,
      chunkSize: 1000,
      overlap: 200,
      qaGeneration: {
        questionTypes: ['factual', 'inferential'],
        answerTypes: ['extractive', 'generative'],
        maxQuestionsPerChunk: 3,
        qualityThreshold: 0.8
      }
    },
    training: {
      format: TrainingFormat.INSTRUCTION,
      instructionTuning: {
        instructionTemplate: '请根据以下内容回答问题：{input}',
        systemPrompt: '你是一个有用的AI助手',
        maxLength: 2048
      },
      dataAugmentation: {
        enabled: true,
        methods: ['paraphrase', 'synonym_replacement'],
        augmentationRatio: 0.3
      }
    },
    qualityAssessment: {
      enabled: true,
      metrics: ['completeness', 'accuracy', 'consistency'],
      threshold: 0.8,
      autoCorrection: true,
      detailedReport: true
    }
  });

  const [qualityResult, setQualityResult] = useState<QualityAssessmentResult | null>(null);

  const handleConfigUpdate = (config: ProcessingConfig) => {
    setCurrentConfig(config);
    console.log('配置已更新:', config);
  };

  const handleGenerateQualityResult = () => {
    const result = mockAIApi.generateMockQualityResult();
    setQualityResult(result);
  };

  const handleQualityRecommendation = (recommendation: any) => {
    console.log('应用质量建议:', recommendation);
    if (recommendation.config) {
      setCurrentConfig(recommendation.config);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI数据处理功能演示</h1>
                <p className="text-sm text-gray-500">体验智能化数据处理能力</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="btn-glass-primary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>AI助手</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'assistant', label: 'AI助手', icon: '🤖', description: '智能对话配置' },
                { id: 'config', label: '智能配置', icon: '⚙️', description: '可视化配置界面' },
                { id: 'quality', label: '质量评估', icon: '📊', description: '数据质量分析' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                  <span className="text-xs mt-1">{tab.description}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'assistant' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI智能助手</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  通过自然语言与AI助手对话，智能配置数据处理任务。支持知识库生成、训练数据集创建、数据清洗等多种功能。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-3xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">自然语言交互</h3>
                  <p className="text-gray-600 text-sm">
                    用自然语言描述你的需求，AI助手会自动理解并生成相应的配置
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-3xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">智能推荐</h3>
                  <p className="text-gray-600 text-sm">
                    基于数据集类型和内容，AI助手会推荐最适合的处理方案
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-3xl mb-4">⚡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">快速配置</h3>
                  <p className="text-gray-600 text-sm">
                    一键应用AI生成的配置，大大减少手动配置的时间
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowAIAssistant(true)}
                  className="btn-glass-primary text-lg px-8 py-3"
                >
                  开始与AI助手对话
                </button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">智能配置面板</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  可视化的配置界面，支持AI处理、知识库生成、训练数据集创建等多种功能的详细配置。
                </p>
              </div>

              <IntelligentConfigPanel
                config={currentConfig}
                onConfigChange={handleConfigUpdate}
                datasetType="TEXT"
              />
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">数据质量评估</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  全面的数据质量分析，包括完整性、准确性、一致性等多个维度的评估，并提供改进建议。
                </p>
              </div>

              <div className="text-center mb-6">
                <button
                  onClick={handleGenerateQualityResult}
                  className="btn-glass-primary"
                >
                  生成质量评估结果
                </button>
              </div>

              {qualityResult && (
                <QualityAssessment
                  result={qualityResult}
                  onApplyRecommendation={handleQualityRecommendation}
                />
              )}

              {!qualityResult && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">点击上方按钮生成质量评估</h3>
                  <p className="text-gray-600">系统将模拟生成一个完整的数据质量评估报告</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">核心功能特性</h2>
            <p className="text-gray-600">体验AI驱动的数据处理新方式</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">智能理解</h3>
              <p className="text-gray-600 text-sm">
                深度理解用户意图，自动生成最优配置
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">知识库生成</h3>
              <p className="text-gray-600 text-sm">
                智能文档分块，自动生成高质量问答对
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">训练数据</h3>
              <p className="text-gray-600 text-sm">
                支持多种训练格式，自动数据增强
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">质量评估</h3>
              <p className="text-gray-600 text-sm">
                多维度质量分析，智能改进建议
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onConfigUpdate={handleConfigUpdate}
        currentConfig={currentConfig}
        datasetType="TEXT"
      />
    </div>
  );
} 