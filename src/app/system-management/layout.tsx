'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import {
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  ProjectOutlined,
  ToolOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const SystemManagementLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/system-management/user',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/system-management/tenant',
      icon: <TeamOutlined />,
      label: '租户管理',
    },
    {
      key: '/system-management/role',
      icon: <KeyOutlined />,
      label: '权限角色',
    },
    {
      key: '/system-management/project',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/system-management/config',
      icon: <ToolOutlined />,
      label: '环境配置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <SettingOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <div style={{ marginTop: '8px', fontWeight: 'bold' }}>系统管理</div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '16px', padding: '24px', background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SystemManagementLayout; 