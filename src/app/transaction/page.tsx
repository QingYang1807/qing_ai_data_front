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
    orderNo: 'TX202401150001',
    type: '数据购买',
    status: 'completed',
    amount: 1500.00,
    currency: 'CNY',
    buyer: '张三',
    seller: '数据供应商A',
    createTime: '2024-01-15 10:30:00',
    completeTime: '2024-01-15 11:00:00',
  },
  {
    id: 2,
    orderNo: 'TX202401140002',
    type: '数据销售',
    status: 'pending',
    amount: 800.00,
    currency: 'CNY',
    buyer: '李四',
    seller: '数据供应商B',
    createTime: '2024-01-14 14:20:00',
    completeTime: null,
  },
  {
    id: 3,
    orderNo: 'TX202401130003',
    type: '数据租赁',
    status: 'failed',
    amount: 2000.00,
    currency: 'CNY',
    buyer: '王五',
    seller: '数据供应商C',
    createTime: '2024-01-13 09:15:00',
    completeTime: null,
  },
];

export default function TransactionPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '交易单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '数据购买' ? 'blue' : type === '数据销售' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap = {
          completed: 'success',
          pending: 'processing',
          failed: 'error',
          cancelled: 'default',
        };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status}</Tag>;
      },
    },
    {
      title: '交易金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => `${record.currency} ${amount.toFixed(2)}`,
    },
    {
      title: '买家',
      dataIndex: 'buyer',
      key: 'buyer',
    },
    {
      title: '卖家',
      dataIndex: 'seller',
      key: 'seller',
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
    message.info(`查看交易记录: ${record.orderNo}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑交易记录: ${record.orderNo}`);
  };

  const handleDownload = (record: any) => {
    message.success(`下载交易记录: ${record.orderNo}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除交易记录 "${record.orderNo}" 吗？`,
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
        title="交易记录管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建交易记录
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
        title="新建交易记录"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="交易类型"
            rules={[{ required: true, message: '请选择交易类型' }]}
          >
            <Select placeholder="请选择交易类型">
              <Option value="数据购买">数据购买</Option>
              <Option value="数据销售">数据销售</Option>
              <Option value="数据租赁">数据租赁</Option>
              <Option value="数据交换">数据交换</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="交易金额"
            rules={[{ required: true, message: '请输入交易金额' }]}
          >
            <Input type="number" placeholder="请输入交易金额" />
          </Form.Item>
          <Form.Item
            name="currency"
            label="货币类型"
            rules={[{ required: true, message: '请选择货币类型' }]}
          >
            <Select placeholder="请选择货币类型">
              <Option value="CNY">人民币 (CNY)</Option>
              <Option value="USD">美元 (USD)</Option>
              <Option value="EUR">欧元 (EUR)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="buyer"
            label="买家"
            rules={[{ required: true, message: '请输入买家' }]}
          >
            <Input placeholder="请输入买家" />
          </Form.Item>
          <Form.Item
            name="seller"
            label="卖家"
            rules={[{ required: true, message: '请输入卖家' }]}
          >
            <Input placeholder="请输入卖家" />
          </Form.Item>
          <Form.Item
            name="description"
            label="交易描述"
          >
            <Input.TextArea placeholder="请输入交易描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
