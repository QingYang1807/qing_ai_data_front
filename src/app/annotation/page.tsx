'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '图像分类标注',
    type: '图像',
    status: 'running',
    progress: 75,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    totalImages: 10000,
    labeledImages: 7500,
    accuracy: 95.2,
  },
  {
    id: 2,
    name: '文本分类标注',
    type: '文本',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    totalImages: 5000,
    labeledImages: 5000,
    accuracy: 98.5,
  },
  {
    id: 3,
    name: '语音识别标注',
    type: '语音',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    totalImages: 3000,
    labeledImages: 0,
    accuracy: 0,
  },
];

export default function AnnotationPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '标注类型',
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
      title: '总数量',
      dataIndex: 'totalImages',
      key: 'totalImages',
      render: (total: number) => total.toLocaleString(),
    },
    {
      title: '已标注',
      dataIndex: 'labeledImages',
      key: 'labeledImages',
      render: (labeled: number) => labeled.toLocaleString(),
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => `${accuracy}%`,
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
          <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleReview(record)}>
            审核
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看标注任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑标注任务: ${record.name}`);
  };

  const handleReview = (record: any) => {
    message.info(`审核标注任务: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除标注任务 "${record.name}" 吗？`,
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
        title="数据标注管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建标注任务
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
        title="新建标注任务"
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
            label="标注类型"
            rules={[{ required: true, message: '请选择标注类型' }]}
          >
            <Select placeholder="请选择标注类型">
              <Option value="图像">图像标注</Option>
              <Option value="文本">文本标注</Option>
              <Option value="语音">语音标注</Option>
              <Option value="视频">视频标注</Option>
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
            name="labelSchema"
            label="标注方案"
            rules={[{ required: true, message: '请输入标注方案' }]}
          >
            <Input.TextArea placeholder="请输入标注方案描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
