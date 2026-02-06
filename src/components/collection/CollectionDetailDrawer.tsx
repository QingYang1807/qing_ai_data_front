'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Activity, Clock, Settings, RefreshCw, Terminal } from 'lucide-react';
import { CollectionTask, CollectionLog } from '@/types/collection';
import { useCollectionStore } from '@/stores/useCollectionStore';

interface CollectionDetailDrawerProps {
    task: CollectionTask | null;
    onClose: () => void;
    initialTab?: 'overview' | 'logs' | 'config' | 'history';
}

const CollectionDetailDrawer: React.FC<CollectionDetailDrawerProps> = ({
    task,
    onClose,
    initialTab = 'overview'
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [logs, setLogs] = useState<CollectionLog[]>([]);
    const [history, setHistory] = useState<import('@/types/collection').CollectionExecution[]>([]);
    const { getLogs, getHistory } = useCollectionStore();

    useEffect(() => {
        if (task && activeTab === 'history') {
            const fetchHistory = async () => {
                const data = await getHistory(task.id);
                setHistory(data);
            };
            fetchHistory();
        }
    }, [task, activeTab]);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (task && activeTab === 'logs') {
            const fetchLogs = async () => {
                const data = await getLogs(task.id);
                setLogs(data);
            };

            fetchLogs();
            const interval = setInterval(fetchLogs, 5000); // Auto refresh logs
            return () => clearInterval(interval);
        }
    }, [task, activeTab]);

    if (!task) return null;

    const renderTabs = () => (
        <div className="flex border-b border-gray-100">
            {[
                { id: 'overview', label: '概览', icon: Activity },
                { id: 'logs', label: '实时日志', icon: Terminal },
                { id: 'config', label: '配置详情', icon: Settings },
                { id: 'history', label: '执行历史', icon: Clock },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
            flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
            ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }
          `}
                >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8 p-6 animate-fade-in">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">已处理数据</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {task.metrics?.processedCount.toLocaleString() ?? 0}
                        </span>
                        <span className="text-xs text-gray-400">条</span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">当前速率</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                            {task.metrics?.throughput.toFixed(1) ?? 0}
                        </span>
                        <span className="text-xs text-gray-400">条/秒</span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">成功率</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                            {task.metrics?.processedCount
                                ? ((task.metrics.successCount / task.metrics.processedCount) * 100).toFixed(1)
                                : 0}%
                        </span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">耗时</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {Math.floor((task.metrics?.duration ?? 0) / 60)}
                        </span>
                        <span className="text-xs text-gray-400">分</span>
                    </div>
                </div>
            </div>

            {/* Task Info */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">基本信息</h3>
                <dl className="grid grid-cols-1 gap-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <dt className="text-gray-500">任务ID</dt>
                        <dd className="font-mono text-gray-900">{task.id}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <dt className="text-gray-500">任务类型</dt>
                        <dd className="font-medium text-gray-900">{task.type}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <dt className="text-gray-500">创建时间</dt>
                        <dd className="text-gray-900">{new Date(task.createdAt).toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <dt className="text-gray-500">上次运行</dt>
                        <dd className="text-gray-900">{task.lastRunTime ? new Date(task.lastRunTime).toLocaleString() : '-'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-50">
                        <dt className="text-gray-500">Cron调度</dt>
                        <dd className="font-mono text-gray-900">{task.schedule || '手动'}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 overflow-auto">
            {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Waiting for logs...
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log.id} className="mb-1 flex">
                        <span className="text-gray-500 flex-shrink-0 mr-3">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`
                   flex-shrink-0 w-12 mr-3 font-bold
                   ${log.level === 'ERROR' ? 'text-red-500' : ''}
                   ${log.level === 'WARN' ? 'text-yellow-500' : ''}
                   ${log.level === 'INFO' ? 'text-blue-400' : ''}
                `}>
                            [{log.level}]
                        </span>
                        <span className="break-all">{log.message}</span>
                    </div>
                ))
            )}
        </div>
    );

    const renderConfig = () => (
        <div className="p-6 space-y-6">
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                    {JSON.stringify(task.config, null, 2)}
                </pre>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="flex flex-col h-full">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                    <Clock className="w-12 h-12 mb-3 text-gray-300" />
                    <p>暂无执行记录</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {history.map((exec) => (
                        <div key={exec.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className={`w-2 h-2 rounded-full ${exec.status === 'SUCCESS' ? 'bg-green-500' :
                                        exec.status === 'FAILED' ? 'bg-red-500' :
                                            exec.status === 'RUNNING' ? 'bg-blue-500' : 'bg-gray-400'
                                        }`} />
                                    <span className="font-medium text-gray-900">{exec.status}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {exec.triggerType === 'MANUAL' ? '手动' : '定时'}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(exec.startTime).toLocaleString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                                <div>
                                    <p className="text-gray-500 text-xs mb-0.5">持续时间</p>
                                    <p className="font-mono">{exec.duration ? `${exec.duration}s` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-0.5">处理行数</p>
                                    <p className="font-mono">{exec.rowCount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-0.5">错误信息</p>
                                    <p className="font-mono text-red-500 truncate max-w-[150px]" title={exec.error || ''}>
                                        {exec.error || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity pointer-events-auto"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl transform transition-transform pointer-events-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{task.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                {renderTabs()}

                {/* Content */}
                <div className="flex-1 overflow-auto bg-white">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'logs' && renderLogs()}
                    {activeTab === 'config' && renderConfig()}
                    {activeTab === 'history' && renderHistory()}
                </div>
            </div>
        </div>
    );
};

export default CollectionDetailDrawer;
