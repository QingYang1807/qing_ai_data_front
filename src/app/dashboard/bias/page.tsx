'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '性别偏差检测',
    dataset: '用户行为数据集',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    biasScore: 0.15,
    riskLevel: '低风险',
    trend: '下降',
  },
  {
    id: 2,
    name: '年龄偏差检测',
    dataset: '推荐系统数据集',
    status: 'running',
    progress: 75,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    biasScore: 0.32,
    riskLevel: '中风险',
    trend: '上升',
  },
  {
    id: 3,
    name: '地域偏差检测',
    dataset: '广告投放数据集',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    biasScore: 0,
    riskLevel: '待检测',
    trend: '未知',
  },
];

export default function BiasPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '检测任务',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据集',
      dataIndex: 'dataset',
      key: 'dataset',
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
      title: '偏差分数',
      dataIndex: 'biasScore',
      key: 'biasScore',
      render: (score: number) => score > 0 ? score.toFixed(3) : '-',
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level: string) => {
        const colorMap = {
          '低风险': 'green',
          '中风险': 'orange',
          '高风险': 'red',
          '待检测': 'default',
        };
        return <Tag color={colorMap[level as keyof typeof colorMap]}>{level}</Tag>;
      },
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => {
        const colorMap = {
          '上升': 'red',
          '下降': 'green',
          '稳定': 'blue',
          '未知': 'default',
        };
        return <Tag color={colorMap[trend as keyof typeof colorMap]}>{trend}</Tag>;
      },
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
                      <Button type="link" icon={<WarningOutlined />} onClick={() => handleAnalyze(record)}>
            分析
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看偏差检测: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑偏差检测: ${record.name}`);
  };

  const handleAnalyze = (record: any) => {
    message.info(`分析偏差趋势: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除偏差检测 "${record.name}" 吗？`,
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
        title="偏差趋势分析"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建检测任务
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
        title="新建偏差检测任务"
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
            name="dataset"
            label="数据集"
            rules={[{ required: true, message: '请选择数据集' }]}
          >
            <Select placeholder="请选择数据集">
              <Option value="用户行为数据集">用户行为数据集</Option>
              <Option value="推荐系统数据集">推荐系统数据集</Option>
              <Option value="广告投放数据集">广告投放数据集</Option>
              <Option value="信用评估数据集">信用评估数据集</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="biasType"
            label="偏差类型"
            rules={[{ required: true, message: '请选择偏差类型' }]}
          >
            <Select placeholder="请选择偏差类型">
              <Option value="性别偏差">性别偏差</Option>
              <Option value="年龄偏差">年龄偏差</Option>
              <Option value="地域偏差">地域偏差</Option>
              <Option value="种族偏差">种族偏差</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="threshold"
            label="检测阈值"
            rules={[{ required: true, message: '请输入检测阈值' }]}
          >
            <Input type="number" placeholder="请输入检测阈值 (0-1)" step="0.01" min="0" max="1" />
          </Form.Item>
          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea placeholder="请输入任务描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
