import React, { useEffect } from 'react';
import { Form, Input, Select, Modal, InputNumber } from 'antd';
import { AugmentationTask, AUGMENTATION_TYPES, AugmentationType } from '@/types/augment';
import { TextStrategy } from './strategies/TextStrategy';
import { ImageStrategy } from './strategies/ImageStrategy';
import { AudioStrategy } from './strategies/AudioStrategy';
import { VideoStrategy } from './strategies/VideoStrategy';
import { CodeStrategy } from './strategies/CodeStrategy';
import { MultimodalStrategy } from './strategies/MultimodalStrategy';

const { Option } = Select;

interface AugmentationFormProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: (values: Partial<AugmentationTask>) => void;
    initialValues?: Partial<AugmentationTask> | null;
}

export const AugmentationForm: React.FC<AugmentationFormProps> = ({
    open,
    onCancel,
    onSuccess,
    initialValues,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSuccess(values);
        });
    };

    const renderStrategy = (type: AugmentationType) => {
        switch (type) {
            case 'text':
                return <TextStrategy />;
            case 'image':
                return <ImageStrategy />;
            case 'audio':
                return <AudioStrategy />;
            case 'video':
                return <VideoStrategy />;
            case 'code':
                return <CodeStrategy />;
            case 'multimodal':
                return <MultimodalStrategy />;
            default:
                return null;
        }
    };

    return (
        <Modal
            title={initialValues ? '编辑增强任务' : '新建增强任务'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            width={600}
            className="glass-modal"
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
                    label="数据类型"
                    rules={[{ required: true, message: '请选择数据类型' }]}
                >
                    <Select placeholder="请选择数据类型" disabled={!!initialValues}>
                        {AUGMENTATION_TYPES.map((type) => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
                >
                    {({ getFieldValue }) => {
                        const type = getFieldValue('type');
                        return type ? (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-4">增强策略配置</h4>
                                {renderStrategy(type)}
                            </div>
                        ) : null;
                    }}
                </Form.Item>

                <Form.Item
                    name="dataSourceId"
                    label="数据源"
                    rules={[{ required: true, message: '请选择数据源' }]}
                >
                    <Select placeholder="请选择数据源">
                        <Option value="ds1">示例数据源 1</Option>
                        <Option value="ds2">示例数据源 2</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="multiplier"
                    label="增强倍数"
                    initialValue={1}
                    rules={[{ required: true, message: '请输入增强倍数' }]}
                >
                    <InputNumber min={1} max={100} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
