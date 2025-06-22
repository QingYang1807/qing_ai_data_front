'use client';

import React, { useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Space,
  message 
} from 'antd';
import { DataSourceType, DataSource, DataSourceCreateRequest } from '@/types';
import { useDataSourceStore } from '@/stores/useDataSourceStore';

interface DataSourceFormProps {
  visible: boolean;
  onCancel: () => void;
  editingDataSource?: DataSource | null;
}

const { TextArea } = Input;
const { Option } = Select;

export default function DataSourceForm({ 
  visible, 
  onCancel, 
  editingDataSource 
}: DataSourceFormProps) {
  const [form] = Form.useForm();
  const { createDataSource, updateDataSource, loading, testConnection } = useDataSourceStore();

  useEffect(() => {
    if (visible) {
      if (editingDataSource) {
        form.setFieldsValue({
          ...editingDataSource,
          password: '', // 不显示密码
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingDataSource, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingDataSource) {
        await updateDataSource(editingDataSource.id, values);
        message.success('数据源更新成功');
      } else {
        await createDataSource(values);
        message.success('数据源创建成功');
      }
      
      onCancel();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields();
      
      // 如果是编辑模式且有ID，使用现有数据源测试
      if (editingDataSource?.id) {
        const success = await testConnection(editingDataSource.id);
        if (success) {
          message.success('连接测试成功');
        } else {
          message.error('连接测试失败');
        }
      } else {
        // 新建模式下，可以考虑创建临时数据源进行测试
        message.info('请先保存数据源后再测试连接');
      }
    } catch (error) {
      message.error('请完善表单信息');
    }
  };

  const getDefaultPort = (type: DataSourceType): number => {
    const portMap = {
      [DataSourceType.MYSQL]: 3306,
      [DataSourceType.POSTGRESQL]: 5432,
      [DataSourceType.ORACLE]: 1521,
      [DataSourceType.HIVE]: 10000,
      [DataSourceType.FTP]: 21,
      [DataSourceType.SFTP]: 22,
      [DataSourceType.KAFKA]: 9092,
      [DataSourceType.HDFS]: 9000,
    };
    return portMap[type] || 3306;
  };

  const handleTypeChange = (type: DataSourceType) => {
    form.setFieldValue('port', getDefaultPort(type));
  };

  const needsDatabase = (type: DataSourceType): boolean => {
    return [
      DataSourceType.MYSQL,
      DataSourceType.POSTGRESQL,
      DataSourceType.ORACLE,
      DataSourceType.HIVE
    ].includes(type);
  };

  const watchedType = Form.useWatch('type', form);

  return (
    <Modal
      title={editingDataSource ? '编辑数据源' : '新建数据源'}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          {editingDataSource && (
            <Button onClick={handleTestConnection} loading={loading}>
              测试连接
            </Button>
          )}
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {editingDataSource ? '更新' : '创建'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: DataSourceType.MYSQL,
          port: 3306,
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
          label="数据源类型"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Select placeholder="请选择数据源类型" onChange={handleTypeChange}>
            {Object.values(DataSourceType).map(type => (
              <Option key={type} value={type}>
                {type}
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
          label="端口"
          rules={[{ required: true, message: '请输入端口' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入端口"
            min={1}
            max={65535}
          />
        </Form.Item>

        {needsDatabase(watchedType) && (
          <Form.Item
            name="database"
            label="数据库名"
            rules={[{ required: true, message: '请输入数据库名' }]}
          >
            <Input placeholder="请输入数据库名" />
          </Form.Item>
        )}

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
          rules={[{ required: !editingDataSource, message: '请输入密码' }]}
        >
          <Input.Password placeholder={editingDataSource ? '留空则不修改密码' : '请输入密码'} />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea
            rows={3}
            placeholder="请输入数据源描述"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
} 