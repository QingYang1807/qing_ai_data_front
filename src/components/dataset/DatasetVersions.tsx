import React, { useEffect, useState } from 'react';
import {
    GitBranch,
    Clock,
    RotateCcw,
    Check,
    AlertCircle,
    Plus,
    FileText,
    ArrowRight,
    GitCommit,
    Tag,
    Search
} from 'lucide-react';
import { Dataset, DatasetVersion, VersionComparison } from '@/types';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { useToast } from '@/hooks/useToast';

interface DatasetVersionsProps {
    dataset: Dataset;
}

export default function DatasetVersions({ dataset }: DatasetVersionsProps) {
    const {
        currentVersions,
        loadingVersions,
        totalVersions,
        versionsPage,
        fetchDatasetVersions,
        createDatasetVersion,
        rollbackToVersion,
        compareVersions
    } = useDatasetStore();

    const { showSuccess, showError } = useToast();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<VersionComparison | null>(null);
    const [loadingCompare, setLoadingCompare] = useState(false);

    useEffect(() => {
        if (dataset.id) {
            fetchDatasetVersions(dataset.id);
        }
    }, [dataset.id, fetchDatasetVersions]);

    const handleRollback = async (version: DatasetVersion) => {
        if (!dataset.id || !confirm(`确定要回滚到版本 ${version.version} 吗？这将覆盖当前数据集内容。`)) return;

        try {
            await rollbackToVersion(dataset.id, version.id);
            showSuccess('回滚成功', `已回滚到版本 ${version.version}`);
        } catch (error) {
            // Error handled in store
        }
    };

    const handleCompare = async () => {
        if (!dataset.id || selectedVersions.length !== 2) return;

        setLoadingCompare(true);
        try {
            const result = await compareVersions(dataset.id, selectedVersions[1], selectedVersions[0]); // Older vs Newer
            setComparisonResult(result);
            setShowCompareModal(true);
        } catch (error) {
            // Error handled in store
        } finally {
            setLoadingCompare(false);
        }
    };

    const toggleVersionSelection = (versionId: string) => {
        if (selectedVersions.includes(versionId)) {
            setSelectedVersions(prev => prev.filter(id => id !== versionId));
        } else {
            if (selectedVersions.length >= 2) {
                // Replace the first selected one (older selection)
                setSelectedVersions(prev => [prev[1], versionId]);
            } else {
                setSelectedVersions(prev => [...prev, versionId]);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">版本历史</h3>
                    <p className="text-sm text-gray-500">管理数据集的版本快照、回滚和比较</p>
                </div>
                <div className="flex items-center space-x-3">
                    {selectedVersions.length === 2 && (
                        <button
                            onClick={handleCompare}
                            disabled={loadingCompare}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            {loadingCompare ? '比较中...' : '比较选版本'}
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        创建新版本
                    </button>
                </div>
            </div>

            {loadingVersions ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {currentVersions.map((version) => (
                            <li
                                key={version.id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${selectedVersions.includes(version.id) ? 'bg-blue-50 hover:bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="mt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedVersions.includes(version.id)}
                                                onChange={() => toggleVersionSelection(version.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {version.version}
                                                </span>
                                                {version.isLatest && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        最新
                                                    </span>
                                                )}
                                                {version.isStable && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        稳定
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-900 font-medium">
                                                {version.versionName}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                                                {version.description || '无描述'}
                                            </p>
                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                                    {version.createdTime}
                                                </span>
                                                <span className="flex items-center">
                                                    <FileText className="w-3.5 h-3.5 mr-1" />
                                                    {version.fileCount} 文件
                                                </span>
                                                <span>
                                                    {((version.totalSize || 0) / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                                <span className="flex items-center">
                                                    <GitCommit className="w-3.5 h-3.5 mr-1" />
                                                    Created by {version.createdBy}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleRollback(version)}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                            回滚
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {currentVersions.length === 0 && (
                        <div className="text-center py-12">
                            <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无版本历史</h3>
                            <p className="mt-1 text-sm text-gray-500">创建一个新版本来保存当前数据集的状态</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    创建版本
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Version Modal */}
            {showCreateModal && (
                <CreateVersionModal
                    datasetId={dataset.id!}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        showSuccess('创建成功', '新版本已创建');
                    }}
                />
            )}

            {/* Compare Version Modal */}
            {showCompareModal && comparisonResult && (
                <VersionCompareModal
                    comparison={comparisonResult}
                    onClose={() => setShowCompareModal(false)}
                />
            )}
        </div>
    );
}

// Create Version Modal Component
function CreateVersionModal({
    datasetId,
    onClose,
    onSuccess
}: {
    datasetId: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { createDatasetVersion, operationLoading } = useDatasetStore();
    const [formData, setFormData] = useState({
        version: '',
        versionName: '',
        description: '',
        isStable: false,
        changeLog: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.version || !formData.versionName) return;

        try {
            await createDatasetVersion(datasetId, formData);
            onSuccess();
        } catch (error) {
            // handled in store
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">创建新版本</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="version" className="block text-sm font-medium text-gray-700">版本号</label>
                        <input
                            type="text"
                            id="version"
                            required
                            placeholder="e.g. v1.0.0"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={formData.version}
                            onChange={e => setFormData({ ...formData, version: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="versionName" className="block text-sm font-medium text-gray-700">版本名称</label>
                        <input
                            type="text"
                            id="versionName"
                            required
                            placeholder="e.g. Initial Release"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={formData.versionName}
                            onChange={e => setFormData({ ...formData, versionName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
                        <textarea
                            id="description"
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="isStable"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={formData.isStable}
                            onChange={e => setFormData({ ...formData, isStable: e.target.checked })}
                        />
                        <label htmlFor="isStable" className="ml-2 block text-sm text-gray-900">
                            标记为稳定版本
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={operationLoading}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none flex items-center"
                        >
                            {operationLoading && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            创建
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Version Compare Modal Component
function VersionCompareModal({
    comparison,
    onClose
}: {
    comparison: VersionComparison;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">版本对比</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">基准版本</div>
                            <div className="text-lg font-bold">{comparison.version1.version}</div>
                            <div className="text-sm text-gray-700">{comparison.version1.versionName}</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-500 mb-1">对比版本</div>
                            <div className="text-lg font-bold text-blue-900">{comparison.version2.version}</div>
                            <div className="text-sm text-blue-700">{comparison.version2.versionName}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                文件变更统计
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-3 border rounded-md text-center">
                                    <div className="text-2xl font-semibold text-green-600">+{comparison.differences.newFiles.length}</div>
                                    <div className="text-xs text-gray-500">新增文件</div>
                                </div>
                                <div className="bg-white p-3 border rounded-md text-center">
                                    <div className="text-2xl font-semibold text-red-600">-{comparison.differences.removedFiles.length}</div>
                                    <div className="text-xs text-gray-500">删除文件</div>
                                </div>
                                <div className="bg-white p-3 border rounded-md text-center">
                                    <div className="text-2xl font-semibold text-blue-600">{comparison.differences.modifiedFiles.length}</div>
                                    <div className="text-xs text-gray-500">修改文件</div>
                                </div>
                            </div>
                        </div>

                        {comparison.differences.modifiedFiles.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-2">修改详情</h4>
                                <div className="bg-gray-50 rounded-md p-4 space-y-2">
                                    {comparison.differences.modifiedFiles.map((diff, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="font-medium">{diff.file.fileName}</span>
                                            <span className={diff.sizeChange > 0 ? "text-green-600" : "text-red-600"}>
                                                {diff.sizeChange > 0 ? '+' : ''}{(diff.sizeChange / 1024).toFixed(2)} KB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
}
