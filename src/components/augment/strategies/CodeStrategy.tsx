import React from 'react';
import { Form, Select, Slider } from 'antd';

const { Option } = Select;

export const CodeStrategy = () => {
    return (
        <>
            <Form.Item
                name={['config', 'method']}
                label="增强方法"
                rules={[{ required: true, message: '请选择增强方法' }]}
            >
                <Select placeholder="请选择增强方法">
                    <Option value="variable_rename">变量重命名 (Variable Renaming)</Option>
                    <Option value="comment_deletion">注释删除 (Comment Deletion)</Option>
                    <Option value="dead_code_insertion">死代码插入 (Dead Code Insertion)</Option>
                    <Option value="loop_exchange">循环结构变换 (Loop Exchange)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.config?.method !== currentValues.config?.method}
            >
                {({ getFieldValue }) => {
                    const method = getFieldValue(['config', 'method']);

                    if (method === 'variable_rename') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'rate']}
                                label="重命名比例"
                                initialValue={0.3}
                            >
                                <Slider min={0} max={1} step={0.1} />
                            </Form.Item>
                        );
                    }

                    if (method === 'dead_code_insertion') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'rate']}
                                label="插入比例"
                                initialValue={0.1}
                            >
                                <Slider min={0} max={0.5} step={0.05} />
                            </Form.Item>
                        );
                    }

                    return null;
                }}
            </Form.Item>
        </>
    );
};
