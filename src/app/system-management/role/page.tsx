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
  Tree,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  KeyOutlined,
  SettingOutlined
} from '@ant-design/icons';
import SystemManagementLayout from '../layout';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  description: string;
  status: number;
  createdTime: string;
  updatedTime: string;
  tenantId: number;
}

interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  permissionType: string;
  parentId: number;
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  status: number;
  children?: Permission[];
}

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [form] = Form.useForm();

  // 模拟数据
  const mockRoles: Role[] = [
    {
      id: 1,
      roleCode: 'SUPER_ADMIN',
      roleName: '超级管理员',
      description: '系统超级管理员，拥有所有权限',
      status: 1,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 2,
      roleCode: 'TENANT_ADMIN',
      roleName: '租户管理员',
      description: '租户管理员，管理租户内所有资源',
      status: 1,
      createdTime: '2024-01-02 00:00:00',
      updatedTime: '2024-01-14 15:20:00',
      tenantId: 1
    },
    {
      id: 3,
      roleCode: 'PROJECT_ADMIN',
      roleName: '项目管理员',
      description: '项目管理员，管理项目内资源',
      status: 1,
      createdTime: '2024-01-03 00:00:00',
      updatedTime: '2024-01-13 09:15:00',
      tenantId: 1
    },
    {
      id: 4,
      roleCode: 'USER',
      roleName: '普通用户',
      description: '普通用户，基础功能使用权限',
      status: 1,
      createdTime: '2024-01-04 00:00:00',
      updatedTime: '2024-01-12 16:45:00',
      tenantId: 1
    }
  ];

  const mockPermissions: Permission[] = [
    {
      id: 1,
      permissionCode: 'data-center',
      permissionName: '数据中心',
      permissionType: 'menu',
      parentId: 0,
      path: '/data-center',
      component: 'Layout',
      icon: 'DatabaseOutlined',
      sortOrder: 1,
      status: 1,
      children: [
        {
          id: 2,
          permissionCode: 'data-datasource',
          permissionName: '数据源管理',
          permissionType: 'menu',
          parentId: 1,
          path: '/data-center/datasource',
          component: 'DataCenter/Datasource',
          icon: 'CloudServerOutlined',
          sortOrder: 1,
          status: 1
        },
        {
          id: 3,
          permissionCode: 'data-collect',
          permissionName: '数据采集',
          permissionType: 'menu',
          parentId: 1,
          path: '/data-center/collect',
          component: 'DataCenter/Collect',
          icon: 'CloudDownloadOutlined',
          sortOrder: 2,
          status: 1
        }
      ]
    },
    {
      id: 10,
      permissionCode: 'data-market',
      permissionName: '数据市场',
      permissionType: 'menu',
      parentId: 0,
      path: '/data-market',
      component: 'Layout',
      icon: 'ShoppingOutlined',
      sortOrder: 2,
      status: 1,
      children: [
        {
          id: 11,
          permissionCode: 'dataset-list',
          permissionName: '数据集列表',
          permissionType: 'menu',
          parentId: 10,
          path: '/data-market/dataset',
          component: 'DataMarket/Dataset',
          icon: 'UnorderedListOutlined',
          sortOrder: 1,
          status: 1
        }
      ]
    },
    {
      id: 40,
      permissionCode: 'system-management',
      permissionName: '系统管理',
      permissionType: 'menu',
      parentId: 0,
      path: '/system-management',
      component: 'Layout',
      icon: 'SettingOutlined',
      sortOrder: 9,
      status: 1,
      children: [
        {
          id: 41,
          permissionCode: 'user-management',
          permissionName: '用户管理',
          permissionType: 'menu',
          parentId: 40,
          path: '/system-management/user',
          component: 'SystemManagement/User',
          icon: 'UserOutlined',
          sortOrder: 1,
          status: 1
        },
        {
          id: 42,
          permissionCode: 'tenant-management',
          permissionName: '租户管理',
          permissionType: 'menu',
          parentId: 40,
          path: '/system-management/tenant',
          component: 'SystemManagement/Tenant',
          icon: 'TeamOutlined',
          sortOrder: 2,
          status: 1
        }
      ]
    }
  ];

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(mockRoles);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPermissions(mockPermissions);
    } catch (error) {
      message.error('获取权限列表失败');
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      roleCode: record.roleCode,
      roleName: record.roleName,
      description: record.description,
      status: record.status === 1
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(roles.filter(role => role.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePermission = (record: Role) => {
    setSelectedRole(record);
    setSelectedPermissions([1, 2, 3, 10, 11, 40, 41, 42]); // 模拟已选权限
    setPermissionModalVisible(true);
  };

  const handlePermissionSubmit = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('权限分配成功');
      setPermissionModalVisible(false);
    } catch (error) {
      message.error('权限分配失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        const updatedRole = { ...editingRole, ...values, status: values.status ? 1 : 0 };
        setRoles(roles.map(role => role.id === editingRole.id ? updatedRole : role));
        message.success('更新成功');
      } else {
        const newRole: Role = {
          id: Date.now(),
          ...values,
          status: values.status ? 1 : 0,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
          tenantId: 1
        };
        setRoles([newRole, ...roles]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '角色信息',
      key: 'roleInfo',
      render: (record: Role) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{record.roleName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>编码: {record.roleCode}</div>
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
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (record: Role) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="权限配置">
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => handlePermission(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个角色吗？"
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

  const treeData = permissions.map(permission => ({
    title: permission.permissionName,
    key: permission.id,
    children: permission.children?.map(child => ({
      title: child.permissionName,
      key: child.id
    }))
  }));

  return (
    <SystemManagementLayout>
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            <KeyOutlined style={{ marginRight: '8px' }} />
            权限角色
          </h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRoles}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建角色
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }}
          />
        </Card>

        {/* 角色编辑模态框 */}
        <Modal
          title={editingRole ? '编辑角色' : '新建角色'}
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
                  name="roleCode"
                  label="角色编码"
                  rules={[
                    { required: true, message: '请输入角色编码' },
                    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线' }
                  ]}
                >
                  <Input placeholder="请输入角色编码" disabled={!!editingRole} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="roleName"
                  label="角色名称"
                  rules={[{ required: true, message: '请输入角色名称' }]}
                >
                  <Input placeholder="请输入角色名称" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="角色描述"
            >
              <TextArea rows={3} placeholder="请输入角色描述" />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              valuePropName="checked"
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 权限配置模态框 */}
        <Modal
          title={`权限配置 - ${selectedRole?.roleName}`}
          open={permissionModalVisible}
          onOk={handlePermissionSubmit}
          onCancel={() => setPermissionModalVisible(false)}
          width={800}
        >
          <Tabs defaultActiveKey="menu">
            <TabPane tab="菜单权限" key="menu">
              <Tree
                checkable
                checkedKeys={selectedPermissions}
                onCheck={(checkedKeys) => setSelectedPermissions(checkedKeys as number[])}
                treeData={treeData}
                defaultExpandAll
              />
            </TabPane>
            <TabPane tab="按钮权限" key="button">
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                按钮权限配置功能开发中...
              </div>
            </TabPane>
            <TabPane tab="API权限" key="api">
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                API权限配置功能开发中...
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      </div>
    </SystemManagementLayout>
  );
};

export default RoleManagementPage; 