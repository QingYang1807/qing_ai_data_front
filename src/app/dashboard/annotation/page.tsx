'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Space, message, Breadcrumb } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { AnnotationTask, AnnotationStats as StatsType, AnnotationType } from '@/types/annotation'; // Assuming types export from there
import AnnotationStats from '@/components/annotation/AnnotationStats';
import AnnotationList from '@/components/annotation/AnnotationList';
import AnnotationForm from '@/components/annotation/AnnotationForm';
import Link from 'next/link';

const { Option } = Select;

// ... imports remain the same

// Mock Data Generation
const generateMockTasks = (count: number): AnnotationTask[] => {
  const types: AnnotationType[] = ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'CODE', '3D'];
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

  return Array.from({ length: count }).map((_, i) => ({
    id: `task-${i + 1}`,
    name: `标注任务 ${i + 1} - ${types[i % types.length]}`,
    description: `这是一个针对 ${types[i % types.length]} 数据的示例标注任务。`,
    type: types[i % types.length],
    status: statuses[i % statuses.length] as any,
    datasetId: `ds-${i % 5}`,
    datasetName: `数据集 ${i % 5}`,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
    progress: Math.floor(Math.random() * 100),
    totalItems: 100 + Math.floor(Math.random() * 1000),
    completedItems: Math.floor(Math.random() * 100),
  }));
};

export default function AnnotationPage() {
  const [tasks, setTasks] = useState<AnnotationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<AnnotationTask | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setTasks(generateMockTasks(12));
      setLoading(false);
    }, 800);
  }, []);

  const stats: StatsType = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    avgAccuracy: 94.5, // Mock value
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchText.toLowerCase()) ||
      task.datasetName.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType ? task.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEdit = (task: AnnotationTask) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleDelete = (task: AnnotationTask) => {
    // Simulate deletion
    message.success(`任务 "${task.name}" 删除成功`);
    setTasks(tasks.filter(t => t.id !== task.id));
  };

  const handleFormSuccess = (values: any) => {
    // Simulate create/update
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...values } : t));
      message.success('任务更新成功');
    } else {
      const newTask: AnnotationTask = {
        id: `task-${Date.now()}`,
        ...values,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        totalItems: 500, // Mock
        completedItems: 0,
        datasetName: '新数据集', // Mock
      };
      setTasks([newTask, ...tasks]);
      message.success('任务创建成功');
    }
    setIsModalVisible(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ title: '仪表盘' }, { title: '数据标注' }]} />

      <div className='flex justify-between items-center'>
        <h1 className="text-2xl font-bold text-gray-800">数据标注任务</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建任务
        </Button>
      </div>

      <AnnotationStats stats={stats} />

      <Card bordered={false} className="shadow-sm">
        <div className="flex justify-between mb-4">
          <Space>
            <Input
              placeholder="搜索任务..."
              prefix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="按类型筛选"
              style={{ width: 150 }}
              allowClear
              onChange={setFilterType}
            >
              <Option value="TEXT">文本</Option>
              <Option value="IMAGE">图像</Option>
              <Option value="AUDIO">音频</Option>
              <Option value="VIDEO">视频</Option>
            </Select>
          </Space>
          <Button icon={<FilterOutlined />}>更多筛选</Button>
        </div>

        <AnnotationList
          tasks={filteredTasks}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <AnnotationForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleFormSuccess}
        initialValues={editingTask || undefined}
      />
    </div>
  );
}
