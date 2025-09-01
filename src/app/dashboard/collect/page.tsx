'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, DownloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '用户行为数据采集',
    type: 'API',
    status: 'running',
    progress: 75,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    dataSize: '2.5GB',
    records: 150000,
  },
  {
    id: 2,
    name: '日志数据采集',
    type: 'File',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    dataSize: '1.8GB',
    records: 120000,
  },
  {
    id: 3,
    name: '传感器数据采集',
    type: 'Stream',
    status: 'failed',
    progress: 30,
    startTime: '2024-01-13 08:00:00',
    endTime: '2024-01-13 10:00:00',
    dataSize: '500MB',
    records: 50000,
  },
];

export default function CollectPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '采集类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'API' ? 'blue' : type === 'File' ? 'green' : 'orange'}>
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
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '数据大小',
      dataIndex: 'dataSize',
      key: 'dataSize',
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
          <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>
            下载
          </Button>
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

  const handleDownload = (record: any) => {
    message.success(`开始下载: ${record.name}`);
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
        title="数据采集管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建采集任务
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
        title="新建采集任务"
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
            label="采集类型"
            rules={[{ required: true, message: '请选择采集类型' }]}
          >
            <Select placeholder="请选择采集类型">
              <Option value="API">API接口</Option>
              <Option value="File">文件导入</Option>
              <Option value="Stream">流式数据</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="source"
            label="数据源"
            rules={[{ required: true, message: '请输入数据源' }]}
          >
            <Input placeholder="请输入数据源地址" />
          </Form.Item>
          <Form.Item
            name="schedule"
            label="调度时间"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
