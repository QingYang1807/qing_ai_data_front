import React from 'react';
import { Form, Select, Slider } from 'antd';

const { Option } = Select;

export const AudioStrategy = () => {
    return (
        <>
            <Form.Item
                name={['config', 'method']}
                label="增强方法"
                rules={[{ required: true, message: '请选择增强方法' }]}
            >
                <Select placeholder="请选择增强方法">
                    <Option value="speed">变速 (Time Stretch)</Option>
                    <Option value="pitch">变调 (Pitch Shift)</Option>
                    <Option value="noise">背景噪声 (Background Noise)</Option>
                    <Option value="reverb">混响 (Reverb)</Option>
                    <Option value="time_shift">时间偏移 (Time Shift)</Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.config?.method !== currentValues.config?.method}
            >
                {({ getFieldValue }) => {
                    const method = getFieldValue(['config', 'method']);

                    if (method === 'speed') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'rate']}
                                label="速率调整范围"
                                initialValue={[0.8, 1.2]}
                            >
                                <Slider range min={0.5} max={2.0} step={0.1} />
                            </Form.Item>
                        );
                    }

                    if (method === 'pitch') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'steps']}
                                label="变调步数范围"
                                initialValue={[-2, 2]}
                            >
                                <Slider range min={-12} max={12} step={1} />
                            </Form.Item>
                        );
                    }

                    if (method === 'noise') {
                        return (
                            <Form.Item
                                name={['config', 'params', 'snr']}
                                label="信噪比 (SNR)"
                                initialValue={15}
                            >
                                <Slider min={0} max={30} step={1} marks={{ 0: '0dB', 30: '30dB' }} />
                            </Form.Item>
                        );
                    }

                    return null;
                }}
            </Form.Item>
        </>
    );
};
