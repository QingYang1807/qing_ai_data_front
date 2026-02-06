'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Play,
    Square,
    Edit,
    Trash2,
    FileText,
    RefreshCw,
    Database,
    Globe,
    HardDrive,
    File,
    Layers,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { useCollectionStore } from '@/stores/useCollectionStore';
import { CollectionType, CollectionStatus, CollectionTask } from '@/types/collection';
import CollectionForm from './CollectionForm';
import CollectionDetailDrawer from './CollectionDetailDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const CollectionList: React.FC = () => {
    const {
        tasks,
        stats,
        loading,
        fetchTasks,
        deleteTask,
        startTask,
        stopTask
    } = useCollectionStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<CollectionTask | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Drawer State
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
    const [initialTab, setInitialTab] = useState<'overview' | 'logs'>('overview');

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTasks();
        setRefreshing(false);
    };

    const handleDelete = (task: CollectionTask) => {
        setConfirmDialog({
            visible: true,
            title: '删除任务',
            message: `确定要删除任务 "${task.name}" 吗？此操作不可恢复。`,
            onConfirm: async () => {
                await deleteTask(task.id);
                setConfirmDialog(prev => ({ ...prev, visible: false }));
            }
        });
    };

    const handleStart = async (task: CollectionTask) => {
        await startTask(task.id);
    };

    const handleStop = async (task: CollectionTask) => {
        await stopTask(task.id);
    };

    const handleShowLogs = (task: CollectionTask) => {
        setSelectedTask(task);
        setInitialTab('logs');
        setShowDrawer(true);
    };

    const handleShowDetail = (task: CollectionTask) => {
        setSelectedTask(task);
        setInitialTab('overview');
        setShowDrawer(true);
    };

    const getTypeIcon = (type: CollectionType) => {
        switch (type) {
            case CollectionType.DATABASE: return <Database className="w-4 h-4" />;
            case CollectionType.API: return <Globe className="w-4 h-4" />;
            case CollectionType.OBJECT_STORAGE: return <HardDrive className="w-4 h-4" />;
            case CollectionType.LOCAL_FILE: return <File className="w-4 h-4" />;
            case CollectionType.CRAWLER: return <Layers className="w-4 h-4" />;
            default: return <Database className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: CollectionStatus) => {
        switch (status) {
            case CollectionStatus.RUNNING: return 'text-blue-600 bg-blue-50 border-blue-200';
            case CollectionStatus.COMPLETED: return 'text-green-600 bg-green-50 border-green-200';
            case CollectionStatus.FAILED: return 'text-red-600 bg-red-50 border-red-200';
            case CollectionStatus.PAUSED: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: CollectionStatus) => {
        switch (status) {
            case CollectionStatus.RUNNING: return <RefreshCw className="w-3 h-3 animate-spin" />;
            case CollectionStatus.COMPLETED: return <CheckCircle className="w-3 h-3" />;
            case CollectionStatus.FAILED: return <XCircle className="w-3 h-3" />;
            case CollectionStatus.PAUSED: return <AlertTriangle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || task.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">数据采集</h1>
                    <p className="text-gray-600 mt-1">管理多源数据采集任务，支持数据库、API、文件和爬虫</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        className="btn-glass-secondary flex items-center space-x-2"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>刷新</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setShowForm(true);
                        }}
                        className="btn-glass-primary flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>新建任务</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">总任务数</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Layers className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">运行中</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
                        </div>
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin-slow" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">已完成</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">失败</p>
                            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜索任务名称..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-glass w-full pl-10 pr-4 py-2"
                        />
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="input-glass w-full lg:w-48 py-2 px-3"
                    >
                        <option value="all">所有类型</option>
                        <option value={CollectionType.DATABASE}>数据库</option>
                        <option value={CollectionType.API}>API接口</option>
                        <option value={CollectionType.OBJECT_STORAGE}>对象存储</option>
                        <option value={CollectionType.LOCAL_FILE}>本地文件</option>
                        <option value={CollectionType.CRAWLER}>网页爬虫</option>
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="input-glass w-full lg:w-48 py-2 px-3"
                    >
                        <option value="all">所有状态</option>
                        <option value={CollectionStatus.RUNNING}>运行中</option>
                        <option value={CollectionStatus.COMPLETED}>已完成</option>
                        <option value={CollectionStatus.FAILED}>失败</option>
                        <option value={CollectionStatus.PENDING}>等待中</option>
                        <option value={CollectionStatus.PAUSED}>已暂停</option>
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left py-4 px-6 font-medium text-gray-600">任务信息</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-600">类型</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-600">状态</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-600">进度/指标</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-600">上次运行</th>
                                <th className="text-center py-4 px-6 font-medium text-gray-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
                                        加载中...
                                    </td>
                                </tr>
                            ) : filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        暂无任务数据
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => handleShowDetail(task)}
                                    >
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-gray-900">{task.name}</p>
                                                <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{task.description}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-2 text-gray-700">
                                                {getTypeIcon(task.type)}
                                                <span className="text-sm">{task.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                                {getStatusIcon(task.status)}
                                                <span>{task.status}</span>
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {task.metrics ? (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span>已处理: {task.metrics.processedCount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${Math.min((task.metrics.successCount / (task.metrics.processedCount || 1)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {task.lastRunTime ? new Date(task.lastRunTime).toLocaleString() : '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center space-x-2" onClick={e => e.stopPropagation()}>
                                                {task.status === CollectionStatus.RUNNING ? (
                                                    <button
                                                        onClick={() => handleStop(task)}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="停止"
                                                    >
                                                        <Square className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStart(task)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="启动"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingTask(task);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="编辑"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleShowLogs(task)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                    title="日志"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(task)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="删除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.visible}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmType="danger"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
            />

            {/* Collection Form Modal */}
            {showForm && (
                <CollectionForm
                    initialData={editingTask}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        fetchTasks();
                    }}
                />
            )}

            {/* Detail Drawer */}
            {showDrawer && selectedTask && (
                <CollectionDetailDrawer
                    task={selectedTask}
                    initialTab={initialTab}
                    onClose={() => setShowDrawer(false)}
                />
            )}
        </div>
    );
};

export default CollectionList;
