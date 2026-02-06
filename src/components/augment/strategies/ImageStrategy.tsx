import React from 'react';
import { Form, Select, Slider, Switch, Radio } from 'antd';

const { Option } = Select;

export const ImageStrategy = () => {
    return (
        <>
            <Form.Item
                name={['config', 'method']}
                label="增强方法"
                rules={[{ required: true, message: '请选择增强方法' }]}
            >
                <Select placeholder="请选择增强方法">
                    <Option value="rotation">旋转 (Rotation)</Option>
                    <Option value="crop">裁剪 (Crop)</Option>
                    <Option value="flip">翻转 (Flip)</Option>
                    <Option value="color_jitter">颜色抖动 (Color Jitter)</Option>
                    <Option value="noise">噪声添加 (Noise)</Option>
                    <Option value="blur">模糊 (Blur)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.config?.method !== currentValues.config?.method}
            >
                {({ getFieldValue }) => {
                    const method = getFieldValue(['config', 'method']);

                    if (method === 'rotation') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'degrees']}
                                label="旋转角度范围"
                                initialValue={30}
                            >
                                <Slider min={0} max={180} step={1} marks={{ 0: '0°', 180: '180°' }} />
                            </Form.Item>
                        );
                    }

                    if (method === 'flip') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'type']}
                                label="翻转类型"
                                initialValue="horizontal"
                            >
                                <Radio.Group>
                                    <Radio.Button value="horizontal">水平翻转</Radio.Button>
                                    <Radio.Button value="vertical">垂直翻转</Radio.Button>
                                    <Radio.Button value="both">两者随机</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        );
                    }

                    if (method === 'color_jitter') {
                        return (
                            <>
                                <Form.Item label="亮度" name={['config', 'params', 'brightness']} initialValue={0.2}>
                                    <Slider min={0} max={1} step={0.1} />
                                </Form.Item>
                                <Form.Item label="对比度" name={['config', 'params', 'contrast']} initialValue={0.2}>
                                    <Slider min={0} max={1} step={0.1} />
                                </Form.Item>
                                <Form.Item label="饱和度" name={['config', 'params', 'saturation']} initialValue={0.2}>
                                    <Slider min={0} max={1} step={0.1} />
                                </Form.Item>
                            </>
                        );
                    }

                    return null;
                }}
            </Form.Item>
        </>
    );
};
