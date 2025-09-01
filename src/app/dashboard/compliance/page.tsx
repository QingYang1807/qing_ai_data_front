'use client';

import React from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '数据隐私合规检测',
    type: '隐私检测',
    status: 'completed',
    progress: 100,
    startTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 18:00:00',
    complianceRate: 95.5,
    issues: 3,
    level: '低风险',
  },
  {
    id: 2,
    name: '数据安全合规检测',
    type: '安全检测',
    status: 'running',
    progress: 75,
    startTime: '2024-01-14 09:00:00',
    endTime: '2024-01-14 17:00:00',
    complianceRate: 88.2,
    issues: 8,
    level: '中风险',
  },
  {
    id: 3,
    name: '数据质量合规检测',
    type: '质量检测',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16 08:00:00',
    endTime: '2024-01-16 16:00:00',
    complianceRate: 0,
    issues: 0,
    level: '待检测',
  },
];

export default function CompliancePage() {
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
        <Tag color={type === '隐私检测' ? 'blue' : type === '安全检测' ? 'green' : 'orange'}>
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
      title: '问题数量',
      dataIndex: 'issues',
      key: 'issues',
      render: (issues: number) => issues > 0 ? issues : '-',
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
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
    message.info(`查看合规检测: ${record.name}`);
  };

  const handleEdit = (record: any) => {
    message.info(`编辑合规检测: ${record.name}`);
  };

  const handleReport = (record: any) => {
    message.info(`生成合规报告: ${record.name}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除合规检测 "${record.name}" 吗？`,
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
        title="合规检测管理"
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
        title="新建合规检测任务"
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
              <Option value="隐私检测">数据隐私检测</Option>
              <Option value="安全检测">数据安全检测</Option>
              <Option value="质量检测">数据质量检测</Option>
              <Option value="法规检测">法规合规检测</Option>
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
