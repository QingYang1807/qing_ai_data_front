'use client';

import React, { useState } from 'react';
import { Layout, Menu, Card, Typography, Space, Divider, Tag, Button, Collapse, List, Avatar, Steps, Timeline, Alert } from 'antd';
import { 
  BookOpen, 
  Database, 
  Server, 
  Bot, 
  Settings, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  CheckCircle,
  FileText,
  Code,
  Rocket,
  Target,
  BarChart3,
  Workflow,
  GitBranch,
  Play,
  Download,
  Upload,
  Filter,
  Edit,
  Plus,
  Merge,
  RefreshCw,
  ShoppingCart,
  List as ListIcon,
  CreditCard,
  Star,
  EyeOff,
  Lock,
  Home,
  Grid,
  CheckCircle as CheckCircleIcon,
  Store,
  Clock,
  User,
  Key,
  FolderOpen,
  FlaskConical
} from 'lucide-react';

const { Header, Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const ProductDocsPage: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('overview');

  const menuItems = [
    {
      key: 'overview',
      icon: <BookOpen className="w-4 h-4" />,
      label: '产品概述',
    },
    {
      key: 'features',
      icon: <Target className="w-4 h-4" />,
      label: '功能特性',
    },
    {
      key: 'architecture',
      icon: <GitBranch className="w-4 h-4" />,
      label: '技术架构',
    },
    {
      key: 'guide',
      icon: <FileText className="w-4 h-4" />,
      label: '使用指南',
    },
    {
      key: 'api',
      icon: <Code className="w-4 h-4" />,
      label: 'API文档',
    },
    {
      key: 'deployment',
      icon: <Rocket className="w-4 h-4" />,
      label: '部署说明',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <Title level={2}>Qing AI数据智算平台</Title>
        <Paragraph className="text-lg">
          Qing AI数据智算平台是一个企业级、多租户的AI数据处理和模型训练平台，
          支持从数据标注到模型部署的全生命周期管理，为企业和个人开发者提供完整的AI解决方案。
        </Paragraph>
        
        <Alert
          message="平台特色"
          description="基于微服务架构，支持多厂商异构算力，提供零代码/低代码开发环境"
          type="info"
          showIcon
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card size="small" className="text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <Title level={4}>数据管理</Title>
            <Text>多模态数据支持，智能标注工具</Text>
          </Card>
          <Card size="small" className="text-center">
            <Bot className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <Title level={4}>AI训练</Title>
            <Text>零代码模型微调，分布式训练</Text>
          </Card>
          <Card size="small" className="text-center">
            <Rocket className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <Title level={4}>智能部署</Title>
            <Text>一键部署，推理加速</Text>
          </Card>
        </div>
      </Card>

      <Card title="目标用户">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Title level={4}>企业用户 (2B)</Title>
            <List
              dataSource={[
                '大型企业集团：需要内部AI能力建设',
                '中小企业：希望低成本获得AI能力',
                '科研院所：需要大规模算力和数据处理能力',
                '政府机构：政务数据处理，智慧城市建设需求'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </div>
          <div>
            <Title level={4}>个人开发者 (2C)</Title>
            <List
              dataSource={[
                'AI研究人员：模型训练和实验需求',
                '数据科学家：数据标注和分析需求',
                '算法工程师：模型部署和优化需求',
                '学生群体：学习和实践AI技术'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <Card title="核心功能模块">
        <Collapse defaultActiveKey={['1']}>
          <Panel header="智算资源管理" key="1">
            <div className="space-y-4">
              <div>
                <Title level={5}>多厂商算力支持</Title>
                <Space wrap>
                  <Tag color="blue">华为昇腾</Tag>
                  <Tag color="green">天数智芯</Tag>
                  <Tag color="orange">中科海光</Tag>
                  <Tag color="purple">英伟达</Tag>
                  <Tag color="red">AMD</Tag>
                </Space>
                <Paragraph>支持多种厂商异构算力卡，避免供应商锁定，降低硬件采购成本</Paragraph>
              </div>
              <div>
                <Title level={5}>算力池化管理</Title>
                <Paragraph>将CPU、GPU、NPU等异构资源统一纳管，实现动态分配，提高资源利用率</Paragraph>
              </div>
              <div>
                <Title level={5}>多租户资源隔离</Title>
                <Paragraph>支持租户级和项目级资源隔离，提供配额管理，保障数据安全</Paragraph>
              </div>
            </div>
          </Panel>
          
          <Panel header="数据管理与标注" key="2">
            <div className="space-y-4">
              <div>
                <Title level={5}>多模态数据支持</Title>
                <Space wrap>
                  <Tag color="blue">图像</Tag>
                  <Tag color="green">文本</Tag>
                  <Tag color="orange">视频</Tag>
                  <Tag color="purple">音频</Tag>
                  <Tag color="red">点云</Tag>
                </Space>
                <Paragraph>支持多种数据类型的统一管理，满足不同AI应用场景的数据需求</Paragraph>
              </div>
              <div>
                <Title level={5}>智能标注工具</Title>
                <Paragraph>提供专业标注工具，支持智能预标注，提高标注效率，降低人工成本</Paragraph>
              </div>
              <div>
                <Title level={5}>团队协作标注</Title>
                <Paragraph>支持团队和众包标注模式，提供审核验收流程，提高标注质量</Paragraph>
              </div>
            </div>
          </Panel>
          
          <Panel header="模型训练与部署" key="3">
            <div className="space-y-4">
              <div>
                <Title level={5}>零代码模型微调</Title>
                <Space wrap>
                  <Tag color="blue">GLM</Tag>
                  <Tag color="green">百川</Tag>
                  <Tag color="orange">千问</Tag>
                  <Tag color="purple">LLAMA</Tag>
                </Space>
                <Paragraph>支持主流开源大模型的零代码微调，降低AI应用开发门槛</Paragraph>
              </div>
              <div>
                <Title level={5}>分布式训练支持</Title>
                <Paragraph>支持多机多卡分布式训练，支持断点续训，提高训练效率</Paragraph>
              </div>
              <div>
                <Title level={5}>模型推理加速</Title>
                <Paragraph>支持VLLM、TensorRT等推理加速框架，提高模型服务性能</Paragraph>
              </div>
            </div>
          </Panel>
          
          <Panel header="智能体开发" key="4">
            <div className="space-y-4">
              <div>
                <Title level={5}>可视化智能体构建</Title>
                <Paragraph>提供低代码/零代码的智能体开发环境，降低Agent应用开发门槛</Paragraph>
              </div>
              <div>
                <Title level={5}>插件生态管理</Title>
                <Paragraph>支持第三方插件开发和管理，构建开放生态，扩展平台能力</Paragraph>
              </div>
              <div>
                <Title level={5}>多模态交互支持</Title>
                <Paragraph>支持文本、语音、图像等多模态交互方式，提升用户体验</Paragraph>
              </div>
            </div>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );

  const renderArchitecture = () => (
    <div className="space-y-6">
      <Card title="系统架构">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Title level={4}>技术栈</Title>
            <div className="space-y-3">
              <div>
                <Text strong>前端技术：</Text>
                <Space wrap>
                  <Tag color="blue">React</Tag>
                  <Tag color="green">Next.js</Tag>
                  <Tag color="orange">TypeScript</Tag>
                  <Tag color="purple">Ant Design</Tag>
                </Space>
              </div>
              <div>
                <Text strong>后端技术：</Text>
                <Space wrap>
                  <Tag color="blue">Spring Boot</Tag>
                  <Tag color="green">Spring Cloud</Tag>
                  <Tag color="orange">MyBatis</Tag>
                  <Tag color="purple">MySQL</Tag>
                </Space>
              </div>
              <div>
                <Text strong>AI框架：</Text>
                <Space wrap>
                  <Tag color="blue">PyTorch</Tag>
                  <Tag color="green">TensorFlow</Tag>
                  <Tag color="orange">Hugging Face</Tag>
                  <Tag color="purple">VLLM</Tag>
                </Space>
              </div>
            </div>
          </div>
          
          <div>
            <Title level={4}>微服务架构</Title>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-600" />
                <Text>数据采集服务 (data-collect)</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-green-600" />
                <Text>数据标注服务 (data-annotation)</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-orange-600" />
                <Text>数据增强服务 (data-augment)</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-purple-600" />
                <Text>数据处理服务 (data-process)</Text>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-red-600" />
                <Text>数据评估服务 (data-evaluation)</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-indigo-600" />
                <Text>数据导出服务 (data-export)</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="部署架构">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card size="small" title="负载均衡层" className="text-center">
            <Server className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <Text>Nginx / Gateway</Text>
          </Card>
          <Card size="small" title="应用服务层" className="text-center">
            <Rocket className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <Text>微服务集群</Text>
          </Card>
          <Card size="small" title="数据存储层" className="text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <Text>MySQL / Redis</Text>
          </Card>
        </div>
      </Card>
    </div>
  );

  const renderGuide = () => (
    <div className="space-y-6">
      <Card title="快速开始">
        <Steps
          direction="vertical"
          current={0}
          items={[
            {
              title: '注册账号',
              description: '创建平台账号，选择适合的套餐',
              icon: <User className="w-4 h-4" />,
            },
            {
              title: '配置环境',
              description: '设置开发环境，连接数据源',
              icon: <Settings className="w-4 h-4" />,
            },
            {
              title: '上传数据',
              description: '上传需要处理的数据集',
              icon: <Upload className="w-4 h-4" />,
            },
            {
              title: '开始标注',
              description: '使用标注工具进行数据标注',
              icon: <Edit className="w-4 h-4" />,
            },
            {
              title: '训练模型',
              description: '配置训练参数，开始模型训练',
              icon: <Bot className="w-4 h-4" />,
            },
            {
              title: '部署服务',
              description: '将训练好的模型部署为API服务',
              icon: <Rocket className="w-4 h-4" />,
            },
          ]}
        />
      </Card>

      <Card title="使用教程">
        <Collapse>
          <Panel header="数据采集教程" key="1">
            <div className="space-y-4">
              <Paragraph>
                1. 登录平台后，进入"数据采集"模块
              </Paragraph>
              <Paragraph>
                2. 点击"新建采集任务"，选择数据源类型
              </Paragraph>
              <Paragraph>
                3. 配置采集参数，设置采集规则
              </Paragraph>
              <Paragraph>
                4. 启动采集任务，监控采集进度
              </Paragraph>
            </div>
          </Panel>
          
          <Panel header="数据标注教程" key="2">
            <div className="space-y-4">
              <Paragraph>
                1. 在"数据标注"模块中，选择要标注的数据集
              </Paragraph>
              <Paragraph>
                2. 选择合适的标注工具（图像、文本、音频等）
              </Paragraph>
              <Paragraph>
                3. 按照标注规范进行数据标注
              </Paragraph>
              <Paragraph>
                4. 提交标注结果，等待审核验收
              </Paragraph>
            </div>
          </Panel>
          
          <Panel header="模型训练教程" key="3">
            <div className="space-y-4">
              <Paragraph>
                1. 进入"模型训练"模块，选择训练框架
              </Paragraph>
              <Paragraph>
                2. 上传标注好的数据集
              </Paragraph>
              <Paragraph>
                3. 配置模型参数和训练超参数
              </Paragraph>
              <Paragraph>
                4. 启动训练任务，监控训练进度
              </Paragraph>
            </div>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <Card title="API接口文档">
        <Alert
          message="API基础信息"
          description="所有API接口都遵循RESTful设计规范，使用JSON格式进行数据交换"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <div className="space-y-4">
          <div>
            <Title level={4}>认证方式</Title>
            <Paragraph>
              使用Bearer Token进行身份认证，在请求头中添加：
              <Text code>Authorization: Bearer {`<your-token>`}</Text>
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>基础URL</Title>
            <Paragraph>
              <Text code>https://api.qingai.com/v1</Text>
            </Paragraph>
          </div>
          
          <div>
            <Title level={4}>常用接口</Title>
            <div className="space-y-2">
              <div className="border rounded p-3">
                <Text strong>GET /datasets</Text>
                <br />
                <Text type="secondary">获取数据集列表</Text>
              </div>
              <div className="border rounded p-3">
                <Text strong>POST /datasets</Text>
                <br />
                <Text type="secondary">创建新数据集</Text>
              </div>
              <div className="border rounded p-3">
                <Text strong>GET /models</Text>
                <br />
                <Text type="secondary">获取模型列表</Text>
              </div>
              <div className="border rounded p-3">
                <Text strong>POST /models/train</Text>
                <br />
                <Text type="secondary">启动模型训练</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDeployment = () => (
    <div className="space-y-6">
      <Card title="部署说明">
        <div className="space-y-6">
          <div>
            <Title level={4}>系统要求</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Title level={5}>硬件要求</Title>
                <List
                  size="small"
                  dataSource={[
                    'CPU: 8核心以上',
                    '内存: 16GB以上',
                    '存储: 100GB以上SSD',
                    'GPU: 支持CUDA的显卡（可选）'
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </div>
              <div>
                <Title level={5}>软件要求</Title>
                <List
                  size="small"
                  dataSource={[
                    '操作系统: Ubuntu 20.04+ / CentOS 7+',
                    'Docker: 20.10+',
                    'Docker Compose: 2.0+',
                    'Java: OpenJDK 11+'
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Title level={4}>部署步骤</Title>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Title level={5}>1. 环境准备</Title>
                      <Paragraph>安装Docker和Docker Compose，确保网络连接正常</Paragraph>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Title level={5}>2. 下载代码</Title>
                      <Paragraph>克隆项目代码到本地服务器</Paragraph>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Title level={5}>3. 配置环境</Title>
                      <Paragraph>修改配置文件，设置数据库连接等参数</Paragraph>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Title level={5}>4. 启动服务</Title>
                      <Paragraph>使用Docker Compose启动所有服务</Paragraph>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Title level={5}>5. 验证部署</Title>
                      <Paragraph>访问Web界面，验证服务是否正常运行</Paragraph>
                    </div>
                  ),
                },
              ]}
            />
          </div>
          
          <div>
            <Title level={4}>Docker部署</Title>
            <div>暂不支持</div>
            {/* <div className="bg-gray-100 p-4 rounded">
              <Text code className="text-sm">
                {`# 克隆项目
git clone https://github.com/qingai/qing-ai-data.git
cd qing-ai-data

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f`}
              </Text>
            </div> */}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (selectedKey) {
      case 'overview':
        return renderOverview();
      case 'features':
        return renderFeatures();
      case 'architecture':
        return renderArchitecture();
      case 'guide':
        return renderGuide();
      case 'api':
        return renderAPI();
      case 'deployment':
        return renderDeployment();
      default:
        return renderOverview();
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white border-b flex items-center px-6">
        <div className="flex items-center space-x-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <Title level={3} className="mb-0">产品文档</Title>
        </div>
      </Header>
      
      <Layout>
        <Sider width={250} className="bg-white border-r">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            className="h-full border-r-0"
          />
        </Sider>
        
        <Content className="p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductDocsPage; 