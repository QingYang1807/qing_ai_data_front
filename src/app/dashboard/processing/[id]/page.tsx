'use client';

import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Badge, Button, Tabs, Steps, Result, Spin, Tag, Row, Col, Statistic, Divider, Alert } from 'antd';
import {
    ArrowLeftOutlined,
    ReloadOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import ProcessingTaskLogs from '@/components/processing/ProcessingTaskLogs';

const { TabPane } = Tabs;
const { Step } = Steps;

// 模拟日志数据
const MOCK_LOGS = [
    { timestamp: '2024-01-15 10:05:01', level: 'INFO', message: '任务初始化完成，准备开始处理' },
    { timestamp: '2024-01-15 10:05:02', level: 'INFO', message: '正在加载数据集 DS-001 (500,000 条记录)' },
    { timestamp: '2024-01-15 10:05:05', level: 'INFO', message: '开始进行数据去重，使用算法: MinHashLSH' },
    { timestamp: '2024-01-15 10:08:12', level: 'INFO', message: '完成第一轮哈希计算，发现 25,000 条潜在重复' },
    { timestamp: '2024-01-15 10:12:30', level: 'WARN', message: '发现 12 条记录包含非法字符，已跳过' },
    { timestamp: '2024-01-15 10:15:00', level: 'INFO', message: '正在进行精确比对...' },
    { timestamp: '2024-01-15 10:20:45', level: 'INFO', message: '去重完成，共删除 23,450 条重复数据' },
    { timestamp: '2024-01-15 10:21:00', level: 'INFO', message: '开始异常值检测...' },
    { timestamp: '2024-01-15 10:25:30', level: 'INFO', message: '处理完成，正在保存结果' },
    { timestamp: '2024-01-15 10:25:35', level: 'INFO', message: '结果已保存至 output/clean_v1.csv' },
];

export default function ProcessingTaskDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(false);

    // 模拟任务详情数据
    const task = {
        id: id || 'T-UNKNOWN',
        name: '电商评论数据清洗_V1',
        type: 'cleaning',
        status: 'completed', // running, completed, failed
        dataset: '公开新闻语料库 (DS-001)',
        startTime: '2024-01-15 10:05:00',
        endTime: '2024-01-15 10:25:35',
        duration: '20m 35s',
        creator: 'Admin',
        config: {
            deduplication: true,
            dedupThreshold: 0.95,
            removeOutliers: 'mean',
            textCleaning: ['html', 'space']
        },
        output: {
            path: '/data/processed/clean_v1.jsonl',
            size: '2.1GB',
            count: 476538
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* 头部信息 */}
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} />
                        <div>
                            <h1 className="text-xl font-bold m-0 flex items-center">
                                {task.name}
                                <Tag className="ml-3" color="blue">数据清洗</Tag>
                            </h1>
                            <span className="text-gray-400 text-sm">任务ID: {task.id}</span>
                        </div>
                    </div>
                    <div className="space-x-2">
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>刷新</Button>
                        {task.status === 'completed' && (
                            <Button type="primary" icon={<DownloadOutlined />}>下载结果</Button>
                        )}
                    </div>
                </div>

                <Descriptions bordered size="small" column={3}>
                    <Descriptions.Item label="状态">
                        <Badge status="success" text="已完成" />
                    </Descriptions.Item>
                    <Descriptions.Item label="创建人">{task.creator}</Descriptions.Item>
                    <Descriptions.Item label="输入数据集">{task.dataset}</Descriptions.Item>
                    <Descriptions.Item label="开始时间">{task.startTime}</Descriptions.Item>
                    <Descriptions.Item label="结束时间">{task.endTime}</Descriptions.Item>
                    <Descriptions.Item label="运行时长">{task.duration}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* 进度与详情 */}
            <Row gutter={24}>
                <Col span={16}>
                    <Card title="任务详情" className="h-full">
                        <Tabs defaultActiveKey="logs">
                            <TabPane tab="执行日志" key="logs">
                                <ProcessingTaskLogs logs={MOCK_LOGS as any} height={500} />
                            </TabPane>
                            <TabPane tab="配置信息" key="config">
                                <pre className="bg-gray-50 p-4 rounded border text-sm">
                                    {JSON.stringify(task.config, null, 2)}
                                </pre>
                            </TabPane>
                            <TabPane tab="结果预览" key="preview">
                                <div className="space-y-4">
                                    <Alert message="以下展示前5条处理结果对比" type="info" showIcon />

                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="border p-4 rounded bg-gray-50">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Raw Input</div>
                                                    <div className="bg-white p-2 border border-red-100 rounded text-gray-400 line-through text-sm">
                                                        &lt;div&gt;这是一条包含HTML标签 的   测试评论!!!&lt;/div&gt;
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Clean Output</div>
                                                    <div className="bg-white p-2 border border-green-200 rounded text-green-700 text-sm">
                                                        这是一条包含HTML标签的测试评论!!!
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>

                <Col span={8}>
                    <div className="space-y-6">
                        <Card title="流程进度">
                            <Steps direction="vertical" current={3} size="small">
                                <Step title="任务提交" description={task.startTime} icon={<FileTextOutlined />} />
                                <Step title="数据加载" description="加载 500,000 条数据" />
                                <Step title="算子处理" description="去重中..." />
                                <Step title="结果保存" description="已保存至JSONL" icon={<CheckCircleOutlined />} />
                            </Steps>
                        </Card>

                        <Card title="处理统计">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic title="输入记录数" value={500000} groupSeparator="," />
                                </Col>
                                <Col span={12}>
                                    <Statistic title="输出记录数" value={476538} groupSeparator="," valueStyle={{ color: '#3f8600' }} />
                                </Col>
                                <Col span={12}>
                                    <Statistic title="过滤/清洗" value={23462} groupSeparator="," valueStyle={{ color: '#cf1322' }} />
                                </Col>
                                <Col span={12}>
                                    <Statistic title="处理速度" value={450} suffix="条/s" />
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
