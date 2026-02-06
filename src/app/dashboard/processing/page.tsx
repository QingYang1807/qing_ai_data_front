'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message, Row, Col, Statistic, DatePicker, Badge, Tooltip } from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  AreaChartOutlined,
  FileSyncOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 数据类型配置
const DATA_TYPES = {
  text: { label: '纯文本', color: 'blue' },
  image: { label: '图像', color: 'green' },
  audio: { label: '语音', color: 'orange' },
  video: { label: '视频', color: 'purple' },
  code: { label: '代码', color: 'geekblue' },
  sensor: { label: '端侧/传感器', color: 'cyan' },
  multimodal: { label: '多模态', color: 'magenta' },
};

// 模拟数据
const mockData = [
  {
    id: 'T-20240115-001',
    name: '电商评论数据清洗_V1',
    type: 'cleaning',
    dataType: 'text',
    status: 'running',
    progress: 65,
    creator: 'Admin',
    createTime: '2024-01-15 10:00:00',
    startTime: '2024-01-15 10:05:00',
    description: '去除重复评论，过滤短文本',
    stats: { total: 150000, processed: 97500 }
  },
  {
    id: 'T-20240114-003',
    name: '医疗问答数据增强',
    type: 'augmentation',
    dataType: 'text',
    status: 'completed',
    progress: 100,
    creator: 'Dr. Li',
    createTime: '2024-01-14 09:00:00',
    startTime: '2024-01-14 09:10:00',
    endTime: '2024-01-14 11:30:00',
    description: '通过回译增强数据多样性',
    stats: { total: 5000, generated: 15000 }
  },
  {
    id: 'T-20240113-005',
    name: '用户信息脱敏',
    type: 'desensitization',
    dataType: 'text',
    status: 'failed',
    progress: 30,
    creator: 'SecurityTeam',
    createTime: '2024-01-13 08:00:00',
    startTime: '2024-01-13 08:05:00',
    endTime: '2024-01-13 08:35:00',
    description: '手机号、身份证打码',
    errorMessage: 'Unexpected EOF in source file part-003.csv',
    stats: { total: 50000, processed: 15000 }
  },
  {
    id: 'T-20240112-002',
    name: '金融对话合成',
    type: 'synthesis',
    dataType: 'text',
    status: 'completed',
    progress: 100,
    creator: 'Admin',
    createTime: '2024-01-12 14:00:00',
    startTime: '2024-01-12 14:10:00',
    endTime: '2024-01-12 18:00:00',
    description: '基于大模型合成理财咨询对话',
    stats: { promptCount: 1000, outputCount: 1000 }
  },
  {
    id: 'T-20240116-001',
    name: '法律文书格式化',
    type: 'cleaning',
    dataType: 'text',
    status: 'pending',
    progress: 0,
    creator: 'LawUser',
    createTime: '2024-01-16 09:00:00',
    description: '统一段落格式，去除乱码',
    stats: { total: 2000, processed: 0 }
  },
  {
    id: 'T-20240117-001',
    name: '自动驾驶视频抽帧',
    type: 'cleaning',
    dataType: 'video',
    status: 'running',
    progress: 45,
    creator: 'AutoTeam',
    createTime: '2024-01-17 11:00:00',
    description: '提取关键帧，去除模糊帧',
    stats: { total: 500, processed: 225 }
  },
  {
    id: 'T-20240117-002',
    name: 'GitHub Python代码清洗',
    type: 'cleaning',
    dataType: 'code',
    status: 'completed',
    progress: 100,
    creator: 'CodeMaster',
    createTime: '2024-01-15 14:30:00',
    description: '去除注释，格式化代码风格',
    stats: { total: 50000, processed: 49500 }
  }
];

// 任务类型配置
const TASK_TYPES = {
  cleaning: { label: '数据清洗', color: 'blue', icon: <FileSyncOutlined /> },
  augmentation: { label: '数据增强', color: 'cyan', icon: <AreaChartOutlined /> },
  desensitization: { label: '隐私脱敏', color: 'purple', icon: <SafetyCertificateOutlined /> },
  synthesis: { label: '数据合成', color: 'magenta', icon: <ExperimentOutlined /> },
};

// 状态映射
const STATUS_MAP = {
  running: { text: '进行中', status: 'processing', color: 'blue' },
  completed: { text: '已完成', status: 'success', color: 'green' },
  failed: { text: '失败', status: 'error', color: 'red' },
  pending: { text: '等待中', status: 'default', color: 'default' },
};

interface ProcessingPageProps {
  defaultType?: string;
}

export default function ProcessingPage({ defaultType }: ProcessingPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(defaultType);
  const [dataTypeFilter, setDataTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // 统计数据
  const stats = {
    total: mockData.length,
    running: mockData.filter(d => d.status === 'running').length,
    completed: mockData.filter(d => d.status === 'completed').length,
    failed: mockData.filter(d => d.status === 'failed').length,
  };

  const columns = [
    {
      title: '任务名称 / ID',
      key: 'name',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium text-base">{record.name}</span>
          <span className="text-gray-400 text-xs">{record.id}</span>
        </Space>
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (dataType: string) => {
        const config = DATA_TYPES[dataType as keyof typeof DATA_TYPES] || { label: dataType, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config = TASK_TYPES[type as keyof typeof TASK_TYPES] || { label: type, color: 'default' };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = STATUS_MAP[status as keyof typeof STATUS_MAP];
        return <Badge status={config.status as any} text={config.text} />;
      },
    },
    {
      title: '进度',
      key: 'progress',
      width: 200,
      render: (_: any, record: any) => (
        <Tooltip title={`${record.stats.processed || 0} / ${record.stats.total || 0}`}>
          <Progress
            percent={record.progress}
            size="small"
            status={record.status === 'failed' ? 'exception' : record.status === 'completed' ? 'success' : 'active'}
          />
        </Tooltip>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a: any, b: any) => dayjs(a.createTime).valueOf() - dayjs(b.createTime).valueOf(),
      render: (text: string) => <span className="text-gray-500">{text}</span>
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => router.push(`/dashboard/processing/${record.id}`)}>
            详情
          </Button>
          {record.status === 'failed' && (
            <Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => handleRetry(record)}>
              重试
            </Button>
          )}
          {['pending', 'running'].includes(record.status) && (
            <Button type="text" size="small" danger icon={<PauseCircleOutlined />} onClick={() => handleStop(record)}>
              停止
            </Button>
          )}
          {!['pending', 'running'].includes(record.status) && (
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleRetry = (record: any) => {
    message.loading(`正在重试任务 ${record.name}...`);
    setTimeout(() => message.success('重试指令已发送'), 1000);
  };

  const handleStop = (record: any) => {
    Modal.confirm({
      title: '确认停止任务?',
      content: `确定要停止正在运行的任务 "${record.name}" 吗？`,
      okType: 'danger',
      onOk() {
        message.success('任务已停止');
      },
    });
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      okType: 'danger',
      onOk() {
        message.success('删除成功');
      },
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic title="总任务数" value={stats.total} prefix={<FileSyncOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic title="进行中" value={stats.running} valueStyle={{ color: '#1890ff' }} prefix={<PlayCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#3f8600' }} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} hoverable>
            <Statistic title="失败/异常" value={stats.failed} valueStyle={{ color: '#cf1322' }} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* 筛选与操作栏 */}
      <Card bordered={false}>
        <div className="flex justify-between mb-4">
          <Space size="middle" wrap>
            <Input
              placeholder="搜索任务名称/ID"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              placeholder="数据类型"
              style={{ width: 140 }}
              allowClear
              value={dataTypeFilter}
              onChange={setDataTypeFilter}
            >
              {Object.entries(DATA_TYPES).map(([key, config]) => (
                <Option key={key} value={key}>{config.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="任务类型"
              style={{ width: 150 }}
              allowClear
              value={typeFilter}
              onChange={setTypeFilter}
            >
              {Object.entries(TASK_TYPES).map(([key, config]) => (
                <Option key={key} value={key}>{config.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="任务状态"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {Object.entries(STATUS_MAP).map(([key, config]) => (
                <Option key={key} value={key}>{config.text}</Option>
              ))}
            </Select>
            <RangePicker style={{ width: 250 }} />
          </Space>

          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/dashboard/processing/create')}>
              新建处理任务
            </Button>
          </Space>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={mockData.filter(item => {
            let pass = true;
            if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase()) && !item.id.includes(searchText)) pass = false;
            if (typeFilter && item.type !== typeFilter) pass = false;
            if (dataTypeFilter && item.dataType !== dataTypeFilter) pass = false;
            if (statusFilter && item.status !== statusFilter) pass = false;
            return pass;
          })}
          rowKey="id"
          pagination={{
            total: mockData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
}
