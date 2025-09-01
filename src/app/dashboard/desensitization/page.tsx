'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '用户信息脱敏',
    type: '个人信息',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    originalCount: 10000,
    processedCount: 10000,
    method: '掩码脱敏',
  },
  {
    id: 2,
    name: '银行卡号脱敏',
    type: '金融信息',
    status: 'running',
    progress: 75,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    originalCount: 5000,
    processedCount: 3750,
    method: '部分隐藏',
  },
  {
    id: 3,
    name: '身份证号脱敏',
    type: '证件信息',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    originalCount: 3000,
    processedCount: 0,
    method: '哈希脱敏',
  },
];

export default function DesensitizationPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '脱敏任务',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '个人信息' ? 'blue' : type === '金融信息' ? 'red' : 'orange'}>
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
      title: '已处理',
      dataIndex: 'processedCount',
      key: 'processedCount',
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '脱敏方法',
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
          <Button type="link" icon={<LockOutlined />} onClick={() => handleProcess(record)}>
            处理
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看脱敏任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑脱敏任务: ${record.name}`);
  };

  const handleProcess = (record: any) => {
    message.success(`开始处理脱敏任务: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除脱敏任务 "${record.name}" 吗？`,
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
        title="数据脱敏工具"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建脱敏任务
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
        title="新建脱敏任务"
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
              <Option value="个人信息">个人信息</Option>
              <Option value="金融信息">金融信息</Option>
              <Option value="证件信息">证件信息</Option>
              <Option value="联系方式">联系方式</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="method"
            label="脱敏方法"
            rules={[{ required: true, message: '请选择脱敏方法' }]}
          >
            <Select placeholder="请选择脱敏方法">
              <Option value="掩码脱敏">掩码脱敏</Option>
              <Option value="部分隐藏">部分隐藏</Option>
              <Option value="哈希脱敏">哈希脱敏</Option>
              <Option value="替换脱敏">替换脱敏</Option>
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
            name="targetPath"
            label="输出路径"
            rules={[{ required: true, message: '请输入输出路径' }]}
          >
            <Input placeholder="请输入输出路径" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
