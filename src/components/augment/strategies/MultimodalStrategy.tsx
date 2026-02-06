import React from 'react';
import { Form, Select, Input } from 'antd';

const { Option } = Select;

export const MultimodalStrategy = () => {
    return (
        <>
            <Form.Item
                name={['config', 'method']}
                label="增强方法"
                rules={[{ required: true, message: '请选择增强方法' }]}
            >
                <Select placeholder="请选择增强方法">
                    <Option value="image_captioning">图像描述生成 (Image Captioning)</Option>
                    <Option value="text_to_image">文本生成图像 (Text to Image)</Option>
                    <Option value="cross_modal_translation">跨模态翻译 (Cross-modal Translation)</Option>
                    <Option value="vqa_generation">VQA问答生成 (VQA Generation)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.config?.method !== currentValues.config?.method}
            >
                {({ getFieldValue }) => {
                    const method = getFieldValue(['config', 'method']);

                    if (method === 'image_captioning') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'model']}
                                label="生成模型"
                                initialValue="blip-2"
                            >
                                <Select>
                                    <Option value="blip-2">BLIP-2</Option>
                                    <Option value="git">GIT</Option>
                                    <Option value="clip">CLIP-Ranking</Option>
                                </Select>
                            </Form.Item>
                        );
                    }

                    if (method === 'text_to_image') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'model']}
                                label="生成模型"
                                initialValue="stable-diffusion-xl"
                            >
                                <Select>
                                    <Option value="stable-diffusion-xl">Stable Diffusion XL</Option>
                                    <Option value="dall-e-3">DALL-E 3</Option>
                                    <Option value="kandinsky">Kandinsky</Option>
                                </Select>
                            </Form.Item>
                        );
                    }

                    return null;
                }}
            </Form.Item>
        </>
    );
};
