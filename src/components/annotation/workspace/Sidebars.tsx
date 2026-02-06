import React from 'react';
import { List, Typography, Card, Form, Input, Select, Tag } from 'antd';
import { FileImageOutlined, FileTextOutlined, AudioOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Annotation } from '@/types/annotation';

const { Text, Title } = Typography;
const { Option } = Select;

// File List Component
export const FileListSidebar: React.FC<{ items: any[], onItemClick: (id: string) => void, activeId: string | null }> = ({ items, onItemClick, activeId }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <Title level={5}>Files</Title>
            </div>
            <div className="flex-1 overflow-y-auto">
                <List
                    dataSource={items}
                    renderItem={item => (
                        <List.Item
                            className={`cursor-pointer hover:bg-gray-100 px-4 py-3 ${activeId === item.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                            onClick={() => onItemClick(item.id)}
                        >
                            <List.Item.Meta
                                avatar={<FileImageOutlined />}
                                title={<Text ellipsis>{item.name}</Text>}
                                description={<Tag color={item.status === 'done' ? 'green' : 'default'}>{item.status}</Tag>}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

// Properties Component
export const PropertiesSidebar: React.FC<{ selectedAnnotation: Annotation | null, onUpdate: (ann: Annotation) => void }> = ({ selectedAnnotation, onUpdate }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (selectedAnnotation) {
            form.setFieldsValue(selectedAnnotation);
        } else {
            form.resetFields();
        }
    }, [selectedAnnotation, form]);

    if (!selectedAnnotation) {
        return (
            <div className="p-4 text-center text-gray-400 mt-10">
                Select an annotation to view properties
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4">
            <Title level={5} className="mb-4">Properties</Title>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(_, allValues) => onUpdate({ ...selectedAnnotation, ...allValues })}
            >
                <Form.Item label="Label" name="label">
                    <Select>
                        <Option value="person">Person</Option>
                        <Option value="car">Car</Option>
                        <Option value="bg">Background</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Confidence" name="confidence">
                    <Input disabled />
                </Form.Item>
                <Form.Item label="Attributes" name="attributes">
                    {/* Dynamic attributes based on label schema would go here */}
                    <Card size="small" title="Vehicle Type">
                        <Select defaultValue="sedan">
                            <Option value="sedan">Sedan</Option>
                            <Option value="suv">SUV</Option>
                            <Option value="truck">Truck</Option>
                        </Select>
                    </Card>
                </Form.Item>
            </Form>
        </div>
    );
};
