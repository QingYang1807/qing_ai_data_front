'use client';

import React from 'react';
import { Card, Table, Tag, Button, Tabs, Badge } from 'antd';
import {
    RocketOutlined,
    SyncOutlined,
    BugOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { Brain, GitMerge } from 'lucide-react';

const { TabPane } = Tabs;

export default function TrainingPage() {
    const jobs = [
        {
            id: 'JOB-9082',
            name: 'Qwen-7B-Instruct-v2',
            status: 'training',
            epoch: '2/10',
            loss: '0.4521',
            dataset: 'Mixed-Corp-V2',
            feedbackCount: 124,
        },
        {
            id: 'JOB-9081',
            name: 'Llama3-Chinese-SFT',
            status: 'completed',
            epoch: '5/5',
            loss: '0.2105',
            dataset: 'SFT-General-100k',
            feedbackCount: 56,
        }
    ];

    const badCases = [
        {
            id: 'BC-001',
            content: 'Prompt: 解释量子纠缠... Response: [Hallucination]',
            source: 'User Feedback',
            status: 'pending',
            timestamp: '2024-01-20 14:30'
        },
        {
            id: 'BC-002',
            content: 'Image Generation: 6 fingers on hand',
            source: 'Auto Eval',
            status: 'fixed',
            timestamp: '2024-01-20 12:15'
        }
    ];

    const columns = [
        { title: 'Job ID', dataIndex: 'id', key: 'id' },
        { title: '模型名称', dataIndex: 'name', key: 'name' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'training' ? 'processing' : 'success'} icon={status === 'training' ? <SyncOutlined spin /> : <RocketOutlined />}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        { title: '进度 (Epoch)', dataIndex: 'epoch', key: 'epoch' },
        { title: '当前 Loss', dataIndex: 'loss', key: 'loss' },
        {
            title: 'BadCase回流',
            dataIndex: 'feedbackCount',
            key: 'feedback',
            render: (count: number) => <a className="text-blue-600">{count} 待处理</a>
        },
        {
            title: '操作',
            key: 'action',
            render: () => <Button size="small">详情</Button>
        }
    ];

    const badCaseColumns = [
        { title: 'Case ID', dataIndex: 'id', key: 'id' },
        { title: '内容摘要', dataIndex: 'content', key: 'content' },
        { title: '来源', dataIndex: 'source', key: 'source' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Badge status={status === 'fixed' ? 'success' : 'warning'} text={status} />
            )
        },
        { title: '时间', dataIndex: 'timestamp', key: 'timestamp' },
        {
            title: '操作',
            key: 'action',
            render: () => <Button size="small" type="primary">加入训练集</Button>
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">训练迭代</h1>
                    <p className="text-gray-600">管理模型训练任务与数据回流闭环 (Data Flywheel)</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600">新建训练任务</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <Tabs defaultActiveKey="1">
                        <TabPane tab={<span><RocketOutlined />训练任务</span>} key="1">
                            <Table dataSource={jobs} columns={columns} rowKey="id" pagination={false} />
                        </TabPane>
                        <TabPane tab={<span><LineChartOutlined />效果评估</span>} key="2">
                            <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">
                                Evaluation Metrics Charts Placeholder
                            </div>
                        </TabPane>
                    </Tabs>
                </Card>

                <Card title="Bad Case 回流池" extra={<Button type="text" size="small">查看全部</Button>}>
                    <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-start">
                        <BugOutlined className="text-orange-500 mt-1 mr-2" />
                        <div className="text-xs text-orange-700">
                            检测到 12 个新的高优先级 Bad Case，建议立即处理并触发增量训练。
                        </div>
                    </div>
                    <Table
                        dataSource={badCases}
                        columns={badCaseColumns.slice(0, 3)}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                    <Button block type="dashed" className="mt-4" icon={<SyncOutlined />}>触发增量更新</Button>
                </Card>
            </div>
        </div>
    );
}

// Icon helper
import { PlusOutlined } from '@ant-design/icons';
