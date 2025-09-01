'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '数据清洗任务',
    type: '清洗',
    status: 'running',
    progress: 65,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    inputSize: '2.5GB',
    outputSize: '2.1GB',
    records: 150000,
  },
  {
    id: 2,
    name: '数据转换任务',
    type: '转换',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    inputSize: '1.8GB',
    outputSize: '1.5GB',
    records: 120000,
  },
  {
    id: 3,
    name: '数据聚合任务',
    type: '聚合',
    status: 'failed',
    progress: 30,
    startTime: '2024-01-13 08:00:00',
    endTime: '2024-01-13 10:00:00',
    inputSize: '500MB',
    outputSize: '0MB',
    records: 50000,
  },
];

export default function ProcessingPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '处理类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '清洗' ? 'blue' : type === '转换' ? 'green' : 'orange'}>
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
      title: '输入大小',
      dataIndex: 'inputSize',
      key: 'inputSize',
    },
    {
      title: '输出大小',
      dataIndex: 'outputSize',
      key: 'outputSize',
    },
    {
      title: '记录数',
      dataIndex: 'records',
      key: 'records',
      render: (records: number) => records.toLocaleString(),
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
          {record.status === 'running' ? (
            <Button type="link" icon={<PauseCircleOutlined />} onClick={() => handlePause(record)}>
              暂停
            </Button>
          ) : (
            <Button type="link" icon={<PlayCircleOutlined />} onClick={() => handleStart(record)}>
              启动
            </Button>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑任务: ${record.name}`);
  };

  const handleStart = (record: any) => {
    message.success(`启动任务: ${record.name}`);
  };

  const handlePause = (record: any) => {
    message.warning(`暂停任务: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务 "${record.name}" 吗？`,
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
        title="数据处理管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建处理任务
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
        title="新建处理任务"
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
            label="处理类型"
            rules={[{ required: true, message: '请选择处理类型' }]}
          >
            <Select placeholder="请选择处理类型">
              <Option value="清洗">数据清洗</Option>
              <Option value="转换">数据转换</Option>
              <Option value="聚合">数据聚合</Option>
              <Option value="过滤">数据过滤</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="inputSource"
            label="输入数据源"
            rules={[{ required: true, message: '请输入输入数据源' }]}
          >
            <Input placeholder="请输入输入数据源" />
          </Form.Item>
          <Form.Item
            name="outputTarget"
            label="输出目标"
            rules={[{ required: true, message: '请输入输出目标' }]}
          >
            <Input placeholder="请输入输出目标" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
