import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { AnnotationTask, AnnotationType } from '@/types/annotation';

const { Option } = Select;
const { TextArea } = Input;

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSuccess: (values: any) => void;
    initialValues?: Partial<AnnotationTask>;
}

const AnnotationForm: React.FC<Props> = ({ visible, onCancel, onSuccess, initialValues }) => {
    const [form] = Form.useForm();

    // Reset form when initialValues change or modal interacts
    React.useEffect(() => {
        if (visible) {
            form.resetFields();
            if (initialValues) {
                form.setFieldsValue(initialValues);
            }
        }
    }, [visible, initialValues, form]);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                onSuccess(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            open={visible}
            title={initialValues?.id ? "编辑标注任务" : "创建新标注任务"}
            okText={initialValues?.id ? "更新" : "创建"}
            cancelText="取消"
            onCancel={onCancel}
            onOk={handleOk}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                name="annotation_task_form"
                initialValues={{ type: 'TEXT', status: 'PENDING' }}
            >
                <Form.Item
                    name="name"
                    label="任务名称"
                    rules={[{ required: true, message: '请输入任务名称！' }]}
                >
                    <Input placeholder="例如：2024年交通标志检测" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="描述"
                >
                    <TextArea rows={3} placeholder="描述标注指南或目的..." />
                </Form.Item>

                <Form.Item
                    name="datasetId"
                    label="源数据集"
                    rules={[{ required: true, message: '请选择数据集！' }]}
                >
                    {/* In a real app, this would be fetched from API */}
                    <Select placeholder="选择要标注的数据集">
                        <Option value="ds-001">街景图像 v1</Option>
                        <Option value="ds-002">客户评论 JSON</Option>
                        <Option value="ds-003">呼叫中心音频日志</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="type"
                    label="标注类型"
                    rules={[{ required: true, message: '请选择标注类型！' }]}
                >
                    <Select placeholder="选择类型">
                        <Option value="TEXT">文本标注 (分类/NER)</Option>
                        <Option value="IMAGE">图像标注 (边界框/多边形)</Option>
                        <Option value="AUDIO">音频标注</Option>
                        <Option value="VIDEO">视频标注</Option>
                        <Option value="CODE">代码标注</Option>
                        <Option value="3D">3D 点云</Option>
                    </Select>
                </Form.Item>

                {/* Potentially add more dynamic fields based on Type selection */}

            </Form>
        </Modal>
    );
};

export default AnnotationForm;
