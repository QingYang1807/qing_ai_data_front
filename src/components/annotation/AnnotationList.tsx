import React from 'react';
import { Table, Tag, Button, Space, Progress, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { AnnotationTask, AnnotationStatus, AnnotationType } from '@/types/annotation';
import { useRouter } from 'next/navigation';

interface Props {
    tasks: AnnotationTask[];
    loading?: boolean;
    onEdit: (task: AnnotationTask) => void;
    onDelete: (task: AnnotationTask) => void;
}

const AnnotationList: React.FC<Props> = ({ tasks, loading, onEdit, onDelete }) => {
    const router = useRouter();

    const handleStartAnnotation = (task: AnnotationTask) => {
        router.push(`/dashboard/annotation/${task.id}?type=${task.type}`);
    };

    const columns = [
        {
            title: '任务名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: AnnotationTask) => (
                <a onClick={() => handleStartAnnotation(record)} className="font-medium text-blue-600 hover:text-blue-800">
                    {text}
                </a>
            ),
        },
        {
            title: '数据集',
            dataIndex: 'datasetName',
            key: 'datasetName',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: AnnotationType) => {
                let color = 'default';
                switch (type) {
                    case 'TEXT': color = 'blue'; break;
                    case 'IMAGE': color = 'green'; break;
                    case 'AUDIO': color = 'purple'; break;
                    case 'VIDEO': color = 'geekblue'; break;
                    case 'CODE': color = 'cyan'; break;
                    case '3D': color = 'magenta'; break;
                }
                const typeMap: Record<string, string> = {
                    'TEXT': '文本',
                    'IMAGE': '图像',
                    'AUDIO': '音频',
                    'VIDEO': '视频',
                    'CODE': '代码',
                    '3D': '3D',
                };
                return <Tag color={color}>{typeMap[type] || type}</Tag>;
            },
            filters: [
                { text: '文本', value: 'TEXT' },
                { text: '图像', value: 'IMAGE' },
                { text: '音频', value: 'AUDIO' },
                { text: '视频', value: 'VIDEO' },
            ],
            onFilter: (value: any, record: AnnotationTask) => record.type === value,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: AnnotationStatus) => {
                let color = 'default';
                let text: string = status;
                switch (status) {
                    case 'PENDING': color = 'default'; text = '待处理'; break;
                    case 'IN_PROGRESS': color = 'processing'; text = '进行中'; break;
                    case 'COMPLETED': color = 'success'; text = '已完成'; break;
                    case 'ARCHIVED': color = 'warning'; text = '已归档'; break;
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '进度',
            key: 'progress',
            render: (_: any, record: AnnotationTask) => (
                <div style={{ width: 140 }}>
                    <Progress percent={record.progress} size="small" status={record.status === 'COMPLETED' ? 'success' : 'active'} />
                    <div className="text-xs text-gray-400">
                        {record.completedItems} / {record.totalItems} 项
                    </div>
                </div>
            ),
            sorter: (a: AnnotationTask, b: AnnotationTask) => a.progress - b.progress,
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            sorter: (a: AnnotationTask, b: AnnotationTask) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: '操作',
            key: 'actions',
            render: (_: any, record: AnnotationTask) => (
                <Space size="middle">
                    <Tooltip title="开始标注">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartAnnotation(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="查看详情">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            type="text"
                        />
                    </Tooltip>
                    <Tooltip title="编辑任务">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                            size="small"
                            type="text"
                        />
                    </Tooltip>
                    <Tooltip title="删除任务">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete(record)}
                            size="small"
                            type="text"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 项`,
            }}
        />
    );
};

export default AnnotationList;
