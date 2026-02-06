'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Badge, Tabs, List } from 'antd';
import {
    Server,
    Activity,
    Cpu,
    Database,
    HardDrive,
    Zap,
    Box,
    Layers,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';

const { TabPane } = Tabs;

export default function InfrastructurePage() {
    // Mock Data for Ray Cluster
    const rayCluster = {
        status: 'active',
        headNode: { status: 'online', cpu: 45, memory: 60, ip: '10.0.0.1' },
        workers: [
            { id: 'w-1', status: 'online', cpu: 78, memory: 82, gpu: 95, ip: '10.0.0.2' },
            { id: 'w-2', status: 'online', cpu: 65, memory: 70, gpu: 88, ip: '10.0.0.3' },
            { id: 'w-3', status: 'online', cpu: 12, memory: 25, gpu: 0, ip: '10.0.0.4' },
            { id: 'w-4', status: 'offline', cpu: 0, memory: 0, gpu: 0, ip: '10.0.0.5' },
        ],
        tasks: { running: 124, pending: 45, failed: 2 }
    };

    // Mock Data for Spark Cluster
    const sparkCluster = {
        status: 'active',
        driver: { status: 'active', cpu: 30, memory: 40 },
        executors: { total: 32, active: 30, dead: 2 },
        jobs: { active: 5, completed: 1250, failed: 12 }
    };

    // Mock Data for Flink Cluster
    const flinkCluster = {
        status: 'active',
        jobManager: { status: 'active', cpu: 25, memory: 35 },
        taskManagers: { total: 10, active: 10 },
        slots: { total: 40, available: 15 },
        jobs: { running: 3, cancelling: 0, failed: 1 }
    };

    // Mock Data for Kafka
    const kafkaCluster = {
        status: 'warning',
        brokers: [
            { id: 1, status: 'online', lag: 12 },
            { id: 2, status: 'online', lag: 15 },
            { id: 3, status: 'warning', lag: 1500 },
        ],
        topics: { total: 24, partitions: 128 },
        throughput: { in: '250 MB/s', out: '480 MB/s' }
    };

    const renderStatus = (status: string) => {
        const color = status === 'active' || status === 'online' ? 'green' : status === 'warning' ? 'orange' : 'red';
        const Icon = status === 'active' || status === 'online' ? CheckCircle : status === 'warning' ? AlertTriangle : XCircle;
        return <Tag icon={<Icon size={12} />} color={color}>{status.toUpperCase()}</Tag>;
    };

    const RayView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <Statistic title="Active Workers" value={rayCluster.workers.filter(w => w.status === 'online').length} suffix={`/ ${rayCluster.workers.length}`} prefix={<Server className="text-blue-500" />} />
                </Card>
                <Card>
                    <Statistic title="Running Tasks" value={rayCluster.tasks.running} prefix={<Zap className="text-yellow-500" />} />
                </Card>
                <Card>
                    <Statistic title="Total GPU Usage" value={61} suffix="%" prefix={<Activity className="text-purple-500" />} />
                    <Progress percent={61} strokeColor="purple" showInfo={false} size="small" />
                </Card>
                <Card>
                    <Statistic title="Cluster Status" value={rayCluster.status} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircle />} />
                </Card>
            </div>

            <Card title="Worker Nodes" className="shadow-sm">
                <Table
                    dataSource={rayCluster.workers}
                    rowKey="id"
                    columns={[
                        { title: 'Node ID', dataIndex: 'id' },
                        { title: 'IP Address', dataIndex: 'ip' },
                        { title: 'Status', dataIndex: 'status', render: (text) => renderStatus(text) },
                        { title: 'CPU', dataIndex: 'cpu', render: (val) => <Progress percent={val} size="small" status={val > 80 ? 'exception' : 'active'} /> },
                        { title: 'Memory', dataIndex: 'memory', render: (val) => <Progress percent={val} size="small" strokeColor="orange" /> },
                        { title: 'GPU', dataIndex: 'gpu', render: (val) => <Progress percent={val} size="small" strokeColor="purple" /> },
                    ]}
                />
            </Card>
        </div>
    );

    const SparkView = () => (
        <div className="space-y-6">
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Cluster Overview" extra={renderStatus(sparkCluster.status)}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Driver Status</span>
                                <Badge status="processing" text="Active" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Active Executors</span>
                                <span className="font-bold text-lg">{sparkCluster.executors.active} / {sparkCluster.executors.total}</span>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={16}>
                    <Card title="Job Statistics">
                        <Row gutter={16}>
                            <Col span={8}><Statistic title="Active Jobs" value={sparkCluster.jobs.active} valueStyle={{ color: '#1890ff' }} /></Col>
                            <Col span={8}><Statistic title="Completed" value={sparkCluster.jobs.completed} valueStyle={{ color: '#3f8600' }} /></Col>
                            <Col span={8}><Statistic title="Failed" value={sparkCluster.jobs.failed} valueStyle={{ color: '#cf1322' }} /></Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );

    const FlinkView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <Statistic title="Task Slots" value={flinkCluster.slots.available} suffix={`/ ${flinkCluster.slots.total}`} />
                    <Progress percent={(flinkCluster.slots.available / flinkCluster.slots.total) * 100} showInfo={false} />
                </Card>
                <Card>
                    <Statistic title="Running Jobs" value={flinkCluster.jobs.running} prefix={<Box className="text-blue-500" />} />
                </Card>
                <Card>
                    <Statistic title="JobManager CPU" value={flinkCluster.jobManager.cpu} suffix="%" prefix={<Cpu />} />
                </Card>
            </div>
        </div>
    );

    const KafkaView = () => (
        <div className="space-y-6">
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Throughput In" value={kafkaCluster.throughput.in} prefix={<Activity />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Throughput Out" value={kafkaCluster.throughput.out} prefix={<Activity />} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Brokers Status" extra={renderStatus(kafkaCluster.status)}>
                        <List
                            dataSource={kafkaCluster.brokers}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={item.status === 'warning' ? <AlertTriangle color="orange" /> : <CheckCircle color="green" />}
                                        title={`Broker ${item.id}`}
                                        description={`Lag: ${item.lag} ms`}
                                    />
                                    {item.status === 'warning' && <Tag color="orange">High Lag</Tag>}
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Server className="w-8 h-8 text-blue-600" />
                        基础设施监控
                    </h1>
                    <p className="text-gray-500 mt-1">
                        实时监控 Ray, Spark, Flink 及 Kafka 集群运行状态
                    </p>
                </div>
                <div className="flex gap-2">
                    <Tag color="blue">K8s: v1.28.2</Tag>
                    <Tag color="cyan">Region: cn-north-1</Tag>
                </div>
            </div>

            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab={<span className="flex items-center gap-2"><Zap size={16} />Ray Cluster</span>} key="1">
                    <RayView />
                </TabPane>
                <TabPane tab={<span className="flex items-center gap-2"><Layers size={16} />Spark Cluster</span>} key="2">
                    <SparkView />
                </TabPane>
                <TabPane tab={<span className="flex items-center gap-2"><Box size={16} />Flink Cluster</span>} key="3">
                    <FlinkView />
                </TabPane>
                <TabPane tab={<span className="flex items-center gap-2"><HardDrive size={16} />Kafka Cluster</span>} key="4">
                    <KafkaView />
                </TabPane>
            </Tabs>
        </div>
    );
}
