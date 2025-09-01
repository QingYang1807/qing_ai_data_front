'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Rate, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

// 模拟数据
const mockData = [
  {
    id: 1,
    datasetName: '用户行为数据集',
    user: '张三',
    type: '评分',
    rating: 4.5,
    comment: '数据质量很好，标注准确度高，推荐使用',
    status: 'approved',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 11:00:00',
  },
  {
    id: 2,
    datasetName: '图像分类数据集',
    user: '李四',
    type: '举报',
    rating: 2.0,
    comment: '数据中存在大量错误标注，质量较差',
    status: 'pending',
    createTime: '2024-01-14 14:20:00',
    updateTime: '2024-01-14 15:00:00',
  },
  {
    id: 3,
    datasetName: '文本情感分析数据集',
    user: '王五',
    type: '评分',
    rating: 5.0,
    comment: '数据集非常完整，标注规范，值得推荐',
    status: 'approved',
    createTime: '2024-01-13 09:15:00',
    updateTime: '2024-01-13 10:00:00',
  },
];

export default function RatingPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '数据集名称',
      dataIndex: 'datasetName',
      key: 'datasetName',
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '评分' ? 'blue' : 'red'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: '评论',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap = {
          approved: 'success',
          pending: 'processing',
          rejected: 'error',
        };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
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
          <Button type="link" icon={<StarOutlined />} onClick={() => handleApprove(record)}>
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
    message.info(`查看评分记录: ${record.datasetName}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑评分记录: ${record.datasetName}`);
  };

  const handleApprove = (record: any) => {
    message.success(`审核评分记录: ${record.datasetName}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除评分记录 "${record.datasetName}" 吗？`,
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
        title="用户评分管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建评分记录
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
        title="新建评分记录"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="datasetName"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="请输入数据集名称" />
          </Form.Item>
          <Form.Item
            name="user"
            label="用户"
            rules={[{ required: true, message: '请输入用户' }]}
          >
            <Input placeholder="请输入用户" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Option value="评分">评分</Option>
              <Option value="举报">举报</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="评论"
            rules={[{ required: true, message: '请输入评论' }]}
          >
            <TextArea placeholder="请输入评论" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
