import React from 'react';
import { Form, Select, Slider, InputNumber } from 'antd';

const { Option } = Select;

export const VideoStrategy = () => {
    return (
        <>
            <Form.Item
                name={['config', 'method']}
                label="增强方法"
                rules={[{ required: true, message: '请选择增强方法' }]}
            >
                <Select placeholder="请选择增强方法">
                    <Option value="frame_extraction">抽帧 (Frame Extraction)</Option>
                    <Option value="time_warp">时间扭曲 (Time Warp)</Option>
                    <Option value="crop">时空裁剪 (Spatio-temporal Crop)</Option>
                    <Option value="rotation">旋转 (Rotation)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.config?.method !== currentValues.config?.method}
            >
                {({ getFieldValue }) => {
                    const method = getFieldValue(['config', 'method']);

                    if (method === 'frame_extraction') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'fps']}
                                label="目标 FPS"
                                initialValue={15}
                            >
                                <InputNumber min={1} max={60} />
                            </Form.Item>
                        );
                    }
                    if (method === 'time_warp') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'speed']}
                                label="播放速度"
                                initialValue={2.0}
                            >
                                <Slider min={0.5} max={4.0} step={0.5} />
                            </Form.Item>
                        );
                    }

                    if (method === 'crop') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'size']}
                                label="裁剪尺寸 (px)"
                                initialValue={224}
                            >
                                <InputNumber min={32} max={1024} step={32} />
                            </Form.Item>
                        );
                    }

                    return null;
                }}
            </Form.Item>
        </>
    );
};
