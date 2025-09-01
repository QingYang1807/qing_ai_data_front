'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '用户行为数据回流',
    type: '实时回流',
    status: 'running',
    progress: 85,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    sourceSystem: '用户系统',
    targetSystem: '数据分析平台',
    dataVolume: '2.5GB',
  },
  {
    id: 2,
    name: '日志数据回流',
    type: '批量回流',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    sourceSystem: '日志系统',
    targetSystem: '数据仓库',
    dataVolume: '1.8GB',
  },
  {
    id: 3,
    name: '交易数据回流',
    type: '实时回流',
    status: 'failed',
    progress: 30,
    startTime: '2024-01-13 08:00:00',
    endTime: '2024-01-13 10:00:00',
    sourceSystem: '交易系统',
    targetSystem: '风控系统',
    dataVolume: '500MB',
  },
];

export default function ReflowPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '回流任务',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '回流类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '实时回流' ? 'blue' : 'green'}>
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
      title: '源系统',
      dataIndex: 'sourceSystem',
      key: 'sourceSystem',
    },
    {
      title: '目标系统',
      dataIndex: 'targetSystem',
      key: 'targetSystem',
    },
    {
      title: '数据量',
      dataIndex: 'dataVolume',
      key: 'dataVolume',
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
          <Button type="link" icon={<SyncOutlined />} onClick={() => handleSync(record)}>
            同步
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看回流任务: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑回流任务: ${record.name}`);
  };

  const handleSync = (record: any) => {
    message.success(`同步回流任务: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除回流任务 "${record.name}" 吗？`,
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
        title="数据回流管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建回流任务
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
        title="新建回流任务"
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
            label="回流类型"
            rules={[{ required: true, message: '请选择回流类型' }]}
          >
            <Select placeholder="请选择回流类型">
              <Option value="实时回流">实时回流</Option>
              <Option value="批量回流">批量回流</Option>
              <Option value="定时回流">定时回流</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="sourceSystem"
            label="源系统"
            rules={[{ required: true, message: '请输入源系统' }]}
          >
            <Input placeholder="请输入源系统" />
          </Form.Item>
          <Form.Item
            name="targetSystem"
            label="目标系统"
            rules={[{ required: true, message: '请输入目标系统' }]}
          >
            <Input placeholder="请输入目标系统" />
          </Form.Item>
          <Form.Item
            name="syncInterval"
            label="同步间隔"
          >
            <Input placeholder="请输入同步间隔（分钟）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
