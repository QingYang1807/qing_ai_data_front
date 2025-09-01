'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  ProjectOutlined,
  ToolOutlined,
  SettingOutlined
} from '@ant-design/icons';

const SystemManagementPage: React.FC = () => {
  const router = useRouter();

  const managementModules = [
    {
      title: '用户管理',
      icon: <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      description: '管理系统用户，包括用户创建、编辑、删除和权限分配',
      path: '/system-management/user',
      color: '#1890ff'
    },
    {
      title: '租户管理',
      icon: <TeamOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      description: '管理多租户信息，包括租户创建、配置和资源限制',
      path: '/system-management/tenant',
      color: '#52c41a'
    },
    {
      title: '权限角色',
      icon: <KeyOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
      description: '管理角色和权限，包括角色创建、权限分配和菜单配置',
      path: '/system-management/role',
      color: '#faad14'
    },
    {
      title: '项目管理',
      icon: <ProjectOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      description: '管理项目信息，包括项目创建、成员管理和权限控制',
      path: '/system-management/project',
      color: '#722ed1'
    },
    {
      title: '环境配置',
      icon: <ToolOutlined style={{ fontSize: '32px', color: '#eb2f96' }} />,
      description: '管理系统配置参数，包括系统设置、邮件配置等',
      path: '/system-management/config',
      color: '#eb2f96'
    }
  ];

  const handleModuleClick = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          <SettingOutlined style={{ marginRight: '8px' }} />
          系统管理
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          管理系统用户、租户、权限、项目和环境配置
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {managementModules.map((module, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card
              hoverable
              style={{ 
                height: '200px', 
                cursor: 'pointer',
                border: `2px solid ${module.color}20`,
                borderRadius: '8px'
              }}
              onClick={() => handleModuleClick(module.path)}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ marginBottom: '16px' }}>
                  {module.icon}
                </div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: module.color
                }}>
                  {module.title}
                </h3>
                <p style={{ 
                  color: '#666', 
                  fontSize: '12px', 
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {module.description}
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={156}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总租户数"
              value={12}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={89}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="配置项数"
              value={45}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SystemManagementPage; 