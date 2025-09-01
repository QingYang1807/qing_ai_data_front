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
  Select,
  InputNumber,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ToolOutlined,
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import SystemManagementLayout from '../layout';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Config {
  id: number;
  configKey: string;
  configValue: string;
  configType: string;
  description: string;
  isSystem: number;
  createdTime: string;
  updatedTime: string;
  tenantId: number;
}

const ConfigManagementPage: React.FC = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockConfigs: Config[] = [
    {
      id: 1,
      configKey: 'system.name',
      configValue: '青AI数据平台',
      configType: 'string',
      description: '系统名称',
      isSystem: 1,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 2,
      configKey: 'system.version',
      configValue: '1.0.0',
      configType: 'string',
      description: '系统版本',
      isSystem: 1,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 3,
      configKey: 'file.upload.max-size',
      configValue: '100',
      configType: 'number',
      description: '文件上传最大大小(MB)',
      isSystem: 1,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 4,
      configKey: 'security.password.min-length',
      configValue: '6',
      configType: 'number',
      description: '密码最小长度',
      isSystem: 1,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 5,
      configKey: 'email.smtp.host',
      configValue: 'smtp.example.com',
      configType: 'string',
      description: 'SMTP服务器地址',
      isSystem: 0,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 6,
      configKey: 'email.smtp.ssl',
      configValue: 'true',
      configType: 'boolean',
      description: '是否启用SSL',
      isSystem: 0,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setConfigs(mockConfigs);
    } catch (error) {
      message.error('获取配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Config) => {
    setEditingConfig(record);
    form.setFieldsValue({
      configKey: record.configKey,
      configValue: record.configValue,
      configType: record.configType,
      description: record.description,
      isSystem: record.isSystem === 1
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setConfigs(configs.filter(config => config.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingConfig) {
        const updatedConfig = { ...editingConfig, ...values, isSystem: values.isSystem ? 1 : 0 };
        setConfigs(configs.map(config => config.id === editingConfig.id ? updatedConfig : config));
        message.success('更新成功');
      } else {
        const newConfig: Config = {
          id: Date.now(),
          ...values,
          isSystem: values.isSystem ? 1 : 0,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
          tenantId: 1
        };
        setConfigs([newConfig, ...configs]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getConfigTypeText = (type: string) => {
    const typeMap: { [key: string]: { text: string; color: string } } = {
      string: { text: '字符串', color: 'blue' },
      number: { text: '数字', color: 'green' },
      boolean: { text: '布尔值', color: 'orange' },
      json: { text: 'JSON', color: 'purple' }
    };
    return typeMap[type] || { text: '未知', color: 'default' };
  };

  const renderConfigValue = (config: Config) => {
    switch (config.configType) {
      case 'boolean':
        return (
          <Tag color={config.configValue === 'true' ? 'green' : 'red'}>
            {config.configValue === 'true' ? '是' : '否'}
          </Tag>
        );
      case 'number':
        return <span style={{ fontFamily: 'monospace' }}>{config.configValue}</span>;
      default:
        return <span style={{ fontFamily: 'monospace' }}>{config.configValue}</span>;
    }
  };

  const columns = [
    {
      title: '配置信息',
      key: 'configInfo',
      render: (record: Config) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.configKey}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: '配置值',
      key: 'configValue',
      render: (record: Config) => renderConfigValue(record)
    },
    {
      title: '类型',
      dataIndex: 'configType',
      key: 'configType',
      render: (type: string) => {
        const typeInfo = getConfigTypeText(type);
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      }
    },
    {
      title: '系统配置',
      dataIndex: 'isSystem',
      key: 'isSystem',
      render: (isSystem: number) => (
        <Tag color={isSystem === 1 ? 'red' : 'blue'}>
          {isSystem === 1 ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Config) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.isSystem === 1}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            disabled={record.isSystem === 1}
          >
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={record.isSystem === 1}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const systemConfigs = configs.filter(config => config.isSystem === 1);
  const customConfigs = configs.filter(config => config.isSystem === 0);

  return (
    <SystemManagementLayout>
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            <ToolOutlined style={{ marginRight: '8px' }} />
            环境配置
          </h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchConfigs}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建配置
            </Button>
          </Space>
        </div>

        <Card>
          <Tabs defaultActiveKey="all">
            <TabPane tab="全部配置" key="all">
              <Table
                columns={columns}
                dataSource={configs}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                }}
              />
            </TabPane>
            <TabPane tab="系统配置" key="system">
              <Table
                columns={columns}
                dataSource={systemConfigs}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                }}
              />
            </TabPane>
            <TabPane tab="自定义配置" key="custom">
              <Table
                columns={columns}
                dataSource={customConfigs}
                rowKey="id"
                loading={loading}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                }}
              />
            </TabPane>
          </Tabs>
        </Card>

        <Modal
          title={editingConfig ? '编辑配置' : '新建配置'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="configKey"
                  label="配置键"
                  rules={[
                    { required: true, message: '请输入配置键' },
                    { pattern: /^[a-zA-Z0-9._-]+$/, message: '配置键只能包含字母、数字、点、下划线和横线' }
                  ]}
                >
                  <Input placeholder="请输入配置键" disabled={!!editingConfig} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="configType"
                  label="配置类型"
                  rules={[{ required: true, message: '请选择配置类型' }]}
                >
                  <Select placeholder="请选择配置类型">
                    <Option value="string">字符串</Option>
                    <Option value="number">数字</Option>
                    <Option value="boolean">布尔值</Option>
                    <Option value="json">JSON</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="configValue"
              label="配置值"
              rules={[{ required: true, message: '请输入配置值' }]}
            >
              <TextArea rows={3} placeholder="请输入配置值" />
            </Form.Item>
            <Form.Item
              name="description"
              label="配置描述"
            >
              <Input placeholder="请输入配置描述" />
            </Form.Item>
            <Form.Item
              name="isSystem"
              label="系统配置"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </SystemManagementLayout>
  );
};

export default ConfigManagementPage; 