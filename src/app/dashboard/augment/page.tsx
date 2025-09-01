'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '图像数据增强',
    type: '图像',
    status: 'running',
    progress: 60,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    originalCount: 1000,
    augmentedCount: 600,
    method: '旋转+翻转',
  },
  {
    id: 2,
    name: '文本数据增强',
    type: '文本',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    originalCount: 500,
    augmentedCount: 2000,
    method: '同义词替换',
  },
  {
    id: 3,
    name: '语音数据增强',
    type: '语音',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    originalCount: 300,
    augmentedCount: 0,
    method: '变速+变调',
  },
];

export default function AugmentPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '图像' ? 'blue' : type === '文本' ? 'green' : 'orange'}>
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
      title: '原始数量',
      dataIndex: 'originalCount',
      key: 'originalCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '增强数量',
      dataIndex: 'augmentedCount',
      key: 'augmentedCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '增强方法',
      dataIndex: 'method',
      key: 'method',
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
          <Button type="link" icon={<PlayCircleOutlined />} onClick={() => handleStart(record)}>
            启动
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看增强任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑增强任务: ${record.name}`);
  };

  const handleStart = (record: any) => {
    message.success(`启动增强任务: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除增强任务 "${record.name}" 吗？`,
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
        title="数据增强管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建增强任务
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
        title="新建增强任务"
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
            label="数据类型"
            rules={[{ required: true, message: '请选择数据类型' }]}
          >
            <Select placeholder="请选择数据类型">
              <Option value="图像">图像数据</Option>
              <Option value="文本">文本数据</Option>
              <Option value="语音">语音数据</Option>
              <Option value="视频">视频数据</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="method"
            label="增强方法"
            rules={[{ required: true, message: '请选择增强方法' }]}
          >
            <Select placeholder="请选择增强方法">
              <Option value="旋转+翻转">旋转+翻转</Option>
              <Option value="同义词替换">同义词替换</Option>
              <Option value="变速+变调">变速+变调</Option>
              <Option value="噪声添加">噪声添加</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dataSource"
            label="数据源"
            rules={[{ required: true, message: '请输入数据源' }]}
          >
            <Input placeholder="请输入数据源路径" />
          </Form.Item>
          <Form.Item
            name="multiplier"
            label="增强倍数"
            rules={[{ required: true, message: '请输入增强倍数' }]}
          >
            <Input type="number" placeholder="请输入增强倍数" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
