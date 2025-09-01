'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟数据
const mockData = [
  {
    id: 1,
    operation: '数据访问',
    user: '张三',
    target: '用户数据集',
    ip: '192.168.1.100',
    status: 'success',
    timestamp: '2024-01-15 10:30:00',
    details: '访问用户行为数据集',
  },
  {
    id: 2,
    operation: '数据修改',
    user: '李四',
    target: '数据集配置',
    ip: '192.168.1.101',
    status: 'success',
    timestamp: '2024-01-14 14:20:00',
    details: '修改数据集标签配置',
  },
  {
    id: 3,
    operation: '数据删除',
    user: '王五',
    target: '临时数据集',
    ip: '192.168.1.102',
    status: 'failed',
    timestamp: '2024-01-13 09:15:00',
    details: '删除临时数据集失败',
  },
];

export default function AuditPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '操作类型',
      dataIndex: 'operation',
      key: 'operation',
      render: (operation: string) => (
        <Tag color={operation === '数据访问' ? 'blue' : operation === '数据修改' ? 'orange' : 'red'}>
          {operation}
        </Tag>
      ),
    },
    {
      title: '操作用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '操作对象',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: '操作详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<FileTextOutlined />} onClick={() => handleExport(record)}>
            导出
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看审计日志: ${record.operation}`);
  };

  const handleExport = (record: any) => {
    message.success(`导出审计日志: ${record.operation}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除审计日志 "${record.operation}" 吗？`,
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
        title="审计日志管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建审计规则
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
        title="新建审计规则"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="operation"
            label="操作类型"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Select placeholder="请选择操作类型">
              <Option value="数据访问">数据访问</Option>
              <Option value="数据修改">数据修改</Option>
              <Option value="数据删除">数据删除</Option>
              <Option value="权限变更">权限变更</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="target"
            label="监控对象"
            rules={[{ required: true, message: '请输入监控对象' }]}
          >
            <Input placeholder="请输入监控对象" />
          </Form.Item>
          <Form.Item
            name="level"
            label="日志级别"
            rules={[{ required: true, message: '请选择日志级别' }]}
          >
            <Select placeholder="请选择日志级别">
              <Option value="info">信息</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
              <Option value="critical">严重</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="规则描述"
          >
            <Input.TextArea placeholder="请输入规则描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
