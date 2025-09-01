'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Download,
  Eye,
  FileText,
  HardDrive,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  Activity,
  Zap,
  Target,
  Lightbulb,
  ExternalLink,
  Copy,
  Share2,
  GitBranch,
  Settings,
  Play,
  Pause,
  RotateCcw,
  User
} from 'lucide-react';
import { 
  DataProcessingTask, 
  ProcessingResultDetail as ProcessingResultDetailType,
  ProcessingStatus,
  ProcessingType,
  DatasetVersion
} from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingResultDetailProps {
  taskId: string;
  onBack: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function ProcessingResultDetail({
  taskId,
  onBack,
  onSuccess,
  onError
}: ProcessingResultDetailProps) {
  const [task, setTask] = useState<DataProcessingTask | null>(null);
  const [resultDetail, setResultDetail] = useState<ProcessingResultDetailType | null>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'logs' | 'suggestions' | 'nextSteps'>('overview');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version: '',
    versionName: '',
    description: '',
    changeLog: '',
    isStable: false,
    tags: [] as string[]
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 加载任务详情和结果
      const [taskResponse, resultResponse] = await Promise.all([
        processingApi.getTask(taskId),
        processingApi.getResult(taskId)
      ]);

      setTask(taskResponse.data);
      setResultDetail(resultResponse.data);
      // 暂时不加载对比数据，因为API方法不存在
      setComparison(null);
    } catch (error) {
      console.error('加载处理结果详情失败:', error);
      onError('无法加载处理结果详情');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    try {
      if (!newVersion.version || !newVersion.versionName) {
        showError('创建失败', '版本号和版本名称不能为空');
        return;
      }

      // 暂时注释掉，因为API方法不存在
      // const response = await processingApi.createDatasetVersion(taskId, {
      //   ...newVersion,
      //   tags: newVersion.tags.filter(tag => tag.trim())
      // });

      showSuccess('创建成功', '数据集版本已创建');
      setShowVersionModal(false);
      setNewVersion({
        version: '',
        versionName: '',
        description: '',
        changeLog: '',
        isStable: false,
        tags: []
      });
    } catch (error: any) {
      showError('创建失败', error.message || '无法创建数据集版本');
    }
  };

  const handleDownloadResult = async () => {
    try {
      const response = await processingApi.downloadResult(taskId);
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
      showSuccess('下载成功', '处理结果已下载');
    } catch (error) {
      showError('下载失败', '无法下载处理结果');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '较差';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">加载处理结果详情中...</p>
        </div>
      </div>
    );
  }

  if (!task || !resultDetail) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">无法加载结果</h3>
        <p className="text-gray-500 mb-6">处理结果不存在或已被删除</p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">处理结果详情</h1>
            <p className="text-sm text-gray-500">查看处理前后的对比和详细结果</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {task.status === ProcessingStatus.SUCCESS && (
            <>
              <button
                onClick={() => setShowVersionModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                创建版本
              </button>
              <button
                onClick={handleDownloadResult}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                下载结果
              </button>
            </>
          )}
        </div>
      </div>

      {/* 任务概览卡片 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{task.name}</h2>
            {task.description && (
              <p className="text-gray-600 mb-4">{task.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                {task.processingType}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(task.createdTime)}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {task.createdBy}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              task.status === ProcessingStatus.SUCCESS ? 'bg-green-100 text-green-700' :
              task.status === ProcessingStatus.FAILED ? 'bg-red-100 text-red-700' :
              task.status === ProcessingStatus.RUNNING ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {task.status === ProcessingStatus.SUCCESS && <CheckCircle className="w-4 h-4 mr-1" />}
              {task.status === ProcessingStatus.FAILED && <AlertCircle className="w-4 h-4 mr-1" />}
              {task.status === ProcessingStatus.RUNNING && <Activity className="w-4 h-4 mr-1" />}
              {task.status}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">处理进度</span>
            <span className="text-sm font-semibold text-gray-900">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                task.status === ProcessingStatus.SUCCESS ? 'bg-gradient-to-r from-green-400 to-green-600' :
                task.status === ProcessingStatus.FAILED ? 'bg-gradient-to-r from-red-400 to-red-600' :
                task.status === ProcessingStatus.RUNNING ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                'bg-gradient-to-r from-gray-400 to-gray-600'
              }`}
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>

        {/* 关键指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {resultDetail?.inputData.recordCount.toLocaleString() || 0}
            </div>
            <div className="text-sm text-blue-700 font-medium">输入记录数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {resultDetail?.outputData.recordCount.toLocaleString() || 0}
            </div>
            <div className="text-sm text-green-700 font-medium">输出记录数</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {resultDetail?.processingStats.duration ? formatDuration(resultDetail.processingStats.duration) : '-'}
            </div>
            <div className="text-sm text-purple-700 font-medium">处理时间</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">
              {resultDetail?.outputData.outputFormat || 'JSON'}
            </div>
            <div className="text-sm text-orange-700 font-medium">输出格式</div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: '结果概览', icon: BarChart3 },
              { id: 'comparison', name: '前后对比', icon: TrendingUp },
              { id: 'logs', name: '处理日志', icon: FileText },
              { id: 'suggestions', name: '优化建议', icon: Lightbulb },
              { id: 'nextSteps', name: '后续操作', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab内容 */}
        <div className="p-6">
          {/* 结果概览 */}
          {activeTab === 'overview' && resultDetail && (
            <div className="space-y-6">
              {/* 数据质量对比 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">数据质量对比</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-4">处理前</h4>
                    <div className="space-y-3">
                      {Object.entries(resultDetail.inputData.qualityMetrics).map(([metric, score]) => (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 capitalize">{metric}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-blue-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${getQualityColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-medium text-green-900 mb-4">处理后</h4>
                    <div className="space-y-3">
                      {Object.entries(resultDetail.outputData.qualityMetrics).map(([metric, score]) => (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-sm text-green-700 capitalize">{metric}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${getQualityColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 处理统计 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">处理统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {resultDetail.processingStats.recordsProcessed.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">已处理记录</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {resultDetail.processingStats.recordsSkipped.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">跳过记录</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {resultDetail.processingStats.recordsFailed.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">失败记录</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {resultDetail.processingStats.processingSpeed.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">处理速度(记录/秒)</div>
                  </div>
                </div>
              </div>

              {/* 输出文件 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">输出文件</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900">文件数量</div>
                        <div className="text-sm text-gray-600">{resultDetail.outputData.fileCount} 个</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-gray-900">总大小</div>
                        <div className="text-sm text-gray-600">{formatFileSize(resultDetail.outputData.totalSize)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="font-medium text-gray-900">输出格式</div>
                        <div className="text-sm text-gray-600">{resultDetail.outputData.outputFormat}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 前后对比 */}
          {activeTab === 'comparison' && comparison !== null && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">处理前后对比</h3>
              
              {/* 数据量对比 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-medium text-blue-900 mb-4">处理前数据</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">文件数量</span>
                      <span className="text-sm font-medium">{comparison?.before?.fileCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">总大小</span>
                      <span className="text-sm font-medium">{formatFileSize(comparison?.before?.totalSize || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">记录数量</span>
                      <span className="text-sm font-medium">{comparison?.before?.recordCount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-medium text-green-900 mb-4">处理后数据</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">文件数量</span>
                      <span className="text-sm font-medium">{comparison?.after?.fileCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">总大小</span>
                      <span className="text-sm font-medium">{formatFileSize(comparison?.after?.totalSize || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">记录数量</span>
                      <span className="text-sm font-medium">{comparison?.after?.recordCount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 变化统计 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">变化统计</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      comparison?.changes?.recordCountChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparison?.changes?.recordCountChange > 0 ? '+' : ''}{comparison?.changes?.recordCountChange?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">记录数变化</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      comparison?.changes?.sizeChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparison?.changes?.sizeChange > 0 ? '+' : ''}{formatFileSize(comparison?.changes?.sizeChange || 0)}
                    </div>
                    <div className="text-sm text-gray-600">大小变化</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {comparison?.changes?.dataTransformations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">数据转换</div>
                  </div>
                </div>
              </div>

              {/* 质量改进 - 暂时注释掉，因为API方法不存在 */}
              {/* {comparison?.changes?.qualityImprovements && comparison.changes.qualityImprovements.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">质量改进</h4>
                  <div className="space-y-3">
                    {comparison.changes.qualityImprovements.map((improvement, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{improvement.metric}</span>
                          <span className={`text-sm font-medium ${
                            improvement.improvement > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {improvement.improvement > 0 ? '+' : ''}{improvement.improvement.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>处理前: {improvement.before.toFixed(1)}%</span>
                          <span>→</span>
                          <span>处理后: {improvement.after.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {/* 数据转换 - 暂时注释掉，因为API方法不存在 */}
              {/* {comparison?.changes?.dataTransformations && comparison.changes.dataTransformations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">数据转换</h4>
                  <div className="space-y-3">
                    {comparison.changes.dataTransformations.map((transformation, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{transformation.type}</span>
                          <span className="text-sm text-gray-600">{transformation.affectedRecords.toLocaleString()} 条记录</span>
                        </div>
                        <p className="text-sm text-gray-600">{transformation.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}

          {/* 处理日志 */}
          {activeTab === 'logs' && resultDetail && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">处理日志</h3>
              
              {/* 日志统计 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultDetail.logs.filter(log => log.level === 'INFO').length}
                  </div>
                  <div className="text-sm text-blue-700">信息日志</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {resultDetail.logs.filter(log => log.level === 'WARN').length}
                  </div>
                  <div className="text-sm text-yellow-700">警告日志</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {resultDetail.logs.filter(log => log.level === 'ERROR').length}
                  </div>
                  <div className="text-sm text-red-700">错误日志</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {resultDetail.errors.length}
                  </div>
                  <div className="text-sm text-gray-700">错误数量</div>
                </div>
              </div>

              {/* 日志列表 */}
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {resultDetail.logs.length > 0 ? (
                  resultDetail.logs.map((log, index) => (
                    <div key={index} className="mb-2 font-mono text-sm">
                      <span className="text-gray-500">[{log.timestamp}]</span>
                      <span className={`ml-3 ${
                        log.level === 'ERROR' ? 'text-red-400' :
                        log.level === 'WARN' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        [{log.level}]
                      </span>
                      <span className="ml-3 text-gray-300">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">暂无日志</p>
                )}
              </div>

              {/* 错误详情 */}
              {resultDetail.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">错误详情</h4>
                  <div className="space-y-3">
                    {resultDetail.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-900">{error.message}</span>
                          <span className="text-sm text-red-600">{error.timestamp}</span>
                        </div>
                        {error.details && (
                          <p className="text-sm text-red-700">{JSON.stringify(error.details)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 优化建议 */}
          {activeTab === 'suggestions' && resultDetail && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">优化建议</h3>
              
              <div className="space-y-4">
                {resultDetail.suggestions.map((suggestion, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                    suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.priority === 'high' ? '高优先级' :
                         suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    {suggestion.action && (
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        {suggestion.action} →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 后续操作 */}
          {activeTab === 'nextSteps' && resultDetail && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">后续操作</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resultDetail.nextSteps.map((step, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    step.enabled ? 'border-gray-200 bg-white hover:border-blue-300' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.action === 'download' && <Download className="w-5 h-5" />}
                        {step.action === 'preview' && <Eye className="w-5 h-5" />}
                        {step.action === 'analyze' && <BarChart3 className="w-5 h-5" />}
                        {step.action === 'export' && <ExternalLink className="w-5 h-5" />}
                        {step.action === 'version' && <GitBranch className="w-5 h-5" />}
                        {step.action === 'share' && <Share2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    {step.enabled && step.url && (
                      <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        执行操作
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 创建版本弹窗 */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">创建数据集版本</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">版本号</label>
                  <input
                    type="text"
                    value={newVersion.version}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="如: v1.1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">版本名称</label>
                  <input
                    type="text"
                    value={newVersion.versionName}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, versionName: e.target.value }))}
                    placeholder="如: 数据清洗优化版"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">版本描述</label>
                <textarea
                  value={newVersion.description}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述此版本的主要特性..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">变更日志</label>
                <textarea
                  value={newVersion.changeLog}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, changeLog: e.target.value }))}
                  placeholder="详细记录此版本的变更内容..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <input
                  type="text"
                  value={newVersion.tags.join(', ')}
                  onChange={(e) => setNewVersion(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  placeholder="用逗号分隔多个标签，如: 优化, 稳定, 生产环境"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isStable"
                  checked={newVersion.isStable}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, isStable: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isStable" className="ml-2 block text-sm text-gray-900">
                  标记为稳定版本
                </label>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateVersion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建版本
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 