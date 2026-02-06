'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Progress, message, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EyeOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { synthesisApi } from '@/api/synthesis';
import {
  SynthesisTask,
  SynthesisType,
  SynthesisMethod,
  SynthesisStatus,
  SynthesisResult
} from '@/types/synthesis';

const { Option } = Select;

export default function SynthesisPage() {
  const [tasks, setTasks] = useState<SynthesisTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SynthesisResult | null>(null);
  const [form] = Form.useForm();

  // 加载任务列表
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await synthesisApi.listTasks();
      setTasks(data);
    } catch (error) {
      message.error('加载任务列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // 定时刷新任务状态
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  // 方法映射
  const methodsByType: Record<SynthesisType, SynthesisMethod[]> = {
    [SynthesisType.LLM]: [
      SynthesisMethod.QA_GENERATION,
      SynthesisMethod.COT_GENERATION,
      SynthesisMethod.FEW_SHOT
    ],
    [SynthesisType.FINANCIAL]: [
      SynthesisMethod.FINANCIAL_CALCULATION,
      SynthesisMethod.MARKET_SIMULATION
    ],
    [SynthesisType.CODE]: [
      SynthesisMethod.QUANT_STRATEGY,
      SynthesisMethod.SQL_GENERATION
    ],
    [SynthesisType.KG]: [
      SynthesisMethod.GRAPH_TRAVERSAL,
      SynthesisMethod.ENTITY_RELATION
    ],
    [SynthesisType.MULTIMODAL]: []
  };

  const [availableMethods, setAvailableMethods] = useState<SynthesisMethod[]>([]);

  const handleTypeChange = (type: SynthesisType) => {
    setAvailableMethods(methodsByType[type] || []);
    form.setFieldsValue({ method: undefined });
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => method.replace(/_/g, ' ').toUpperCase(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: SynthesisStatus) => {
        const colorMap = {
          [SynthesisStatus.RUNNING]: 'processing',
          [SynthesisStatus.COMPLETED]: 'success',
          [SynthesisStatus.FAILED]: 'error',
          [SynthesisStatus.PENDING]: 'default',
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: '主题',
      dataIndex: ['config', 'topic'],
      key: 'topic',
    },
    {
      title: '生成数量',
      dataIndex: 'result_count',
      key: 'result_count',
      render: (count: number, record: SynthesisTask) => (
        <span>{count} / {record.config.num_samples}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SynthesisTask) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewResult(record.id)}
            disabled={record.status !== SynthesisStatus.COMPLETED}
          >
            查看结果
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewResult = async (taskId: string) => {
    try {
      const result = await synthesisApi.getTaskResult(taskId);
      setSelectedResult(result);
      setIsResultModalVisible(true);
    } catch (error) {
      message.error('获取任务结果失败');
    }
  };

  const handleDelete = (taskId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该合成任务吗？',
      onOk() {
        message.info('删除功能待实现');
      },
    });
  };

  const handleCreate = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const request = {
        name: values.name,
        type: values.type as SynthesisType,
        method: values.method as SynthesisMethod,
        config: {
          topic: values.topic,
          num_samples: parseInt(values.num_samples),
          difficulty: values.difficulty || 'medium',
          model: values.model || 'gpt-3.5-turbo',
          extra_params: {}
        }
      };

      await synthesisApi.createTask(request);
      message.success('任务创建成功');
      setIsModalVisible(false);
      form.resetFields();
      loadTasks();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error('创建任务失败: ' + (error.message || '未知错误'));
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 统计数据
  const stats = {
    total: tasks.length,
    running: tasks.filter(t => t.status === SynthesisStatus.RUNNING).length,
    completed: tasks.filter(t => t.status === SynthesisStatus.COMPLETED).length,
    failed: tasks.filter(t => t.status === SynthesisStatus.FAILED).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="总任务数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="运行中" value={stats.running} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="失败" value={stats.failed} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card
        title="数据合成管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadTasks}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建合成任务
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="新建合成任务"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="合成类型"
            rules={[{ required: true, message: '请选择合成类型' }]}
          >
            <Select placeholder="请选择合成类型" onChange={handleTypeChange}>
              <Option value={SynthesisType.LLM}>LLM 数据合成</Option>
              <Option value={SynthesisType.FINANCIAL}>金融推理数据</Option>
              <Option value={SynthesisType.CODE}>代码数据合成</Option>
              <Option value={SynthesisType.KG}>知识图谱生成</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="method"
            label="合成方法"
            rules={[{ required: true, message: '请选择合成方法' }]}
          >
            <Select placeholder="请先选择合成类型" disabled={availableMethods.length === 0}>
              {availableMethods.map(method => (
                <Option key={method} value={method}>
                  {method.replace(/_/g, ' ').toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="topic"
            label="合成主题"
            rules={[{ required: true, message: '请输入合成主题' }]}
          >
            <Input placeholder="例如: Python基础、CFA财务管理、量化策略等" />
          </Form.Item>

          <Form.Item
            name="num_samples"
            label="目标数量"
            rules={[{ required: true, message: '请输入目标数量' }]}
            initialValue={5}
          >
            <Input type="number" placeholder="请输入目标数量" min={1} max={100} />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度级别"
            initialValue="medium"
          >
            <Select>
              <Option value="easy">简单</Option>
              <Option value="medium">中等</Option>
              <Option value="hard">困难</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="model"
            label="LLM模型"
            initialValue="gpt-3.5-turbo"
          >
            <Select>
              <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
              <Option value="gpt-4">GPT-4</Option>
              <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="合成结果"
        open={isResultModalVisible}
        onCancel={() => setIsResultModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsResultModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedResult && (
          <div>
            <p><strong>任务ID:</strong> {selectedResult.task_id}</p>
            <p><strong>生成数量:</strong> {selectedResult.data.length} 条</p>
            {selectedResult.quality_score !== undefined && selectedResult.quality_score !== null && (
              <p><strong>质量评分:</strong> {(selectedResult.quality_score * 100).toFixed(1)}%</p>
            )}
            <div className="mt-4">
              <h4>生成数据:</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(selectedResult.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
