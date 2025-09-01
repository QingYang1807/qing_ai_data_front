'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '图像合成任务',
    type: '图像',
    status: 'running',
    progress: 45,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    sourceCount: 500,
    synthesizedCount: 225,
    method: 'GAN合成',
  },
  {
    id: 2,
    name: '文本合成任务',
    type: '文本',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    sourceCount: 200,
    synthesizedCount: 1000,
    method: '模板生成',
  },
  {
    id: 3,
    name: '语音合成任务',
    type: '语音',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    sourceCount: 100,
    synthesizedCount: 0,
    method: 'TTS合成',
  },
];

export default function SynthesisPage() {
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
      title: '源数据量',
      dataIndex: 'sourceCount',
      key: 'sourceCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '合成数量',
      dataIndex: 'synthesizedCount',
      key: 'synthesizedCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '合成方法',
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
    message.info(`查看合成任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑合成任务: ${record.name}`);
  };

  const handleStart = (record: any) => {
    message.success(`启动合成任务: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除合成任务 "${record.name}" 吗？`,
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
        title="数据合成管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建合成任务
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
        title="新建合成任务"
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
            label="合成方法"
            rules={[{ required: true, message: '请选择合成方法' }]}
          >
            <Select placeholder="请选择合成方法">
              <Option value="GAN合成">GAN合成</Option>
              <Option value="模板生成">模板生成</Option>
              <Option value="TTS合成">TTS合成</Option>
              <Option value="规则合成">规则合成</Option>
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
            name="targetCount"
            label="目标数量"
            rules={[{ required: true, message: '请输入目标数量' }]}
          >
            <Input type="number" placeholder="请输入目标数量" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
