import React, { useState } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    PlayCircle,
    PauseCircle,
    Eye,
    RefreshCw,
    Zap,
    CheckCircle,
    AlertCircle,
    Clock,
    Filter
} from 'lucide-react';
import { Table, Tag, Tooltip, Modal, message, Progress } from 'antd';
import { AugmentationTask, AUGMENTATION_TYPES, AugmentationType } from '@/types/augment';
import { AugmentationForm } from './AugmentationForm';

// Mock data
const mockTasks: AugmentationTask[] = [
    {
        id: '1',
        name: '图像数据扩充_V1',
        type: 'image',
        dataSourceId: 'ds1',
        dataSourceName: 'InImageNet_Subset',
        status: 'running',
        progress: 45,
        config: [{ method: 'rotation', params: { degrees: 30 } }],
        multiplier: 2,
        createdAt: '2024-01-20 10:00:00',
        updatedAt: '2024-01-20 10:30:00',
        outputCount: 450
    },
    {
        id: '2',
        name: '文本同义词替换',
        type: 'text',
        dataSourceId: 'ds2',
        dataSourceName: 'News_Corpus_En',
        status: 'completed',
        progress: 100,
        config: [{ method: 'synonym', params: { rate: 0.2 } }],
        multiplier: 5,
        createdAt: '2024-01-19 14:00:00',
        updatedAt: '2024-01-19 16:00:00',
        outputCount: 5000
    },
    {
        id: '3',
        name: '语音降噪处理',
        type: 'audio',
        dataSourceId: 'ds3',
        dataSourceName: 'CallCenter_Records',
        status: 'failed',
        progress: 10,
        config: [{ method: 'noise', params: { snr: 20 } }],
        multiplier: 1,
        createdAt: '2024-01-18 09:00:00',
        updatedAt: '2024-01-18 09:10:00',
        outputCount: 50
    }
];

export const AugmentationList: React.FC = () => {
    const [tasks, setTasks] = useState<AugmentationTask[]>(mockTasks);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<AugmentationTask | null>(null);

    // Detail modal state
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [detailTask, setDetailTask] = useState<AugmentationTask | null>(null);

    const handleCreate = () => {
        setEditingTask(null);
        setIsFormVisible(true);
    };

    const handleEdit = (task: AugmentationTask) => {
        setEditingTask(task);
        setIsFormVisible(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个增强任务吗？',
            okType: 'danger',
            onOk: () => {
                setTasks(prev => prev.filter(t => t.id !== id));
                message.success('任务已删除');
            }
        });
    };

    const handleView = (task: AugmentationTask) => {
        setDetailTask(task);
        setIsDetailVisible(true);
    };

    const handleStart = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } as AugmentationTask : t));
        message.success('任务已启动');
    };

    const handleStop = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'pending' } as AugmentationTask : t));
        message.warning('任务已停止');
    };

    const handleFormSuccess = (values: Partial<AugmentationTask>) => {
        if (editingTask) {
            // Update
            setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...values } as AugmentationTask : t));
            message.success('任务更新成功');
        } else {
            // Create
            const newTask: AugmentationTask = {
                id: Date.now().toString(),
                status: 'pending',
                progress: 0,
                createdAt: new Date().toLocaleString(),
                updatedAt: new Date().toLocaleString(),
                dataSourceName: 'Unknown', // Mock
                ...values as any
            };
            setTasks(prev => [newTask, ...prev]);
            message.success('任务创建成功');
        }
        setIsFormVisible(false);
    };

    const getTypeLabel = (type: AugmentationType) => {
        return AUGMENTATION_TYPES.find(t => t.value === type)?.label || type;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'processing';
            case 'completed': return 'success';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || task.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Specs
    const stats = {
        total: tasks.length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
    };

    const columns = [
        {
            title: '任务名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: AugmentationTask) => (
                <div>
                    <div className="font-medium text-gray-900">{text}</div>
                    <div className="text-xs text-gray-500">{record.dataSourceName}</div>
                </div>
            )
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: AugmentationType) => (
                <Tag color="blue">{getTypeLabel(type)}</Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="capitalize text-sm">{status}</span>
                </div>
            )
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            width: 200,
            render: (progress: number, record: AugmentationTask) => (
                <div className="flex flex-col gap-1 w-full">
                    <Progress percent={progress} size="small" status={record.status === 'failed' ? 'exception' : record.status === 'completed' ? 'success' : 'active'} />
                    <span className="text-xs text-gray-400">输出: {record.outputCount || 0}</span>
                </div>
            )
        },
        {
            title: '增强参数',
            dataIndex: 'config',
            key: 'config',
            render: (config: any[]) => (
                <Tooltip title={JSON.stringify(config, null, 2)}>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded cursor-help">
                        {config[0]?.method} ...
                    </span>
                </Tooltip>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => <span className="text-gray-500 text-sm">{text}</span>
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: AugmentationTask) => (
                <div className="flex items-center space-x-2">
                    <Tooltip title="查看详情">
                        <button onClick={() => handleView(record)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    <Tooltip title="编辑">
                        <button onClick={() => handleEdit(record)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="w-4 h-4" />
                        </button>
                    </Tooltip>
                    {record.status === 'running' ? (
                        <Tooltip title="停止">
                            <button onClick={() => handleStop(record.id)} className="p-1 text-gray-400 hover:text-orange-600 transition-colors">
                                <PauseCircle className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    ) : (
                        <Tooltip title="启动">
                            <button onClick={() => handleStart(record.id)} className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                                <PlayCircle className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    )}

                    <Tooltip title="删除">
                        <button onClick={() => handleDelete(record.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-shadow flex items-center gap-3">
                        <Zap className="w-8 h-8 text-blue-600" />
                        数据增强
                    </h1>
                    <p className="text-gray-600 mt-1">管理多模态数据增强任务，提升模型训练效果</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-glass-primary flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>新建增强任务</span>
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">总任务数</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Zap className="w-8 h-8 text-blue-500 opacity-20" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">进行中</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
                        </div>
                        <RefreshCw className="w-8 h-8 text-blue-500 opacity-20" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">已完成</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">失败</p>
                            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    {/* Search */}
                    <div className="flex-1 min-w-0 relative w-full lg:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜索任务名称..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-glass w-full pl-10 pr-4 py-2"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="w-full lg:w-48">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="input-glass w-full py-2 px-3 text-sm"
                        >
                            <option value="all">所有类型</option>
                            {AUGMENTATION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full lg:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-glass w-full py-2 px-3 text-sm"
                        >
                            <option value="all">所有状态</option>
                            <option value="pending">等待中</option>
                            <option value="running">进行中</option>
                            <option value="completed">已完成</option>
                            <option value="failed">失败</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredTasks}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条`
                    }}
                />
            </div>

            <AugmentationForm
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSuccess={handleFormSuccess}
                initialValues={editingTask}
            />

            <Modal
                title="增强任务详情"
                open={isDetailVisible}
                onCancel={() => setIsDetailVisible(false)}
                footer={null}
                width={700}
                className="glass-modal"
            >
                {detailTask && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">任务名称</label>
                                <div className="text-gray-900 font-medium">{detailTask.name}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">数据源</label>
                                <div className="text-gray-900">{detailTask.dataSourceName}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">类型</label>
                                <Tag color="blue">{getTypeLabel(detailTask.type)}</Tag>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">状态</label>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(detailTask.status)}
                                    <span>{detailTask.status}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">创建时间</label>
                                <div className="text-gray-600">{detailTask.createdAt}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">增强倍数</label>
                                <div className="text-gray-900">{detailTask.multiplier}x</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 block">增强策略配置</h4>
                            <div className="space-y-2">
                                {detailTask.config.map((conf, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-gray-700">{conf.method}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100">
                                            <pre className="whitespace-pre-wrap font-mono">
                                                {JSON.stringify(conf.params, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
