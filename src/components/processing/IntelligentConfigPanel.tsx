'use client';

import React, { useState, useEffect } from 'react';
import { 
  ProcessingConfig, 
  ProcessingType, 
  AIProcessingType, 
  IntelligentConfig,
  AIProcessingConfig,
  KnowledgeBaseConfig,
  TrainingDatasetConfig 
} from '@/types';

interface IntelligentConfigPanelProps {
  config: ProcessingConfig;
  onConfigChange: (config: ProcessingConfig) => void;
  datasetType?: string;
}

export default function IntelligentConfigPanel({
  config,
  onConfigChange,
  datasetType
}: IntelligentConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'ai' | 'knowledge' | 'training' | 'quality'>('basic');
  const [recommendations, setRecommendations] = useState<Array<{
    type: 'config' | 'template' | 'best_practice';
    title: string;
    description: string;
    confidence: number;
    action: string;
    config?: ProcessingConfig;
  }>>([]);

  useEffect(() => {
    generateRecommendations();
  }, [datasetType, config]);

  const generateRecommendations = () => {
    const recs = [];
    
    // 基于数据集类型的推荐
    if (datasetType === 'TEXT') {
      recs.push({
        type: 'best_practice',
        title: '文本数据最佳实践',
        description: '建议启用智能清洗和语义分析功能',
        confidence: 0.9,
        action: '应用推荐',
        config: {
          ...config,
          aiProcessing: {
            modelType: 'GPT',
            intelligentCleaning: {
              semanticAnomalyDetection: true,
              missingValueImputation: true
            },
            semanticProcessing: {
              entityRecognition: true,
              keywordExtraction: true
            }
          }
        }
      });
    }

    // 基于当前配置的推荐
    if (config.cleaning?.removeDuplicates) {
      recs.push({
        type: 'config',
        title: '增强去重功能',
        description: '建议启用语义去重和模糊匹配',
        confidence: 0.8,
        action: '增强配置',
        config: {
          ...config,
          deduplication: {
            fields: ['content', 'title'],
            fuzzyMatch: true,
            similarityThreshold: 0.8
          }
        }
      });
    }

    setRecommendations(recs);
  };

  const handleRecommendationApply = (recommendation: any) => {
    if (recommendation.config) {
      onConfigChange(recommendation.config);
    }
  };

  const updateConfig = (updates: Partial<ProcessingConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateAIProcessing = (updates: Partial<AIProcessingConfig>) => {
    onConfigChange({
      ...config,
      aiProcessing: { ...config.aiProcessing, ...updates }
    });
  };

  const updateKnowledgeBase = (updates: Partial<KnowledgeBaseConfig>) => {
    onConfigChange({
      ...config,
      knowledgeBase: { ...config.knowledgeBase, ...updates }
    });
  };

  const updateTraining = (updates: Partial<TrainingDatasetConfig>) => {
    onConfigChange({
      ...config,
      training: { ...config.training, ...updates }
    });
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">智能配置</h3>
          <p className="text-gray-600">AI驱动的数据处理配置</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>AI已连接</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: '基础配置', icon: '⚙️' },
            { id: 'ai', label: 'AI处理', icon: '🤖' },
            { id: 'knowledge', label: '知识库', icon: '📚' },
            { id: 'training', label: '训练数据', icon: '🎯' },
            { id: 'quality', label: '质量评估', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'basic' && (
          <BasicConfigTab config={config} onConfigChange={updateConfig} />
        )}
        
        {activeTab === 'ai' && (
          <AIProcessingTab 
            config={config} 
            onConfigChange={updateAIProcessing} 
          />
        )}
        
        {activeTab === 'knowledge' && (
          <KnowledgeBaseTab 
            config={config} 
            onConfigChange={updateKnowledgeBase} 
          />
        )}
        
        {activeTab === 'training' && (
          <TrainingTab 
            config={config} 
            onConfigChange={updateTraining} 
          />
        )}
        
        {activeTab === 'quality' && (
          <QualityTab config={config} onConfigChange={updateConfig} />
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">智能推荐</h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-blue-900">{rec.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        置信度: {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">{rec.description}</p>
                    <button
                      onClick={() => handleRecommendationApply(rec)}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      {rec.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 基础配置标签页
function BasicConfigTab({ 
  config, 
  onConfigChange 
}: { 
  config: ProcessingConfig; 
  onConfigChange: (updates: Partial<ProcessingConfig>) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            输出格式
          </label>
          <select
            value={config.outputFormat}
            onChange={(e) => onConfigChange({ outputFormat: e.target.value as any })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="JSON">JSON</option>
            <option value="JSONL">JSONL</option>
            <option value="CSV">CSV</option>
            <option value="EXCEL">Excel</option>
            <option value="PARQUET">Parquet</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            编码格式
          </label>
          <select
            value={config.encoding || 'UTF-8'}
            onChange={(e) => onConfigChange({ encoding: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTF-8">UTF-8</option>
            <option value="GBK">GBK</option>
            <option value="ISO-8859-1">ISO-8859-1</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">数据清洗选项</h4>
        <div className="space-y-3">
          {[
            { key: 'removeNulls', label: '移除空值' },
            { key: 'removeDuplicates', label: '移除重复' },
            { key: 'trimWhitespace', label: '去除空白字符' },
            { key: 'normalizeCase', label: '标准化大小写' },
            { key: 'fixEncoding', label: '修复编码问题' }
          ].map(option => (
            <label key={option.key} className="flex items-center">
              <input
                type="checkbox"
                checked={config.cleaning?.[option.key as keyof typeof config.cleaning] || false}
                onChange={(e) => onConfigChange({
                  cleaning: {
                    ...config.cleaning,
                    [option.key]: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// AI处理标签页
function AIProcessingTab({ 
  config, 
  onConfigChange 
}: { 
  config: ProcessingConfig; 
  onConfigChange: (updates: Partial<AIProcessingConfig>) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI模型类型
          </label>
          <select
            value={config.aiProcessing?.modelType || 'GPT'}
            onChange={(e) => onConfigChange({ modelType: e.target.value as any })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="GPT">GPT</option>
            <option value="CHATGLM">ChatGLM</option>
            <option value="CLAUDE">Claude</option>
            <option value="CUSTOM">自定义</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            温度参数
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.aiProcessing?.temperature || 0.7}
            onChange={(e) => onConfigChange({ temperature: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            当前值: {config.aiProcessing?.temperature || 0.7}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">智能清洗功能</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'semanticAnomalyDetection', label: '语义异常检测' },
            { key: 'missingValueImputation', label: '缺失值填充' },
            { key: 'errorCorrection', label: '错误修正' },
            { key: 'semanticDeduplication', label: '语义去重' }
          ].map(option => (
            <label key={option.key} className="flex items-center">
              <input
                type="checkbox"
                checked={config.aiProcessing?.intelligentCleaning?.[option.key as keyof typeof config.aiProcessing.intelligentCleaning] || false}
                onChange={(e) => onConfigChange({
                  intelligentCleaning: {
                    ...config.aiProcessing?.intelligentCleaning,
                    [option.key]: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">内容生成功能</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'questionGeneration', label: '问题生成' },
            { key: 'answerGeneration', label: '答案生成' },
            { key: 'summaryGeneration', label: '摘要生成' },
            { key: 'paraphraseGeneration', label: '改写生成' }
          ].map(option => (
            <label key={option.key} className="flex items-center">
              <input
                type="checkbox"
                checked={config.aiProcessing?.contentGeneration?.[option.key as keyof typeof config.aiProcessing.contentGeneration] || false}
                onChange={(e) => onConfigChange({
                  contentGeneration: {
                    ...config.aiProcessing?.contentGeneration,
                    [option.key]: e.target.checked
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// 知识库标签页
function KnowledgeBaseTab({ 
  config, 
  onConfigChange 
}: { 
  config: ProcessingConfig; 
  onConfigChange: (updates: Partial<KnowledgeBaseConfig>) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            知识库格式
          </label>
          <select
            value={config.knowledgeBase?.format || 'QA_PAIR'}
            onChange={(e) => onConfigChange({ format: e.target.value as any })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="QA_PAIR">问答对</option>
            <option value="DOCUMENT">文档</option>
            <option value="CHUNK">分块</option>
            <option value="EMBEDDING">向量</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分块大小
          </label>
          <input
            type="number"
            value={config.knowledgeBase?.chunkSize || 1000}
            onChange={(e) => onConfigChange({ chunkSize: parseInt(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            min="100"
            max="5000"
          />
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">问答生成配置</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['factual', 'inferential', 'open_ended', 'multiple_choice'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.knowledgeBase?.qaGeneration?.questionTypes?.includes(type as any) || false}
                    onChange={(e) => {
                      const currentTypes = config.knowledgeBase?.qaGeneration?.questionTypes || [];
                      const newTypes = e.target.checked
                        ? [...currentTypes, type]
                        : currentTypes.filter(t => t !== type);
                      onConfigChange({
                        qaGeneration: {
                          ...config.knowledgeBase?.qaGeneration,
                          questionTypes: newTypes
                        }
                      });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 训练数据标签页
function TrainingTab({ 
  config, 
  onConfigChange 
}: { 
  config: ProcessingConfig; 
  onConfigChange: (updates: Partial<TrainingDatasetConfig>) => void; 
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          训练格式
        </label>
        <select
          value={config.training?.format || 'INSTRUCTION'}
          onChange={(e) => onConfigChange({ format: e.target.value as any })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="INSTRUCTION">指令学习</option>
          <option value="CONVERSATION">对话训练</option>
          <option value="COMPLETION">文本补全</option>
          <option value="CLASSIFICATION">分类任务</option>
        </select>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">数据增强</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.training?.dataAugmentation?.enabled || false}
              onChange={(e) => onConfigChange({
                dataAugmentation: {
                  ...config.training?.dataAugmentation,
                  enabled: e.target.checked
                }
              })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">启用数据增强</span>
          </label>
          
          {config.training?.dataAugmentation?.enabled && (
            <div className="ml-6 space-y-2">
              {[
                'paraphrase',
                'back_translation', 
                'synonym_replacement',
                'sentence_insertion',
                'sentence_deletion'
              ].map(method => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.training?.dataAugmentation?.methods?.includes(method as any) || false}
                    onChange={(e) => {
                      const currentMethods = config.training?.dataAugmentation?.methods || [];
                      const newMethods = e.target.checked
                        ? [...currentMethods, method]
                        : currentMethods.filter(m => m !== method);
                      onConfigChange({
                        dataAugmentation: {
                          ...config.training?.dataAugmentation,
                          methods: newMethods
                        }
                      });
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 质量评估标签页
function QualityTab({ 
  config, 
  onConfigChange 
}: { 
  config: ProcessingConfig; 
  onConfigChange: (updates: Partial<ProcessingConfig>) => void; 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">质量评估配置</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.qualityAssessment?.enabled || false}
              onChange={(e) => onConfigChange({
                qualityAssessment: {
                  ...config.qualityAssessment,
                  enabled: e.target.checked
                }
              })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">启用质量评估</span>
          </label>
          
          {config.qualityAssessment?.enabled && (
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评估指标
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['completeness', 'accuracy', 'consistency', 'relevance', 'usability'].map(metric => (
                    <label key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.qualityAssessment?.metrics?.includes(metric) || false}
                        onChange={(e) => {
                          const currentMetrics = config.qualityAssessment?.metrics || [];
                          const newMetrics = e.target.checked
                            ? [...currentMetrics, metric]
                            : currentMetrics.filter(m => m !== metric);
                          onConfigChange({
                            qualityAssessment: {
                              ...config.qualityAssessment,
                              metrics: newMetrics
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  质量阈值
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.qualityAssessment?.threshold || 0.8}
                  onChange={(e) => onConfigChange({
                    qualityAssessment: {
                      ...config.qualityAssessment,
                      threshold: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  当前值: {config.qualityAssessment?.threshold || 0.8}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 