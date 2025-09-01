'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      // 暂时跳过登录逻辑，直接进入系统
      // const success = await login(values.username, values.password);
      // if (success) {
      //   message.success('登录成功');
      //   router.push('/');
      // } else {
      //   message.error('用户名或密码错误');
      // }
      
      // 设置模拟用户信息，跳过认证
      const mockUser = {
        id: 1,
        username: values.username || 'admin',
        realName: values.username || 'admin',
        email: 'admin@example.com',
        phone: '',
        status: 1,
        lastLoginTime: new Date().toISOString(),
      };
      
      // 设置认证状态
      useAuthStore.getState().setUser(mockUser);
      
      // 直接跳转到主系统
      message.success('登录成功');
      router.push('/dashboard');
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const success = await register(values);
      if (success) {
        message.success('注册成功，请登录');
        setActiveTab('login');
      } else {
        message.error('注册失败，请重试');
      }
    } catch (error) {
      message.error('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
          size="large"
          initialValues={{
            username: 'admin',
            password: 'asadfgh@123545!!f#'
          }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
            >
              登录
            </Button>
          </Form.Item>

          {/* <div className="text-center text-sm text-gray-600">
            <p>默认账号：admin</p>
            <p>默认密码：123456</p>
          </div> */}
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI数据处理平台</h1>
          <p className="text-gray-600">智能数据处理，助力AI发展</p>
        </div>

        <Card className="shadow-lg border-0">
          <Tabs activeKey={activeTab} onChange={setActiveTab} centered items={tabItems} />
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 