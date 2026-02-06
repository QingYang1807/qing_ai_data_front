'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Tag, Space, Form, Select, Upload, message, Steps } from 'antd';
import {
    FileSyncOutlined,
    UploadOutlined,
    CodeOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

// 模拟格式转换任务
const mockTasks = [
    {
        id: 'C-20240116-001',
        source: 'Raw Images (JPG)',
        target: 'TFRecord',
        status: 'completed',
        count: 50000,
        startTime: '2024-01-16 09:00:00',
        duration: '45m'
    },
    {
        id: 'C-20240116-002',
        source: 'Text Corpus (JSONL)',
        target: 'Arrow',
        status: 'running',
        count: 1200000,
        startTime: '2024-01-16 10:30:00',
        duration: 'Running'
    }
];

export default function ConversionPage() {
    const [currentStep, setCurrentStep] = useState(0);

    const columns = [
        { title: '任务ID', dataIndex: 'id', key: 'id' },
        { title: '源格式', dataIndex: 'source', key: 'source' },
        { title: '目标格式', dataIndex: 'target', key: 'target' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'completed' ? 'green' : 'blue'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        { title: '数据量', dataIndex: 'count', key: 'count' },
        { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
        { title: '耗时', dataIndex: 'duration', key: 'duration' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">数据格式转换</h1>
                <p className="text-gray-600">将数据转换为训练框架所需的高效格式 (TFRecord/Arrow/WebDataset)</p>
            </div>

            <Card title="新建转换任务" className="mb-6">
                <Steps current={currentStep} className="mb-8">
                    <Steps.Step title="选择数据" icon={<UploadOutlined />} />
                    <Steps.Step title="配置格式" icon={<CodeOutlined />} />
                    <Steps.Step title="执行转换" icon={<FileSyncOutlined />} />
                    <Steps.Step title="完成" icon={<CheckCircleOutlined />} />
                </Steps>

                <Form layout="inline">
                    <Form.Item label="输入数据集" style={{ width: 250 }}>
                        <Select placeholder="选择源数据集">
                            <Option value="ds1">ImageNet_Raw_V1</Option>
                            <Option value="ds2">CommonCrawl_Subset</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="目标格式" style={{ width: 200 }}>
                        <Select placeholder="选择目标格式">
                            <Option value="tfrecord">TFRecord (TensorFlow)</Option>
                            <Option value="arrow">Apache Arrow (PyTorch/HuggingFace)</Option>
                            <Option value="webdataset">WebDataset</Option>
                            <Option value="parquet">Parquet</Option>
                            <Option value="mindrecord">MindRecord</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="分片大小">
                        <Select defaultValue="100MB" style={{ width: 120 }}>
                            <Option value="100MB">100MB</Option>
                            <Option value="500MB">500MB</Option>
                            <Option value="1GB">1GB</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<FileSyncOutlined />} onClick={() => message.success('任务已提交')}>
                            开始转换
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="转换任务记录">
                <Table dataSource={mockTasks} columns={columns} rowKey="id" />
            </Card>
        </div>
    );
}
