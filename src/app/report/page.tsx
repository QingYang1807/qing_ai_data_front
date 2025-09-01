'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '数据质量月报',
    type: '质量报告',
    status: 'completed',
    createTime: '2024-01-15 10:30:00',
    completeTime: '2024-01-15 11:00:00',
    size: '2.5MB',
    format: 'PDF',
    creator: '张三',
  },
  {
    id: 2,
    name: '数据处理周报',
    type: '处理报告',
    status: 'running',
    createTime: '2024-01-14 14:20:00',
    completeTime: null,
    size: '0MB',
    format: 'Excel',
    creator: '李四',
  },
  {
    id: 3,
    name: '系统性能日报',
    type: '性能报告',
    status: 'failed',
    createTime: '2024-01-13 09:15:00',
    completeTime: null,
    size: '0MB',
    format: 'Word',
    creator: '王五',
  },
];

export default function ReportPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '报表名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '报表类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={
          type === '质量报告' ? 'blue' : 
          type === '处理报告' ? 'green' : 
          type === '性能报告' ? 'orange' : 'purple'
        }>
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
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '文件格式',
      dataIndex: 'format',
      key: 'format',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '完成时间',
      dataIndex: 'completeTime',
      key: 'completeTime',
      render: (time: string) => time || '-',
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
    message.info(`查看报表: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑报表: ${record.name}`);
  };

  const handleDownload = (record: any) => {
    message.success(`下载报表: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除报表 "${record.name}" 吗？`,
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
        title="报表导出管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建报表任务
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
        title="新建报表任务"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="报表名称"
            rules={[{ required: true, message: '请输入报表名称' }]}
          >
            <Input placeholder="请输入报表名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="报表类型"
            rules={[{ required: true, message: '请选择报表类型' }]}
          >
            <Select placeholder="请选择报表类型">
              <Option value="质量报告">数据质量报告</Option>
              <Option value="处理报告">数据处理报告</Option>
              <Option value="性能报告">系统性能报告</Option>
              <Option value="合规报告">合规性报告</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="format"
            label="导出格式"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Select placeholder="请选择导出格式">
              <Option value="PDF">PDF</Option>
              <Option value="Excel">Excel</Option>
              <Option value="Word">Word</Option>
              <Option value="CSV">CSV</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="数据时间范围"
            rules={[{ required: true, message: '请选择数据时间范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="报表描述"
          >
            <Input.TextArea placeholder="请输入报表描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
