'use client';

import React, { useState } from 'react';
import { Card, Steps, Button, Form, Input, Select, Radio, message, Divider, Descriptions, Alert } from 'antd';
import {
    FileSyncOutlined,
    AreaChartOutlined,
    SafetyCertificateOutlined,
    ExperimentOutlined,
    LeftOutlined,
    CheckOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import ProcessingTaskConfig from '@/components/processing/ProcessingTaskConfig';

const { Step } = Steps;
const { Option } = Select;

const TASK_TYPES = [
    { value: 'cleaning', label: '数据清洗', icon: <FileSyncOutlined />, desc: '去重、异常值处理、格式标准化' },
    { value: 'augmentation', label: '数据增强', icon: <AreaChartOutlined />, desc: '同义词替换、回译、随机噪声' },
    { value: 'desensitization', label: '隐私脱敏', icon: <SafetyCertificateOutlined />, desc: 'PII敏感信息识别与掩码处理' },
    { value: 'synthesis', label: '数据合成', icon: <ExperimentOutlined />, desc: '基于大模型生成高质量合成数据' },
];

// 模拟数据集
const MOCK_DATASETS = [
    { id: 'DS-001', name: '公开新闻语料库', size: '2.5GB', count: 500000 },
    { id: 'DS-002', name: '医疗问答数据集', size: '500MB', count: 12000 },
    { id: 'DS-003', name: '客户服务对话日志', size: '1.2GB', count: 85000 },
];

export default function CreateProcessingTaskPage() {
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const [taskType, setTaskType] = useState<string>('cleaning');

    const handleNext = () => {
        form.validateFields()
            .then(() => {
                setCurrent(current + 1);
            })
            .catch((err) => {
                console.error('Validation failed:', err);
            });
    };

    const handlePrev = () => {
        setCurrent(current - 1);
    };

    const updateTaskType = (type: string) => {
        setTaskType(type);
        form.setFieldsValue({ type });
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            console.log('Submission:', values);
            message.loading({ content: '正在创建任务...', key: 'createTask' });

            setTimeout(() => {
                message.success({ content: '任务创建成功！', key: 'createTask', duration: 2 });
                router.push('/dashboard/processing');
            }, 1500);
        });
    };

    // 步骤内容渲染
    const steps = [
        {
            title: '选择任务类型',
            content: (
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto py-8">
                    {TASK_TYPES.map((type) => (
                        <div
                            key={type.value}
                            onClick={() => updateTaskType(type.value)}
                            className={`
                cursor-pointer border rounded-lg p-6 flex items-start space-x-4 transition-all
                ${taskType === type.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
              `}
                        >
                            <div className={`text-2xl ${taskType === type.value ? 'text-blue-500' : 'text-gray-400'}`}>
                                {type.icon}
                            </div>
                            <div>
                                <h3 className="font-medium text-lg mb-1">{type.label}</h3>
                                <p className="text-gray-500 text-sm">{type.desc}</p>
                            </div>
                        </div>
                    ))}
                    <Form.Item name="type" initialValue="cleaning" hidden><Input /></Form.Item>
                </div>
            )
        },
        {
            title: '选择数据集',
            content: (
                <div className="max-w-2xl mx-auto py-8">
                    <Form.Item
                        name="datasetId"
                        label="输入数据集"
                        rules={[{ required: true, message: '请选择数据集' }]}
                    >
                        <Select placeholder="请选择要处理的数据集" size="large">
                            {MOCK_DATASETS.map(ds => (
                                <Option key={ds.id} value={ds.id}>
                                    {ds.name} <span className="text-gray-400 text-xs ml-2">({ds.count}条 | {ds.size})</span>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Alert
                        message="数据集说明"
                        description="请确保选择的数据集格式与处理任务类型匹配。例如，图像去重任务需要选择包含图像资源的数据集。"
                        type="info"
                        showIcon
                    />
                </div>
            )
        },
        {
            title: '参数配置',
            content: (
                <div className="max-w-3xl mx-auto py-8">
                    <Form.Item
                        name="name"
                        label="任务名称"
                        rules={[{ required: true, message: '请输入任务名称' }]}
                    >
                        <Input placeholder="为这个任务起个名字，如：清洗任务-20240120" size="large" />
                    </Form.Item>

                    <ProcessingTaskConfig taskType={taskType as any} />
                </div>
            )
        },
        {
            title: '确认提交',
            content: (
                <div className="max-w-2xl mx-auto py-8">
                    <Alert
                        message="在提交之前，请仔细核对以下信息"
                        type="success"
                        showIcon
                        className="mb-6"
                    />
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="任务名称">
                            <Form.Item name="name" noStyle>{(name) => name}</Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="任务类型">
                            {TASK_TYPES.find(t => t.value === taskType)?.label}
                        </Descriptions.Item>
                        <Descriptions.Item label="输入数据集">
                            <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => {
                                    const dsId = getFieldValue('datasetId');
                                    const ds = MOCK_DATASETS.find(d => d.id === dsId);
                                    return ds ? `${ds.name} (${ds.id})` : dsId;
                                }}
                            </Form.Item>
                        </Descriptions.Item>
                        <Descriptions.Item label="配置摘要">
                            <Form.Item noStyle shouldUpdate>
                                {({ getFieldValue }) => {
                                    const values = getFieldValue([]);
                                    // 简单显示一些关键配置，实际可根据类型定制
                                    return (
                                        <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">
                                            {JSON.stringify(values, null, 2)}
                                        </pre>
                                    );
                                }}
                            </Form.Item>
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Card title="新建数据处理任务" extra={<Button onClick={() => router.back()}>取消</Button>}>
                <Steps current={current} className="mb-8 max-w-4xl mx-auto">
                    {steps.map(item => <Step key={item.title} title={item.title} />)}
                </Steps>

                <Form form={form} layout="vertical" preserve={true}>
                    <div className="min-h-[400px]">
                        {steps[current].content}
                    </div>

                    <Divider />

                    <div className="flex justify-between max-w-4xl mx-auto px-4">
                        {current > 0 ? (
                            <Button onClick={handlePrev} size="large" icon={<LeftOutlined />}>上一步</Button>
                        ) : (
                            <div /> // 占位
                        )}

                        {current < steps.length - 1 && (
                            <Button type="primary" onClick={handleNext} size="large">下一步</Button>
                        )}

                        {current === steps.length - 1 && (
                            <Button type="primary" onClick={handleSubmit} size="large" icon={<CheckOutlined />}>
                                提交任务
                            </Button>
                        )}
                    </div>
                </Form>
            </Card>
        </div>
    );
}
