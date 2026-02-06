import React from 'react';
import { Form, Select, InputNumber, Switch, Slider } from 'antd';

const { Option } = Select;

export const TextStrategy = () => {
    return (
        <>
            <Form.Item
                name={['config', 'method']}
                label="增强方法"
                rules={[{ required: true, message: '请选择增强方法' }]}
            >
                <Select placeholder="请选择增强方法">
                    <Option value="synonym">同义词替换 (Synonym Replacement)</Option>
                    <Option value="back_translation">回译增强 (Back Translation)</Option>
                    <Option value="random_insertion">随机插入 (Random Insertion)</Option>
                    <Option value="random_swap">随机交换 (Random Swap)</Option>
                    <Option value="random_deletion">随机删除 (Random Deletion)</Option>
                    <Option value="noise_injection">噪声注入 (Noise Injection)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.config?.method !== currentValues.config?.method}
            >
                {({ getFieldValue }) => {
                    const method = getFieldValue(['config', 'method']);

                    if (method === 'synonym') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'rate']}
                                label="替换率"
                                initialValue={0.1}
                            >
                                <Slider min={0} max={1} step={0.1} marks={{ 0: '0%', 1: '100%' }} />
                            </Form.Item>
                        );
                    }

                    if (method === 'back_translation') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'languages']}
                                label="中间语言"
                                initialValue={['en']}
                            >
                                <Select mode="multiple" placeholder="选择中间语言">
                                    <Option value="en">英语</Option>
                                    <Option value="fr">法语</Option>
                                    <Option value="de">德语</Option>
                                    <Option value="ja">日语</Option>
                                </Select>
                            </Form.Item>
                        );
                    }

                    if (['random_insertion', 'random_swap', 'random_deletion'].includes(method)) {
                        return (
                            <Form.Item
                                name={['config', 'params', 'rate']}
                                label="操作概率"
                                initialValue={0.1}
                            >
                                <Slider min={0} max={1} step={0.1} marks={{ 0: '0%', 1: '100%' }} />
                            </Form.Item>
                        );
                    }

                    return null;
                }}
            </Form.Item>
        </>
    );
};
