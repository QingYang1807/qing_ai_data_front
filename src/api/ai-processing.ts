import { apiClients } from './client';
import { 
  ProcessingConfig, 
  AIProcessingConfig, 
  QualityAssessmentResult,
  KnowledgeBaseConfig,
  TrainingDatasetConfig,
  OutputFormat
} from '@/types';

// AI处理相关API接口
export const aiProcessingApi = {
  // 智能配置推荐
  getRecommendations: async (datasetType: string, currentConfig?: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/recommendations', {
      datasetType,
      currentConfig
    });
    return response.data;
  },

  // 自然语言配置解析
  parseNaturalLanguage: async (input: string, context?: any) => {
    const response = await apiClients.process.post('/api/ai/parse-config', {
      input,
      context
    });
    return response.data;
  },

  // AI助手对话
  chatWithAssistant: async (message: string, conversationHistory?: any[]) => {
    const response = await apiClients.process.post('/api/ai/chat', {
      message,
      conversationHistory
    });
    return response.data;
  },

  // 数据质量评估
  assessQuality: async (data: any, config?: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/quality-assessment', {
      data,
      config
    });
    return response.data;
  },

  // 智能数据清洗
  intelligentCleaning: async (data: any, config: AIProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/intelligent-cleaning', {
      data,
      config
    });
    return response.data;
  },

  // 语义分析
  semanticAnalysis: async (data: any, config: AIProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/semantic-analysis', {
      data,
      config
    });
    return response.data;
  },

  // 内容生成
  generateContent: async (data: any, config: AIProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/content-generation', {
      data,
      config
    });
    return response.data;
  },

  // 知识库生成
  generateKnowledgeBase: async (data: any, config: KnowledgeBaseConfig) => {
    const response = await apiClients.process.post('/api/ai/knowledge-base-generation', {
      data,
      config
    });
    return response.data;
  },

  // 训练数据集生成
  generateTrainingDataset: async (data: any, config: TrainingDatasetConfig) => {
    const response = await apiClients.process.post('/api/ai/training-dataset-generation', {
      data,
      config
    });
    return response.data;
  },

  // 获取AI模型列表
  getAvailableModels: async () => {
    const response = await apiClients.process.get('/api/ai/models');
    return response.data;
  },

  // 测试AI模型连接
  testModelConnection: async (modelConfig: any) => {
    const response = await apiClients.process.post('/api/ai/test-connection', modelConfig);
    return response.data;
  },

  // 获取处理预览
  getProcessingPreview: async (data: any, config: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/processing-preview', {
      data,
      config
    });
    return response.data;
  },

  // 获取处理建议
  getProcessingSuggestions: async (data: any, currentConfig: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/processing-suggestions', {
      data,
      currentConfig
    });
    return response.data;
  },

  // 批量质量评估
  batchQualityAssessment: async (datasets: any[], config?: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/batch-quality-assessment', {
      datasets,
      config
    });
    return response.data;
  },

  // 获取AI处理统计
  getAIProcessingStats: async () => {
    const response = await apiClients.process.get('/api/ai/stats');
    return response.data;
  },

  // 获取AI处理历史
  getAIProcessingHistory: async (params?: any) => {
    const response = await apiClients.process.get('/api/ai/history', { params });
    return response.data;
  },

  // 保存AI配置模板
  saveAIConfigTemplate: async (template: any) => {
    const response = await apiClients.process.post('/api/ai/templates', template);
    return response.data;
  },

  // 获取AI配置模板列表
  getAIConfigTemplates: async () => {
    const response = await apiClients.process.get('/api/ai/templates');
    return response.data;
  },

  // 删除AI配置模板
  deleteAIConfigTemplate: async (templateId: string) => {
    const response = await apiClients.process.delete(`/api/ai/templates/${templateId}`);
    return response.data;
  },

  // 导出AI处理结果
  exportAIResults: async (taskId: string, format: string) => {
    const response = await apiClients.process.get(`/api/ai/export/${taskId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // 获取AI处理日志
  getAIProcessingLogs: async (taskId: string) => {
    const response = await apiClients.process.get(`/api/ai/logs/${taskId}`);
    return response.data;
  },

  // 重新运行AI处理任务
  rerunAITask: async (taskId: string, config?: ProcessingConfig) => {
    const response = await apiClients.process.post(`/api/ai/rerun/${taskId}`, { config });
    return response.data;
  },

  // 停止AI处理任务
  stopAITask: async (taskId: string) => {
    const response = await apiClients.process.post(`/api/ai/stop/${taskId}`);
    return response.data;
  },

  // 获取AI处理进度
  getAIProcessingProgress: async (taskId: string) => {
    const response = await apiClients.process.get(`/api/ai/progress/${taskId}`);
    return response.data;
  },

  // 验证AI配置
  validateAIConfig: async (config: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/validate-config', config);
    return response.data;
  },

  // 获取AI处理最佳实践
  getBestPractices: async (datasetType: string, processingType: string) => {
    const response = await apiClients.process.get('/api/ai/best-practices', {
      params: { datasetType, processingType }
    });
    return response.data;
  },

  // 获取AI处理文档
  getDocumentation: async (topic: string) => {
    const response = await apiClients.process.get('/api/ai/documentation', {
      params: { topic }
    });
    return response.data;
  },

  // 提交AI处理反馈
  submitFeedback: async (taskId: string, feedback: any) => {
    const response = await apiClients.process.post(`/api/ai/feedback/${taskId}`, feedback);
    return response.data;
  },

  // 获取AI处理性能指标
  getPerformanceMetrics: async (timeRange?: string) => {
    const response = await apiClients.process.get('/api/ai/performance', {
      params: { timeRange }
    });
    return response.data;
  },

  // 优化AI配置
  optimizeAIConfig: async (data: any, currentConfig: ProcessingConfig, optimizationGoal: string) => {
    const response = await apiClients.process.post('/api/ai/optimize-config', {
      data,
      currentConfig,
      optimizationGoal
    });
    return response.data;
  },

  // 获取AI处理成本估算
  getCostEstimate: async (data: any, config: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/cost-estimate', {
      data,
      config
    });
    return response.data;
  },

  // 获取AI处理时间估算
  getTimeEstimate: async (data: any, config: ProcessingConfig) => {
    const response = await apiClients.process.post('/api/ai/time-estimate', {
      data,
      config
    });
    return response.data;
  }
};

// 模拟数据生成函数（用于开发测试）
export const mockAIApi = {
  // 模拟质量评估结果
  generateMockQualityResult: (): QualityAssessmentResult => {
    return {
      completeness: {
        score: 0.85,
        missingValueRate: 0.15,
        fieldCompleteness: {
          'title': 0.95,
          'content': 0.80,
          'category': 0.90
        },
        recordCompleteness: 0.85,
        issues: [
          {
            field: 'content',
            missingCount: 150,
            missingRate: 0.20
          }
        ]
      },
      accuracy: {
        score: 0.92,
        semanticAccuracy: 0.95,
        factualAccuracy: 0.90,
        logicalConsistency: 0.91,
        issues: [
          {
            type: '格式错误',
            count: 25,
            description: '日期格式不一致',
            examples: ['2023-01-01', '01/01/2023', '2023.01.01']
          }
        ]
      },
      consistency: {
        score: 0.88,
        formatConsistency: 0.90,
        valueConsistency: 0.85,
        temporalConsistency: 0.89,
        issues: [
          {
            type: '值不一致',
            field: 'status',
            inconsistencyCount: 30,
            examples: ['active', 'Active', 'ACTIVE']
          }
        ]
      },
      relevance: {
        score: 0.94,
        domainRelevance: 0.96,
        taskRelevance: 0.92,
        contextRelevance: 0.94,
        issues: [
          {
            type: '低相关性',
            count: 15,
            description: '内容与主题相关性较低'
          }
        ]
      },
      usability: {
        score: 0.91,
        readability: 0.93,
        accessibility: 0.89,
        interpretability: 0.91,
        issues: [
          {
            type: '可读性问题',
            count: 20,
            description: '文本格式不规范'
          }
        ]
      },
      overallScore: 0.90,
      grade: 'A',
      recommendations: [
        {
          priority: 'high',
          title: '修复缺失值',
          description: '建议使用智能填充算法修复内容字段的缺失值',
          action: '启用智能缺失值填充',
          expectedImprovement: 0.15
        },
        {
          priority: 'medium',
          title: '标准化格式',
          description: '统一日期和状态字段的格式标准',
          action: '应用格式标准化规则',
          expectedImprovement: 0.08
        },
        {
          priority: 'low',
          title: '提升可读性',
          description: '优化文本格式以提高可读性',
          action: '应用文本格式化规则',
          expectedImprovement: 0.05
        }
      ]
    };
  },

  // 模拟AI响应
  generateMockAIResponse: (input: string) => {
    const responses = {
      '清洗': {
        content: '我理解你想要清洗数据。我将为你配置智能数据清洗功能，包括去除重复数据、修复格式问题、填充缺失值和标准化数据格式。',
        config: {
          outputFormat: OutputFormat.JSON,
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
        }
      },
      '知识库': {
        content: '我将为你配置知识库问答数据集生成功能，包括智能文档分块、自动生成问答对、质量评估和优化、向量化存储。',
        config: {
          outputFormat: OutputFormat.JSON,
          knowledgeBase: {
            format: 'QA_PAIR',
            chunkSize: 1000,
            overlap: 200,
            qaGeneration: {
              questionTypes: ['factual', 'inferential', 'open_ended'],
              answerTypes: ['extractive', 'generative'],
              maxQuestionsPerChunk: 3,
              qualityThreshold: 0.8
            }
          }
        }
      },
      '训练': {
        content: '我将为你配置模型训练数据集生成功能，包括指令学习格式、对话训练格式、数据增强和质量验证。',
        config: {
          outputFormat: 'JSONL',
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
          }
        }
      }
    };

    for (const [key, response] of Object.entries(responses)) {
      if (input.includes(key)) {
        return response;
      }
    }

    return {
      content: '我理解你的需求。为了更好地帮助你，请告诉我你的数据是什么类型，你想要实现什么目标，有什么特殊要求吗？',
      config: null
    };
  }
}; 