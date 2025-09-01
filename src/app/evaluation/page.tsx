'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '数据集质量评估',
    type: '质量评估',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    score: 85.5,
    metrics: '完整性、准确性、一致性',
  },
  {
    id: 2,
    name: '模型性能评估',
    type: '性能评估',
    status: 'running',
    progress: 75,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    score: 92.3,
    metrics: '准确率、召回率、F1分数',
  },
  {
    id: 3,
    name: '数据分布评估',
    type: '分布评估',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    score: 0,
    metrics: '偏度、峰度、分布均匀性',
  },
];

export default function EvaluationPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '评估任务',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '评估类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '质量评估' ? 'blue' : type === '性能评估' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap = {
          running: 'processing',
          completed: 'success',
          failed: 'error',
          pending: 'default',
        };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '评估分数',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => score > 0 ? `${score}分` : '-',
    },
    {
      title: '评估指标',
      dataIndex: 'metrics',
      key: 'metrics',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" icon={<BarChartOutlined />} onClick={() => handleReport(record)}>
            报告
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看评估任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑评估任务: ${record.name}`);
  };

  const handleReport = (record: any) => {
    message.info(`生成评估报告: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除评估任务 "${record.name}" 吗？`,
      onOk() {
        message.success('删除成功');
      },
    });
  };

  const handleCreate = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      message.success('创建成功');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card
        title="数据评估管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建评估任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={mockData}
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

      <Modal
        title="新建评估任务"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="评估类型"
            rules={[{ required: true, message: '请选择评估类型' }]}
          >
            <Select placeholder="请选择评估类型">
              <Option value="质量评估">数据质量评估</Option>
              <Option value="性能评估">模型性能评估</Option>
              <Option value="分布评估">数据分布评估</Option>
              <Option value="合规评估">合规性评估</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dataSource"
            label="评估对象"
            rules={[{ required: true, message: '请输入评估对象' }]}
          >
            <Input placeholder="请输入评估对象路径" />
          </Form.Item>
          <Form.Item
            name="metrics"
            label="评估指标"
            rules={[{ required: true, message: '请输入评估指标' }]}
          >
            <Input.TextArea placeholder="请输入评估指标" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
