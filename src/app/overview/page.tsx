'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space } from 'antd';
import { 
  DatabaseOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

// 模拟统计数据
const statistics = {
  totalDatasets: 1250,
  totalUsers: 89,
  totalStorage: 2.5, // TB
  activeProcesses: 12,
  datasetsGrowth: 15.2,
  usersGrowth: 8.5,
  storageGrowth: 22.1,
  processGrowth: -5.3,
};

// 模拟最近活动数据
const recentActivities = [
  {
    id: 1,
    type: '数据集创建',
    user: '张三',
    target: '用户行为数据集',
    timestamp: '2024-01-15 10:30:00',
    status: 'completed',
  },
  {
    id: 2,
    type: '数据处理',
    user: '李四',
    target: '图像分类数据集',
    timestamp: '2024-01-15 09:15:00',
    status: 'running',
  },
  {
    id: 3,
    type: '数据标注',
    user: '王五',
    target: '文本情感分析数据集',
    timestamp: '2024-01-15 08:45:00',
    status: 'completed',
  },
  {
    id: 4,
    type: '数据导出',
    user: '赵六',
    target: '语音识别数据集',
    timestamp: '2024-01-15 08:20:00',
    status: 'failed',
  },
];

export default function OverviewPage() {
  const columns = [
    {
      title: '活动类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === '数据集创建' ? 'blue' : 
          type === '数据处理' ? 'green' : 
          type === '数据标注' ? 'orange' : 'purple'
        }>
          {type}
        </Tag>
      ),
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '操作对象',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'success' : 
          status === 'running' ? 'processing' : 'error'
        }>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总数据集"
              value={statistics.totalDatasets}
              prefix={<DatabaseOutlined />}
              suffix={
                <span className="text-green-500 text-sm">
                  <ArrowUpOutlined /> {statistics.datasetsGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              suffix={
                <span className="text-green-500 text-sm">
                  <ArrowUpOutlined /> {statistics.usersGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="存储空间"
              value={statistics.totalStorage}
              prefix={<FileTextOutlined />}
              suffix={
                <span>
                  TB
                  <span className="text-green-500 text-sm ml-2">
                    <ArrowUpOutlined /> {statistics.storageGrowth}%
                  </span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="运行进程"
              value={statistics.activeProcesses}
              prefix={<ClockCircleOutlined />}
              suffix={
                <span className={statistics.processGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {statistics.processGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                  {Math.abs(statistics.processGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 进度概览 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="系统性能">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>CPU使用率</span>
                  <span>65%</span>
                </div>
                <Progress percent={65} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>内存使用率</span>
                  <span>78%</span>
                </div>
                <Progress percent={78} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>存储使用率</span>
                  <span>45%</span>
                </div>
                <Progress percent={45} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>网络带宽</span>
                  <span>32%</span>
                </div>
                <Progress percent={32} status="active" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="数据处理状态">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>数据采集</span>
                  <span>85%</span>
                </div>
                <Progress percent={85} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>数据清洗</span>
                  <span>72%</span>
                </div>
                <Progress percent={72} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>数据标注</span>
                  <span>58%</span>
                </div>
                <Progress percent={58} status="active" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>数据验证</span>
                  <span>91%</span>
                </div>
                <Progress percent={91} status="active" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Card title="最近活动" className="mb-6">
        <Table
          columns={columns}
          dataSource={recentActivities}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 快速操作 */}
      <Card title="快速操作">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              size="small" 
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => console.log('创建数据集')}
            >
              <DatabaseOutlined className="text-2xl text-blue-500 mb-2" />
              <div>创建数据集</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              size="small" 
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => console.log('数据采集')}
            >
              <FileTextOutlined className="text-2xl text-green-500 mb-2" />
              <div>数据采集</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              size="small" 
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => console.log('数据处理')}
            >
              <ClockCircleOutlined className="text-2xl text-orange-500 mb-2" />
              <div>数据处理</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              size="small" 
              className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => console.log('系统设置')}
            >
              <UserOutlined className="text-2xl text-purple-500 mb-2" />
              <div>系统设置</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
