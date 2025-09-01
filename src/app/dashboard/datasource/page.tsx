'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, message, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SyncOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟数据源数据
const mockDataSources = [
  {
    id: 1,
    name: 'MySQL生产数据库',
    type: 'mysql',
    host: '192.168.1.100',
    port: 3306,
    database: 'production_db',
    status: 'connected',
    lastSync: '2024-01-15 10:30:00',
    description: '生产环境MySQL数据库'
  },
  {
    id: 2,
    name: 'PostgreSQL分析库',
    type: 'postgresql',
    host: '192.168.1.101',
    port: 5432,
    database: 'analytics_db',
    status: 'connected',
    lastSync: '2024-01-15 09:15:00',
    description: '数据分析PostgreSQL数据库'
  },
  {
    id: 3,
    name: 'MongoDB日志库',
    type: 'mongodb',
    host: '192.168.1.102',
    port: 27017,
    database: 'logs_db',
    status: 'disconnected',
    lastSync: '2024-01-14 16:45:00',
    description: '日志存储MongoDB数据库'
  },
  {
    id: 4,
    name: 'Redis缓存库',
    type: 'redis',
    host: '192.168.1.103',
    port: 6379,
    database: 'cache_db',
    status: 'connected',
    lastSync: '2024-01-15 11:00:00',
    description: '缓存Redis数据库'
  }
];

const dataSourceTypes = [
  { value: 'mysql', label: 'MySQL', icon: '🐬' },
  { value: 'postgresql', label: 'PostgreSQL', icon: '🐘' },
  { value: 'mongodb', label: 'MongoDB', icon: '🍃' },
  { value: 'redis', label: 'Redis', icon: '🔴' },
  { value: 'oracle', label: 'Oracle', icon: '🔶' },
  { value: 'sqlserver', label: 'SQL Server', icon: '💾' }
];

export default function DataSourcePage() {
  const [dataSources, setDataSources] = useState(mockDataSources);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<any>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingDataSource(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingDataSource(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setDataSources(dataSources.filter(item => item.id !== id));
    message.success('数据源删除成功');
  };

  const handleTestConnection = (record: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`${record.name} 连接测试成功`);
    }, 1000);
  };

  const handleSync = (record: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`${record.name} 同步完成`);
    }, 1500);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingDataSource) {
        // 编辑模式
        setDataSources(dataSources.map(item => 
          item.id === editingDataSource.id ? { ...item, ...values } : item
        ));
        message.success('数据源更新成功');
      } else {
        // 新增模式
        const newDataSource = {
          id: Date.now(),
          ...values,
          status: 'connected',
          lastSync: new Date().toLocaleString('zh-CN')
        };
        setDataSources([...dataSources, newDataSource]);
        message.success('数据源添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const columns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => (
        <Space>
          <DatabaseOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: any) => {
        const typeInfo = dataSourceTypes.find(t => t.value === type);
        return (
          <Tag color="blue">
            {typeInfo?.icon} {typeInfo?.label}
          </Tag>
        );
      }
    },
    {
      title: '连接信息',
      key: 'connection',
      render: (_: any, record: any) => (
        <div>
          <div>{record.host}:{record.port}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.database}</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => (
        <Tag color={status === 'connected' ? 'green' : 'red'}>
          {status === 'connected' ? '已连接' : '未连接'}
        </Tag>
      )
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
      render: (text: any) => <span style={{ fontSize: '12px' }}>{text}</span>
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => message.info('查看详情功能开发中...')}
            />
          </Tooltip>
          <Tooltip title="测试连接">
            <Button 
              type="text" 
              icon={<SyncOutlined spin={loading} />} 
              size="small"
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>
          <Tooltip title="同步数据">
            <Button 
              type="text" 
              icon={<SyncOutlined spin={loading} />} 
              size="small"
              onClick={() => handleSync(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个数据源吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card
        title="数据源管理"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加数据源
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSources}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingDataSource ? '编辑数据源' : '添加数据源'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            port: 3306,
            status: 'connected'
          }}
        >
          <Form.Item
            name="name"
            label="数据源名称"
            rules={[{ required: true, message: '请输入数据源名称' }]}
          >
            <Input placeholder="请输入数据源名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="数据库类型"
            rules={[{ required: true, message: '请选择数据库类型' }]}
          >
            <Select placeholder="请选择数据库类型">
              {dataSourceTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="host"
            label="主机地址"
            rules={[{ required: true, message: '请输入主机地址' }]}
          >
            <Input placeholder="请输入主机地址" />
          </Form.Item>

          <Form.Item
            name="port"
            label="端口号"
            rules={[{ required: true, message: '请输入端口号' }]}
          >
            <Input type="number" placeholder="请输入端口号" />
          </Form.Item>

          <Form.Item
            name="database"
            label="数据库名"
            rules={[{ required: true, message: '请输入数据库名' }]}
          >
            <Input placeholder="请输入数据库名" />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              placeholder="请输入数据源描述" 
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 