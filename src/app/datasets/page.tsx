'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Space,
    Tag,
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import { datasetApi, Dataset } from '@/services/datasetApi';

const { TextArea } = Input;

export default function DatasetsPage() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
    const [form] = Form.useForm();

    // 加载数据
    const loadDatasets = async () => {
        setLoading(true);
        try {
            const result = await datasetApi.getList({ page: 1, size: 100 });
            if (result.success) {
                setDatasets(result.data.items || []);
                message.success(`加载成功,共${result.data.total}个数据集`);
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || '加载失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDatasets();
    }, []);

    // 打开新建/编辑弹窗
    const openModal = (dataset?: Dataset) => {
        setEditingDataset(dataset || null);
        if (dataset) {
            form.setFieldsValue({
                name: dataset.name,
                description: dataset.description,
                source: dataset.source,
            });
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    // 提交表单
    const handleSubmit = async (values: any) => {
        try {
            if (editingDataset) {
                // 更新
                const result = await datasetApi.update(editingDataset.id, values);
                if (result.success) {
                    message.success(result.message);
                    setModalVisible(false);
                    loadDatasets();
                }
            } else {
                // 创建
                const result = await datasetApi.create(values);
                if (result.success) {
                    message.success(result.message);
                    setModalVisible(false);
                    form.resetFields();
                    loadDatasets();
                }
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || '操作失败');
            console.error(error);
        }
    };

    // 删除数据集
    const handleDelete = async (id: string) => {
        try {
            const result = await datasetApi.delete(id);
            if (result.success) {
                message.success(result.message);
                loadDatasets();
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || '删除失败');
            console.error(error);
        }
    };

    // 状态标签颜色
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'default',
            IMPORTING: 'processing',
            IMPORTED: 'success',
            DEDUPED: 'cyan',
            PROCESSING: 'blue',
            COMPLETED: 'green',
            FAILED: 'red',
        };
        return colors[status] || 'default';
    };

    // 来源标签
    const getSourceLabel = (source: string) => {
        const labels: Record<string, string> = {
            file_upload: '文件上传',
            api: 'API对接',
            database: '数据库',
            manual: '手动创建',
        };
        return labels[source] || source;
    };

    // 表格列定义
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id: string) => <span className="font-mono text-xs text-gray-500">{id.substring(0, 8)}</span>
        },
        {
            title: '数据集名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (name: string) => <span className="font-medium">{name}</span>
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '来源',
            dataIndex: 'source',
            key: 'source',
            width: 120,
            render: (source: string) => <Tag>{getSourceLabel(source)}</Tag>
        },
        {
            title: '数据量',
            dataIndex: 'total_count',
            key: 'total_count',
            width: 100,
            render: (count: number) => <span className="font-mono">{count.toLocaleString()}</span>
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>
        },
        {
            title: '创建时间',
            dataIndex: 'created',
            key: 'created',
            width: 160,
            render: (time: string) => new Date(time).toLocaleString('zh-CN')
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right' as const,
            render: (_: any, record: Dataset) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确认删除"
                        description="删除后无法恢复,确定要删除这个数据集吗?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <DatabaseOutlined className="text-blue-500" />
                        数据源管理
                    </h1>
                    <p className="text-gray-500 mt-2">管理所有数据集,支持创建、编辑、删除操作</p>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadDatasets}
                        loading={loading}
                    >
                        刷新
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openModal()}
                        size="large"
                    >
                        新建数据集
                    </Button>
                </Space>
            </div>

            {/* 数据表格 */}
            <div className="bg-white rounded-lg shadow-sm">
                <Table
                    columns={columns}
                    dataSource={datasets}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条`,
                        pageSize: 20,
                    }}
                    scroll={{ x: 1200 }}
                />
            </div>

            {/* 新建/编辑弹窗 */}
            <Modal
                title={editingDataset ? '编辑数据集' : '新建数据集'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={600}
                okText="确定"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ source: 'manual' }}
                >
                    <Form.Item
                        name="name"
                        label="数据集名称"
                        rules={[
                            { required: true, message: '请输入数据集名称' },
                            { min: 2, message: '名称至少2个字符' },
                            { max: 100, message: '名称不能超过100个字符' }
                        ]}
                    >
                        <Input
                            placeholder="请输入数据集名称,如:电商评论数据集"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <TextArea
                            rows={4}
                            placeholder="请输入数据集描述,如:来自淘宝的商品评论数据"
                        />
                    </Form.Item>

                    <Form.Item
                        name="source"
                        label="数据来源"
                        rules={[{ required: true, message: '请选择数据来源' }]}
                    >
                        <Select size="large">
                            <Select.Option value="manual">手动创建</Select.Option>
                            <Select.Option value="file_upload">文件上传</Select.Option>
                            <Select.Option value="api">API对接</Select.Option>
                            <Select.Option value="database">数据库导入</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
