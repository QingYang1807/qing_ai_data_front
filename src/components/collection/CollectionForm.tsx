'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useCollectionStore } from '@/stores/useCollectionStore';
import { useDataSourceStore } from '@/stores/useDataSourceStore';
import { CollectionTask, CollectionType, CollectionTaskConfig } from '@/types/collection';

interface CollectionFormProps {
    initialData?: CollectionTask | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
    initialData,
    onClose,
    onSuccess
}) => {
    const { createTask, updateTask, loading, error: storeError } = useCollectionStore();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: CollectionType.DATABASE,
        schedule: '',
        config: {
            // Database
            datasourceId: '',
            tables: '', // will split by comma
            query: '',

            // API
            url: '',
            method: 'GET',
            params: '', // JSON string
            headers: '', // JSON string

            // Object Storage
            bucket: '',
            prefix: '',
            filePatterns: '', // will split by comma

            // Local File
            filePath: '',
            fileType: 'CSV',

            // Crawler
            startUrls: '', // will split by newline
            maxDepth: 1,
            maxPages: 100
        }
    });

    const { dataSources, fetchDataSources } = useDataSourceStore();

    useEffect(() => {
        // Load data sources if not loaded
        if (dataSources.length === 0) {
            fetchDataSources({ page: 1, size: 100 });
        }
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || '',
                type: initialData.type,
                schedule: initialData.schedule || '',
                config: {
                    ...formData.config,
                    ...initialData.config,
                    tables: initialData.config.tables?.join(',') || '',
                    params: JSON.stringify(initialData.config.params || {}, null, 2),
                    headers: JSON.stringify(initialData.config.headers || {}, null, 2),
                    filePatterns: initialData.config.filePatterns?.join(',') || '',
                    startUrls: initialData.config.startUrls?.join('\n') || ''
                }
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Validate
            if (!formData.name.trim()) throw new Error('任务名称不能为空');

            // Process config based on type
            const config: CollectionTaskConfig = {};

            switch (formData.type) {
                case CollectionType.DATABASE:
                    if (!formData.config.datasourceId) throw new Error('请选择数据源');
                    config.datasourceId = formData.config.datasourceId;
                    config.query = formData.config.query;
                    config.tables = formData.config.tables.split(',').map(t => t.trim()).filter(Boolean);
                    break;

                case CollectionType.API:
                    if (!formData.config.url) throw new Error('API地址不能为空');
                    config.url = formData.config.url;
                    config.method = formData.config.method as any;
                    try {
                        config.params = formData.config.params ? JSON.parse(formData.config.params) : {};
                        config.headers = formData.config.headers ? JSON.parse(formData.config.headers) : {};
                    } catch (e) {
                        throw new Error('Params或Headers必须是有效的JSON格式');
                    }
                    break;

                case CollectionType.OBJECT_STORAGE:
                    if (!formData.config.bucket) throw new Error('Bucket不能为空');
                    config.bucket = formData.config.bucket;
                    config.prefix = formData.config.prefix;
                    config.filePatterns = formData.config.filePatterns.split(',').map(p => p.trim()).filter(Boolean);
                    break;

                case CollectionType.LOCAL_FILE:
                    if (!formData.config.filePath) throw new Error('文件路径不能为空');
                    config.filePath = formData.config.filePath;
                    config.fileType = formData.config.fileType as any;
                    break;

                case CollectionType.CRAWLER:
                    if (!formData.config.startUrls) throw new Error('起始URL不能为空');
                    config.startUrls = formData.config.startUrls.split('\n').map(u => u.trim()).filter(Boolean);
                    config.maxDepth = Number(formData.config.maxDepth);
                    config.maxPages = Number(formData.config.maxPages);
                    break;
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                schedule: formData.schedule,
                config
            };

            if (initialData) {
                await updateTask(initialData.id, payload);
            } else {
                await createTask(payload);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const renderConfigFields = () => {
        switch (formData.type) {
            case CollectionType.DATABASE:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                数据源 <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.config.datasourceId}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, datasourceId: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                            >
                                <option value="">请选择数据源...</option>
                                {dataSources.map(ds => (
                                    <option key={ds.id} value={ds.id}>
                                        {ds.name} ({ds.type})
                                    </option>
                                ))}
                            </select>
                            {dataSources.length === 0 && (
                                <p className="text-xs text-yellow-600 mt-1">暂无可用数据源，请先到数据源管理页面添加</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                表名 (逗号分隔)
                            </label>
                            <input
                                type="text"
                                value={formData.config.tables}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, tables: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="users, orders"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                自定义查询SQL
                            </label>
                            <textarea
                                value={formData.config.query}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, query: e.target.value } })}
                                className="input-glass w-full px-3 py-2 h-24 font-mono text-sm"
                                placeholder="SELECT * FROM users WHERE created_at > NOW() - INTERVAL 1 DAY"
                            />
                        </div>
                    </>
                );

            case CollectionType.API:
                return (
                    <>
                        <div className="flex gap-4">
                            <div className="w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <select
                                    value={formData.config.method}
                                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, method: e.target.value } })}
                                    className="input-glass w-full px-3 py-2"
                                >
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.config.url}
                                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, url: e.target.value } })}
                                    className="input-glass w-full px-3 py-2"
                                    placeholder="https://api.example.com/data"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Params (JSON)</label>
                            <textarea
                                value={formData.config.params}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, params: e.target.value } })}
                                className="input-glass w-full px-3 py-2 h-20 font-mono text-sm"
                                placeholder='{"limit": 100, "offset": 0}'
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Headers (JSON)</label>
                            <textarea
                                value={formData.config.headers}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, headers: e.target.value } })}
                                className="input-glass w-full px-3 py-2 h-20 font-mono text-sm"
                                placeholder='{"Authorization": "Bearer token"}'
                            />
                        </div>
                    </>
                );

            case CollectionType.OBJECT_STORAGE:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bucket <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.config.bucket}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, bucket: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="my-data-bucket"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                            <input
                                type="text"
                                value={formData.config.prefix}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, prefix: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="raw/data/"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">文件模式 (逗号分隔)</label>
                            <input
                                type="text"
                                value={formData.config.filePatterns}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, filePatterns: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="*.json, *.csv"
                            />
                        </div>
                    </>
                );

            case CollectionType.LOCAL_FILE:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">文件路径 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.config.filePath}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, filePath: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="/data/import/file.csv"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">文件类型</label>
                            <select
                                value={formData.config.fileType}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, fileType: e.target.value } })}
                                className="input-glass w-full px-3 py-2"
                            >
                                <option value="CSV">CSV</option>
                                <option value="JSON">JSON</option>
                                <option value="TXT">TXT</option>
                            </select>
                        </div>
                    </>
                );

            case CollectionType.CRAWLER:
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">起始URL (每行一个) <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.config.startUrls}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, startUrls: e.target.value } })}
                                className="input-glass w-full px-3 py-2 h-24 font-mono text-sm"
                                placeholder="https://example.com/start"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">最大深度</label>
                                <input
                                    type="number"
                                    value={formData.config.maxDepth}
                                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxDepth: parseInt(e.target.value) } })}
                                    className="input-glass w-full px-3 py-2"
                                    min={1}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">最大页面数</label>
                                <input
                                    type="number"
                                    value={formData.config.maxPages}
                                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxPages: parseInt(e.target.value) } })}
                                    className="input-glass w-full px-3 py-2"
                                    min={1}
                                />
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {initialData ? '编辑采集任务' : '新建采集任务'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            配置数据源和采集规则
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {(error || storeError) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <p className="text-sm text-red-700">{error || storeError}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                任务名称 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="例如：用户信息同步任务"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                任务描述
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="简要描述任务目标和范围"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                采集类型
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                disabled={!!initialData}
                                className="input-glass w-full px-3 py-2"
                            >
                                <option value={CollectionType.DATABASE}>数据库 (Database)</option>
                                <option value={CollectionType.API}>API接口 (REST/HTTP)</option>
                                <option value={CollectionType.OBJECT_STORAGE}>对象存储 (S3/OSS)</option>
                                <option value={CollectionType.LOCAL_FILE}>本地文件 (CSV/JSON)</option>
                                <option value={CollectionType.CRAWLER}>网页爬虫 (Web Crawler)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                调度计划 (Cron)
                            </label>
                            <input
                                type="text"
                                value={formData.schedule}
                                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                className="input-glass w-full px-3 py-2"
                                placeholder="0 0 * * * (可为空)"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                            {formData.type} 配置
                        </h3>
                        <div className="grid gap-4">
                            {renderConfigFields()}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justification-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{initialData ? '保存修改' : '立即创建'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionForm;
