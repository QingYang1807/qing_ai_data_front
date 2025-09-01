'use client';

import React, { useState } from 'react';
import { QualityAssessmentResult } from '@/types';

interface QualityAssessmentProps {
  result: QualityAssessmentResult;
  onApplyRecommendation?: (recommendation: any) => void;
}

export default function QualityAssessment({ 
  result, 
  onApplyRecommendation 
}: QualityAssessmentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'recommendations'>('overview');

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    if (score >= 0.6) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.8) return 'bg-blue-500';
    if (score >= 0.7) return 'bg-yellow-500';
    if (score >= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">数据质量评估</h3>
          <p className="text-gray-600">全面的数据质量分析和改进建议</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getGradeColor(result.grade)}`}>
              {result.grade}
            </div>
            <div className="text-sm text-gray-500 mt-1">总体评级</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
              {Math.round(result.overallScore * 100)}%
            </div>
            <div className="text-sm text-gray-500">综合得分</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: '概览', icon: '📊' },
            { id: 'details', label: '详细分析', icon: '🔍' },
            { id: 'recommendations', label: '改进建议', icon: '💡' }
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
        {activeTab === 'overview' && (
          <OverviewTab result={result} />
        )}
        
        {activeTab === 'details' && (
          <DetailsTab result={result} />
        )}
        
        {activeTab === 'recommendations' && (
          <RecommendationsTab 
            result={result} 
            onApplyRecommendation={onApplyRecommendation}
          />
        )}
      </div>
    </div>
  );
}

// 概览标签页
function OverviewTab({ result }: { result: QualityAssessmentResult }) {
  const metrics = [
    { name: '完整性', score: result.completeness.score, issues: result.completeness.issues.length },
    { name: '准确性', score: result.accuracy.score, issues: result.accuracy.issues.length },
    { name: '一致性', score: result.consistency.score, issues: result.consistency.issues.length },
    { name: '相关性', score: result.relevance.score, issues: result.relevance.issues.length },
    { name: '可用性', score: result.usability.score, issues: result.usability.issues.length }
  ];

  return (
    <div className="space-y-6">
      {/* 质量指标概览 */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">质量指标概览</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(metric => (
            <div key={metric.name} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                  {Math.round(metric.score * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${getScoreBarColor(metric.score)}`}
                  style={{ width: `${metric.score * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>问题数量: {metric.issues}</span>
                <span>{metric.score >= 0.8 ? '优秀' : metric.score >= 0.6 ? '良好' : '需改进'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 关键统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {result.completeness.missingValueRate.toFixed(1)}%
          </div>
          <div className="text-sm text-blue-700">缺失值率</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(result.accuracy.semanticAccuracy * 100)}%
          </div>
          <div className="text-sm text-green-700">语义准确性</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {result.recommendations.length}
          </div>
          <div className="text-sm text-purple-700">改进建议</div>
        </div>
      </div>
    </div>
  );
}

// 详细分析标签页
function DetailsTab({ result }: { result: QualityAssessmentResult }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'completeness',
      title: '完整性分析',
      score: result.completeness.score,
      description: '数据完整性和缺失值分析',
      details: result.completeness
    },
    {
      id: 'accuracy',
      title: '准确性分析',
      score: result.accuracy.score,
      description: '数据准确性和语义一致性分析',
      details: result.accuracy
    },
    {
      id: 'consistency',
      title: '一致性分析',
      score: result.consistency.score,
      description: '数据格式和值的一致性分析',
      details: result.consistency
    },
    {
      id: 'relevance',
      title: '相关性分析',
      score: result.relevance.score,
      description: '数据与任务的相关性分析',
      details: result.relevance
    },
    {
      id: 'usability',
      title: '可用性分析',
      score: result.usability.score,
      description: '数据的可读性和可解释性分析',
      details: result.usability
    }
  ];

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div key={section.id} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getScoreBarColor(section.score)}`}></div>
              <div>
                <h5 className="font-medium text-gray-900">{section.title}</h5>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${getScoreColor(section.score)}`}>
                {Math.round(section.score * 100)}%
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {expandedSection === section.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-3">
                {section.details.issues?.map((issue, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{issue.type}</div>
                        <div className="text-sm text-gray-600 mt-1">{issue.description}</div>
                        {issue.examples && issue.examples.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-500 mb-1">示例:</div>
                            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                              {issue.examples.slice(0, 3).join(', ')}
                              {issue.examples.length > 3 && '...'}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{issue.count}</div>
                        <div className="text-xs text-gray-500">条记录</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 改进建议标签页
function RecommendationsTab({ 
  result, 
  onApplyRecommendation 
}: { 
  result: QualityAssessmentResult;
  onApplyRecommendation?: (recommendation: any) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const sortedRecommendations = [...result.recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">改进建议</h4>
        <div className="text-sm text-gray-500">
          共 {result.recommendations.length} 条建议
        </div>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((rec, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}
                </span>
                <h5 className="font-medium text-gray-900">{rec.title}</h5>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  +{Math.round(rec.expectedImprovement * 100)}%
                </div>
                <div className="text-xs text-gray-500">预期提升</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                建议操作: {rec.action}
              </div>
              {onApplyRecommendation && (
                <button
                  onClick={() => onApplyRecommendation(rec)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  应用建议
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {result.recommendations.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h5 className="text-lg font-medium text-gray-900 mb-2">数据质量优秀</h5>
          <p className="text-gray-600">当前数据质量已达到标准，无需额外改进</p>
        </div>
      )}
    </div>
  );
}

// 辅助函数
function getScoreColor(score: number) {
  if (score >= 0.9) return 'text-green-600';
  if (score >= 0.8) return 'text-blue-600';
  if (score >= 0.7) return 'text-yellow-600';
  if (score >= 0.6) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBarColor(score: number) {
  if (score >= 0.9) return 'bg-green-500';
  if (score >= 0.8) return 'bg-blue-500';
  if (score >= 0.7) return 'bg-yellow-500';
  if (score >= 0.6) return 'bg-orange-500';
  return 'bg-red-500';
} 