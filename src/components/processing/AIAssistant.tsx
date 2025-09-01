'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AIAssistantInteraction, ProcessingConfig, AIProcessingConfig, OutputFormat } from '@/types';
import { useToast } from '@/hooks/useToast';

interface AIAssistantProps {
  visible: boolean;
  onClose: () => void;
  onConfigUpdate: (config: ProcessingConfig) => void;
  currentConfig?: ProcessingConfig;
  datasetType?: string;
}

export default function AIAssistant({ 
  visible, 
  onClose, 
  onConfigUpdate, 
  currentConfig,
  datasetType 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: any;
  }>>([
    {
      role: 'system',
      content: '你好！我是AI数据处理助手，可以帮助你配置数据处理任务。请告诉我你想要处理什么类型的数据，或者你想要实现什么目标？',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useToast();

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 根据数据集类型生成建议
  useEffect(() => {
    if (datasetType) {
      generateSuggestions(datasetType);
    }
  }, [datasetType]);

  const generateSuggestions = (type: string) => {
    const suggestionsMap: Record<string, string[]> = {
      'TEXT': [
        '清洗文本数据，去除重复和无效内容',
        '生成知识库问答对',
        '创建训练数据集',
        '提取关键词和实体',
        '情感分析和主题建模'
      ],
      'IMAGE': [
        '图像数据清洗和标准化',
        '提取图像特征',
        '生成图像描述',
        '创建图像分类数据集'
      ],
      'STRUCTURED': [
        '数据清洗和验证',
        '格式转换和标准化',
        '数据增强和特征工程',
        '隐私信息脱敏'
      ]
    };
    
    setSuggestions(suggestionsMap[type] || [
      '数据清洗和预处理',
      '格式转换',
      '质量评估',
      '数据增强'
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 模拟AI响应
      const response = await generateAIResponse(inputValue, currentConfig);
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 如果有配置更新，应用它
      if (response.config) {
        onConfigUpdate(response.config);
        showSuccess('配置已更新', 'AI助手已根据你的需求更新了处理配置');
      }
    } catch (error) {
      showError('AI助手错误', '无法生成响应，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (input: string, config?: ProcessingConfig) => {
    // 模拟AI处理逻辑
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerInput = input.toLowerCase();
    
    // 根据用户输入生成响应和配置
    if (lowerInput.includes('清洗') || lowerInput.includes('清理')) {
      return {
        content: '我理解你想要清洗数据。我将为你配置智能数据清洗功能，包括：\n• 去除重复数据\n• 修复格式问题\n• 填充缺失值\n• 标准化数据格式\n\n这个配置适合大多数数据清洗需求。',
        config: {
          ...config,
          outputFormat: config?.outputFormat || OutputFormat.JSON,
          cleaning: {
            removeNulls: true,
            removeDuplicates: true,
            trimWhitespace: true,
            normalizeCase: true,
            fixEncoding: true
          },
          aiProcessing: {
            modelType: 'GPT',
            intelligentCleaning: {
              semanticAnomalyDetection: true,
              missingValueImputation: true,
              errorCorrection: true
            }
          }
        } as ProcessingConfig
      };
    }

    if (lowerInput.includes('知识库') || lowerInput.includes('问答')) {
      return {
        content: '我将为你配置知识库问答数据集生成功能：\n• 智能文档分块\n• 自动生成问答对\n• 质量评估和优化\n• 向量化存储\n\n这将创建一个高质量的知识库数据集。',
        config: {
          ...config,
          outputFormat: OutputFormat.JSON,
          knowledgeBase: {
            format: 'QA_PAIR',
            chunkSize: 1000,
            overlap: 200,
            documentParsing: {
              supportedFormats: ['pdf', 'docx', 'html', 'md', 'txt'],
              extractImages: false,
              extractTables: true,
              extractHeaders: true
            },
            intelligentChunking: {
              method: 'semantic',
              preserveContext: true
            },
            qaGeneration: {
              questionTypes: ['factual', 'inferential', 'open_ended'],
              answerTypes: ['extractive', 'generative'],
              maxQuestionsPerChunk: 3,
              qualityThreshold: 0.8
            }
          },
          aiProcessing: {
            modelType: 'GPT',
            contentGeneration: {
              questionGeneration: true,
              answerGeneration: true,
              maxQuestions: 10
            }
          }
        } as ProcessingConfig
      };
    }

    if (lowerInput.includes('训练') || lowerInput.includes('微调')) {
      return {
        content: '我将为你配置模型训练数据集生成功能：\n• 指令学习格式\n• 对话训练格式\n• 数据增强\n• 质量验证\n\n这将创建一个适合大模型训练的高质量数据集。',
        config: {
          ...config,
          outputFormat: OutputFormat.JSONL,
          training: {
            format: 'INSTRUCTION',
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
          aiProcessing: {
            modelType: 'GPT',
            contentGeneration: {
              paraphraseGeneration: true
            }
          }
        } as ProcessingConfig
      };
    }

    // 默认响应
    return {
      content: '我理解你的需求。为了更好地帮助你，请告诉我：\n• 你的数据是什么类型？\n• 你想要实现什么目标？\n• 有什么特殊要求吗？\n\n我可以帮你配置数据清洗、知识库生成、训练数据集创建等功能。',
      config: config
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI数据处理助手</h3>
              <p className="text-sm text-gray-500">智能配置指导</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.metadata && (
                  <div className="mt-2 text-xs opacity-75">
                    {message.metadata.type === 'config_update' && '配置已更新'}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI正在思考...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">快速建议：</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="描述你的数据处理需求..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 