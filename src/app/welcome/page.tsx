'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography, Space, Divider } from 'antd';
import { 
  Database, 
  Brain, 
  Zap, 
  Shield, 
  BarChart3, 
  Users,
  ArrowRight,
  Play,
  BookOpen,
  MessageCircle,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Globe,
  Lock,
  Cpu,
  Cloud
} from 'lucide-react';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function WelcomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 确保页面完全加载后再显示内容
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Database className="w-10 h-10 text-blue-600" />,
      title: '多源数据采集',
      description: '支持数据库、API、文件、流数据等多种数据源，实现统一的数据接入和管理。',
      highlights: ['实时数据同步', '批量数据处理', '数据源监控']
    },
    {
      icon: <Brain className="w-10 h-10 text-green-600" />,
      title: 'AI智能处理',
      description: '基于机器学习和深度学习技术，提供智能化的数据清洗、标注和增强能力。',
      highlights: ['自动数据清洗', '智能标注算法', '数据质量评估']
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-600" />,
      title: '高效工作流',
      description: '可视化工作流编排，支持复杂数据处理流程的自动化执行和监控。',
      highlights: ['拖拽式编排', '实时监控', '异常告警']
    },
    {
      icon: <Shield className="w-10 h-10 text-red-600" />,
      title: '企业级安全',
      description: '完善的数据安全机制，包括权限控制、数据脱敏、审计日志等企业级安全特性。',
      highlights: ['细粒度权限', '数据加密', '审计追踪']
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-purple-600" />,
      title: '质量评估',
      description: '全面的数据质量评估体系，确保数据的高质量、一致性和可靠性。',
      highlights: ['质量评分', '异常检测', '质量报告']
    },
    {
      icon: <Users className="w-10 h-10 text-indigo-600" />,
      title: '协作管理',
      description: '支持多用户协作，提供项目管理和团队协作功能，提升团队效率。',
      highlights: ['角色权限', '项目协作', '任务分配']
    }
  ];

  const stats = [
    { label: '数据源类型', value: '50+', icon: <Database className="w-6 h-6" /> },
    { label: 'AI算法', value: '100+', icon: <Brain className="w-6 h-6" /> },
    { label: '企业客户', value: '500+', icon: <Users className="w-6 h-6" /> },
    { label: '处理数据量', value: '10PB+', icon: <TrendingUp className="w-6 h-6" /> }
  ];

  const advantages = [
    {
      icon: <Award className="w-8 h-8 text-yellow-500" />,
      title: '行业领先',
      description: '在AI数据处理领域拥有丰富的经验和领先的技术实力'
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      title: '全球部署',
      description: '支持多云部署，满足不同地域和合规要求'
    },
    {
      icon: <Lock className="w-8 h-8 text-green-500" />,
      title: '安全可靠',
      description: '企业级安全架构，确保数据安全和业务连续性'
    },
    {
      icon: <Cpu className="w-8 h-8 text-purple-500" />,
      title: '高性能',
      description: '分布式架构设计，支持大规模数据处理和高并发访问'
    }
  ];

  if (!isLoaded) {
    return (
      <div className="bg-white w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 animate-gradient-flow bg-[length:400%_400%] bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
      <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <Title level={1} className="text-6xl font-bold mb-6 text-white" style={{ color: '#fff' }}>
              AI数据处理平台
            </Title>
            <Paragraph className="text-xl text-white mb-8 max-w-4xl mx-auto leading-relaxed">
              企业级AI数据处理解决方案，为机器学习模型提供高质量训练数据。
              从数据采集到质量评估，从智能标注到模型训练，一站式解决AI数据处理难题。
            </Paragraph>
            <Space size="large" className="mb-12">
              <Link href="/login">
                <Button type="primary" size="large" icon={<Play />} className="h-12 px-8 text-lg">
                  免费试用
                </Button>
              </Link>
              <Link href="/product-docs">
                <Button size="large" icon={<BookOpen />} ghost className="h-12 px-8 text-lg">
                  产品文档
                </Button>
              </Link>
            </Space>
            
            {/* 客户Logo */}
            <div className="mt-16">
              <Paragraph className="text-blue-200 mb-6">信任我们的企业客户</Paragraph>
              <div className="flex justify-center items-center space-x-12 opacity-60">
                <div className="text-2xl font-bold text-blue-300">Microsoft</div>
                <div className="text-2xl font-bold text-blue-300">Google</div>
                <div className="text-2xl font-bold text-blue-300">Amazon</div>
                <div className="text-2xl font-bold text-blue-300">Alibaba</div>
                <div className="text-2xl font-bold text-blue-300">Tencent</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[32, 32]} justify="center">
            {stats.map((stat, index) => (
              <Col key={index} xs={12} sm={6} md={3}>
                <div className="text-center bg-white p-8 rounded-lg shadow-sm">
                  <div className="flex justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Title level={2} className="text-4xl font-bold text-gray-900 mb-6">
              核心功能特性
            </Title>
            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
              提供完整的企业级AI数据处理解决方案，从数据采集到模型训练的全流程支持
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} sm={12} lg={8}>
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-sm"
                  styles={{ body: { padding: '2rem' } }}
                >
                  <div className="mb-6 flex justify-center">
                    {feature.icon}
                  </div>
                  <Title level={3} className="text-xl font-semibold mb-4 text-center">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-600 mb-6 text-center">
                    {feature.description}
                  </Paragraph>
                  <div className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold text-gray-900 mb-6">
              为什么选择我们
            </Title>
            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
              凭借专业的技术实力和丰富的行业经验，为企业提供最优质的AI数据处理服务
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {advantages.map((advantage, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {advantage.icon}
                  </div>
                  <Title level={4} className="text-lg font-semibold mb-3">
                    {advantage.title}
                  </Title>
                  <Paragraph className="text-gray-600">
                    {advantage.description}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title level={2} className="text-4xl font-bold text-white mb-6">
            开始您的AI数据处理之旅
          </Title>
          <Paragraph className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            立即体验企业级AI数据处理平台，为您的AI项目提供高质量的数据支持
          </Paragraph>
          <Space size="large">
            <Link href="/login">
              <Button type="primary" size="large" ghost icon={<ArrowRight />} className="h-12 px-8 text-lg">
                立即开始
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="large" ghost icon={<MessageCircle />} className="h-12 px-8 text-lg">
                联系我们
              </Button>
            </Link>
          </Space>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-blue-500 mr-2" />
                <Title level={4} className="text-xl font-semibold mb-0">
                  AI数据处理平台
                </Title>
              </div>
              <Paragraph className="text-gray-400 mb-4">
                企业级AI数据处理解决方案，为机器学习模型提供高质量训练数据。
              </Paragraph>
            </div>
            
            <div>
              <Title level={5} className="text-lg font-semibold mb-4">产品</Title>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">功能特性</Link></li>
                <li><Link href="/pricing" className="hover:text-white">价格方案</Link></li>
                <li><Link href="/docs" className="hover:text-white">产品文档</Link></li>
                <li><Link href="/api" className="hover:text-white">API文档</Link></li>
              </ul>
            </div>
            
            <div>
              <Title level={5} className="text-lg font-semibold mb-4">支持</Title>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">帮助中心</Link></li>
                <li><Link href="/contact" className="hover:text-white">联系我们</Link></li>
                <li><Link href="/status" className="hover:text-white">服务状态</Link></li>
                <li><Link href="/feedback" className="hover:text-white">意见反馈</Link></li>
              </ul>
            </div>
            
            <div>
              <Title level={5} className="text-lg font-semibold mb-4">公司</Title>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">关于我们</Link></li>
                <li><Link href="/careers" className="hover:text-white">加入我们</Link></li>
                <li><Link href="/privacy" className="hover:text-white">隐私政策</Link></li>
                <li><Link href="/terms" className="hover:text-white">服务条款</Link></li>
              </ul>
            </div>
          </div>
          
          <Divider className="border-gray-700 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 AI数据处理平台. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">隐私政策</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm">服务条款</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">Cookie政策</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 