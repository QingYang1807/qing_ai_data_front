'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '用户隐私数据检测',
    type: '个人信息',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    complianceRate: 95.5,
    riskLevel: '低风险',
    violations: 2,
  },
  {
    id: 2,
    name: '敏感数据识别',
    type: '敏感信息',
    status: 'running',
    progress: 75,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    complianceRate: 88.2,
    riskLevel: '中风险',
    violations: 5,
  },
  {
    id: 3,
    name: '数据脱敏检测',
    type: '脱敏检测',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    complianceRate: 0,
    riskLevel: '待检测',
    violations: 0,
  },
];

export default function PrivacyPage() {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '检测任务',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '检测类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '个人信息' ? 'blue' : type === '敏感信息' ? 'red' : 'orange'}>
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
      title: '合规率',
      dataIndex: 'complianceRate',
      key: 'complianceRate',
      render: (rate: number) => rate > 0 ? `${rate}%` : '-',
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
      title: '违规数量',
      dataIndex: 'violations',
      key: 'violations',
      render: (violations: number) => violations > 0 ? violations : '-',
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
          <Button type="link" icon={<SafetyCertificateOutlined />} onClick={() => handleReport(record)}>
            报告
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    message.info(`查看隐私检测: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑隐私检测: ${record.name}`);
  };

  const handleReport = (record: any) => {
    message.info(`生成隐私报告: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除隐私检测 "${record.name}" 吗？`,
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
        title="隐私合规检测管理"
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
        title="新建隐私检测任务"
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
            label="检测类型"
            rules={[{ required: true, message: '请选择检测类型' }]}
          >
            <Select placeholder="请选择检测类型">
              <Option value="个人信息">个人信息检测</Option>
              <Option value="敏感信息">敏感信息检测</Option>
              <Option value="脱敏检测">数据脱敏检测</Option>
              <Option value="合规检测">合规性检测</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dataSource"
            label="检测对象"
            rules={[{ required: true, message: '请输入检测对象' }]}
          >
            <Input placeholder="请输入检测对象路径" />
          </Form.Item>
          <Form.Item
            name="standards"
            label="检测标准"
            rules={[{ required: true, message: '请输入检测标准' }]}
          >
            <Input.TextArea placeholder="请输入检测标准" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
