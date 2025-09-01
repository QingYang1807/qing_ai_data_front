'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
  InputNumber,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import SystemManagementLayout from '../layout';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface Tenant {
  id: number;
  tenantCode: string;
  tenantName: string;
  description: string;
  status: number;
  expireTime: string;
  maxUserCount: number;
  maxProjectCount: number;
  createdTime: string;
  updatedTime: string;
}

const TenantManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockTenants: Tenant[] = [
    {
      id: 1,
      tenantCode: 'default',
      tenantName: '默认租户',
      description: '系统默认租户',
      status: 1,
      expireTime: '2099-12-31 23:59:59',
      maxUserCount: 1000,
      maxProjectCount: 100,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      tenantCode: 'company_a',
      tenantName: '公司A',
      description: '公司A的租户',
      status: 1,
      expireTime: '2025-12-31 23:59:59',
      maxUserCount: 500,
      maxProjectCount: 50,
      createdTime: '2024-01-02 00:00:00',
      updatedTime: '2024-01-14 15:20:00'
    },
    {
      id: 3,
      tenantCode: 'company_b',
      tenantName: '公司B',
      description: '公司B的租户',
      status: 0,
      expireTime: '2024-06-30 23:59:59',
      maxUserCount: 200,
      maxProjectCount: 20,
      createdTime: '2024-01-03 00:00:00',
      updatedTime: '2024-01-13 09:15:00'
    }
  ];

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTenants(mockTenants);
    } catch (error) {
      message.error('获取租户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Tenant) => {
    setEditingTenant(record);
    form.setFieldsValue({
      tenantCode: record.tenantCode,
      tenantName: record.tenantName,
      description: record.description,
      status: record.status === 1,
      expireTime: record.expireTime ? dayjs(record.expireTime) : null,
      maxUserCount: record.maxUserCount,
      maxProjectCount: record.maxProjectCount
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTenants(tenants.filter(tenant => tenant.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        // 更新租户
        const updatedTenant = { 
          ...editingTenant, 
          ...values, 
          status: values.status ? 1 : 0,
          expireTime: values.expireTime ? values.expireTime.format('YYYY-MM-DD HH:mm:ss') : null
        };
        setTenants(tenants.map(tenant => tenant.id === editingTenant.id ? updatedTenant : tenant));
        message.success('更新成功');
      } else {
        // 创建租户
        const newTenant: Tenant = {
          id: Date.now(),
          ...values,
          status: values.status ? 1 : 0,
          expireTime: values.expireTime ? values.expireTime.format('YYYY-MM-DD HH:mm:ss') : null,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString()
        };
        setTenants([newTenant, ...tenants]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '租户信息',
      key: 'tenantInfo',
      render: (record: Tenant) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{record.tenantName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>编码: {record.tenantCode}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '资源限制',
      key: 'resourceLimit',
      render: (record: Tenant) => (
        <div>
          <div>用户数: {record.maxUserCount}</div>
          <div>项目数: {record.maxProjectCount}</div>
        </div>
      )
    },
    {
      title: '过期时间',
      dataIndex: 'expireTime',
      key: 'expireTime',
      render: (time: string) => {
        if (!time) return '永久有效';
        const expireDate = dayjs(time);
        const now = dayjs();
        const isExpired = expireDate.isBefore(now);
        return (
          <div>
            <div style={{ color: isExpired ? '#ff4d4f' : '#52c41a' }}>
              {expireDate.format('YYYY-MM-DD HH:mm')}
            </div>
            {isExpired && <div style={{ color: '#ff4d4f', fontSize: '12px' }}>已过期</div>}
          </div>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Tenant) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个租户吗？"
            description="删除租户将同时删除该租户下的所有用户和项目数据"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <SystemManagementLayout>
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: '8px' }} />
            租户管理
          </h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTenants}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建租户
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={tenants}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }}
          />
        </Card>

        <Modal
          title={editingTenant ? '编辑租户' : '新建租户'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="tenantCode"
                  label="租户编码"
                  rules={[
                    { required: true, message: '请输入租户编码' },
                    { pattern: /^[a-zA-Z0-9_-]+$/, message: '租户编码只能包含字母、数字、下划线和横线' }
                  ]}
                >
                  <Input placeholder="请输入租户编码" disabled={!!editingTenant} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="tenantName"
                  label="租户名称"
                  rules={[{ required: true, message: '请输入租户名称' }]}
                >
                  <Input placeholder="请输入租户名称" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="租户描述"
            >
              <TextArea rows={3} placeholder="请输入租户描述" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="maxUserCount"
                  label="最大用户数"
                  rules={[{ required: true, message: '请输入最大用户数' }]}
                >
                  <InputNumber
                    min={1}
                    max={10000}
                    style={{ width: '100%' }}
                    placeholder="请输入最大用户数"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxProjectCount"
                  label="最大项目数"
                  rules={[{ required: true, message: '请输入最大项目数' }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    style={{ width: '100%' }}
                    placeholder="请输入最大项目数"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expireTime"
                  label="过期时间"
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="请选择过期时间"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </SystemManagementLayout>
  );
};

export default TenantManagementPage; 