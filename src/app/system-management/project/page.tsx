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
  Avatar,
  List
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ProjectOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import SystemManagementLayout from '../layout';

const { TextArea } = Input;
const { Option } = Select;

interface Project {
  id: number;
  projectCode: string;
  projectName: string;
  description: string;
  status: number;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  createdTime: string;
  updatedTime: string;
  tenantId: number;
}

interface ProjectMember {
  id: number;
  userId: number;
  username: string;
  realName: string;
  roleType: string;
  joinTime: string;
}

const ProjectManagementPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const mockProjects: Project[] = [
    {
      id: 1,
      projectCode: 'default-project',
      projectName: '默认项目',
      description: '系统默认项目',
      status: 1,
      ownerId: 1,
      ownerName: '系统管理员',
      memberCount: 3,
      createdTime: '2024-01-01 00:00:00',
      updatedTime: '2024-01-15 10:30:00',
      tenantId: 1
    },
    {
      id: 2,
      projectCode: 'test-project-1',
      projectName: '测试项目1',
      description: '测试项目1描述',
      status: 1,
      ownerId: 2,
      ownerName: '测试用户1',
      memberCount: 2,
      createdTime: '2024-01-02 00:00:00',
      updatedTime: '2024-01-14 15:20:00',
      tenantId: 1
    },
    {
      id: 3,
      projectCode: 'test-project-2',
      projectName: '测试项目2',
      description: '测试项目2描述',
      status: 0,
      ownerId: 3,
      ownerName: '测试用户2',
      memberCount: 1,
      createdTime: '2024-01-03 00:00:00',
      updatedTime: '2024-01-13 09:15:00',
      tenantId: 1
    }
  ];

  const mockMembers: ProjectMember[] = [
    {
      id: 1,
      userId: 1,
      username: 'admin',
      realName: '系统管理员',
      roleType: 'owner',
      joinTime: '2024-01-01 00:00:00'
    },
    {
      id: 2,
      userId: 2,
      username: 'user1',
      realName: '测试用户1',
      roleType: 'admin',
      joinTime: '2024-01-02 00:00:00'
    },
    {
      id: 3,
      userId: 3,
      username: 'user2',
      realName: '测试用户2',
      roleType: 'member',
      joinTime: '2024-01-03 00:00:00'
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProjects(mockProjects);
    } catch (error) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    form.setFieldsValue({
      projectCode: record.projectCode,
      projectName: record.projectName,
      description: record.description,
      status: record.status === 1
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProjects(projects.filter(project => project.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleMembers = (record: Project) => {
    setSelectedProject(record);
    setMembers(mockMembers);
    setMemberModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProject) {
        const updatedProject = { ...editingProject, ...values, status: values.status ? 1 : 0 };
        setProjects(projects.map(project => project.id === editingProject.id ? updatedProject : project));
        message.success('更新成功');
      } else {
        const newProject: Project = {
          id: Date.now(),
          ...values,
          status: values.status ? 1 : 0,
          ownerId: 1,
          ownerName: '系统管理员',
          memberCount: 1,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
          tenantId: 1
        };
        setProjects([newProject, ...projects]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getRoleTypeText = (roleType: string) => {
    const roleMap: { [key: string]: { text: string; color: string } } = {
      owner: { text: '负责人', color: 'red' },
      admin: { text: '管理员', color: 'blue' },
      member: { text: '成员', color: 'green' }
    };
    return roleMap[roleType] || { text: '未知', color: 'default' };
  };

  const columns = [
    {
      title: '项目信息',
      key: 'projectInfo',
      render: (record: Project) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{record.projectName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>编码: {record.projectCode}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{record.description}</div>
        </div>
      )
    },
    {
      title: '负责人',
      key: 'owner',
      render: (record: Project) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: '8px' }} />
          <span>{record.ownerName}</span>
        </div>
      )
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number) => (
        <Tag icon={<TeamOutlined />} color="blue">
          {count} 人
        </Tag>
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
      render: (record: Project) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="成员管理">
            <Button
              type="link"
              icon={<TeamOutlined />}
              onClick={() => handleMembers(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个项目吗？"
            description="删除项目将同时删除项目下的所有数据"
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
            <ProjectOutlined style={{ marginRight: '8px' }} />
            项目管理
          </h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchProjects}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建项目
            </Button>
          </Space>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }}
          />
        </Card>

        {/* 项目编辑模态框 */}
        <Modal
          title={editingProject ? '编辑项目' : '新建项目'}
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
                  name="projectCode"
                  label="项目编码"
                  rules={[
                    { required: true, message: '请输入项目编码' },
                    { pattern: /^[a-zA-Z0-9_-]+$/, message: '项目编码只能包含字母、数字、下划线和横线' }
                  ]}
                >
                  <Input placeholder="请输入项目编码" disabled={!!editingProject} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="projectName"
                  label="项目名称"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input placeholder="请输入项目名称" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="项目描述"
            >
              <TextArea rows={3} placeholder="请输入项目描述" />
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

        {/* 成员管理模态框 */}
        <Modal
          title={`成员管理 - ${selectedProject?.projectName}`}
          open={memberModalVisible}
          onCancel={() => setMemberModalVisible(false)}
          footer={null}
          width={800}
        >
          <div style={{ marginBottom: '16px' }}>
            <Button type="primary" icon={<PlusOutlined />}>
              添加成员
            </Button>
          </div>
          <List
            dataSource={members}
            renderItem={(member) => {
              const roleInfo = getRoleTypeText(member.roleType);
              return (
                <List.Item
                  actions={[
                    <Button key="edit" type="link" size="small">编辑</Button>,
                    <Button key="remove" type="link" size="small" danger>移除</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div>
                        <span>{member.realName}</span>
                        <Tag color={roleInfo.color} style={{ marginLeft: '8px' }}>
                          {roleInfo.text}
                        </Tag>
                      </div>
                    }
                    description={`${member.username} | 加入时间: ${new Date(member.joinTime).toLocaleString()}`}
                  />
                </List.Item>
              );
            }}
          />
        </Modal>
      </div>
    </SystemManagementLayout>
  );
};

export default ProjectManagementPage; 