'use client';

import React from 'react';
import { Card, Statistic, Row, Col, Progress, Switch, List, Tag } from 'antd';
import {
    ThunderboltOutlined,
    CloudServerOutlined,
    DashboardOutlined,
    WifiOutlined
} from '@ant-design/icons';
import { Server, Database, Activity } from 'lucide-react';

export default function FeedingPage() {
    const strategies = [
        { title: '智能预取 (Smart Prefetching)', description: '根据训练速度动态调整并预加载数据', active: true },
        { title: '分布式缓存 (Distributed Cache)', description: '在计算节点间共享热点数据', active: true },
        { title: 'RDMA 加速', description: '启用 RDMA 直接内存访问以减少 CPU 开销', active: false },
        { title: '数据本地化 (Data Locality)', description: '调度任务到数据所在的节点', active: true },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">数据投喂监控</h1>
                <p className="text-gray-600">监控训练集群的数据IO吞吐与缓存命中率，优化 GPU 等待时间</p>
            </div>

            {/* Real-time Stats */}
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="当前吞吐量 (Throughput)"
                            value={4.2}
                            precision={1}
                            suffix="GB/s"
                            prefix={<ThunderboltOutlined className="text-yellow-500" />}
                        />
                        <Progress percent={85} strokeColor="#faad14" showInfo={false} size="small" className="mt-2" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="缓存命中率 (Cache Hit Rate)"
                            value={92.5}
                            precision={1}
                            suffix="%"
                            prefix={<Database className="text-blue-500 w-5 h-5 inline mr-1" />}
                        />
                        <Progress percent={92.5} strokeColor="#1890ff" showInfo={false} size="small" className="mt-2" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="GPU IO等待时间"
                            value={15}
                            suffix="ms"
                            prefix={<Activity className="text-green-500 w-5 h-5 inline mr-1" />}
                        />
                        <Progress percent={12} strokeColor="#52c41a" showInfo={false} size="small" className="mt-2" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="活跃节点数"
                            value={128}
                            suffix="/ 128"
                            prefix={<Server className="text-purple-500 w-5 h-5 inline mr-1" />}
                        />
                        <Progress percent={100} strokeColor="#722ed1" showInfo={false} size="small" className="mt-2" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={16}>
                    <Card title="IO 性能监控" className="h-full">
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded text-gray-400">
                            <DashboardOutlined className="text-4xl mr-2" />
                            <span>实时 IOPS / Bandwidth 曲线图 (Placeholder)</span>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="投喂策略配置" className="h-full">
                        <List
                            itemLayout="horizontal"
                            dataSource={strategies}
                            renderItem={item => (
                                <List.Item actions={[<Switch checked={item.active} key="switch" />]}>
                                    <List.Item.Meta
                                        title={item.title}
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="活跃投喂管道 (Active Pipelines)">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center">
                            <Tag color="blue" className="mr-3">LLM-Pretrain-V3</Tag>
                            <div>
                                <div className="font-medium">Cluster-A (64 GPUs)</div>
                                <div className="text-xs text-gray-500">Source: S3/tfrecords/v3 • Strategy: Sequential</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">3.8 GB/s</div>
                            <div className="text-xs text-green-500">Available</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center">
                            <Tag color="cyan" className="mr-3">CV-ResNet-FineTune</Tag>
                            <div>
                                <div className="font-medium">Cluster-B (8 GPUs)</div>
                                <div className="text-xs text-gray-500">Source: AliOSS/imagenet • Strategy: RandomShuffle</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-cyan-600">450 MB/s</div>
                            <div className="text-xs text-green-500">Available</div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
