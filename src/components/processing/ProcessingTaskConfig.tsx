import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Radio, Divider, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface ProcessingTaskConfigProps {
    taskType: 'cleaning' | 'augmentation' | 'desensitization' | 'synthesis';
}

export default function ProcessingTaskConfig({ taskType }: ProcessingTaskConfigProps) {
    const renderCleaningConfig = () => (
        <>
            <Divider orientation="left">清洗规则配置</Divider>
            <Form.Item name="deduplication" label="去除重复" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.deduplication !== curr.deduplication}
            >
                {({ getFieldValue }) =>
                    getFieldValue('deduplication') && (
                        <Form.Item name="dedupThreshold" label="去重相似度阈值" initialValue={0.95}>
                            <InputNumber min={0.5} max={1.0} step={0.01} style={{ width: 120 }} />
                            <span className="text-gray-400 ml-2">(范围: 0.5 - 1.0)</span>
                        </Form.Item>
                    )
                }
            </Form.Item>

            <Form.Item name="removeOutliers" label="异常值处理" initialValue="mean">
                <Radio.Group>
                    <Radio value="mean">均值填充</Radio>
                    <Radio value="drop">直接删除</Radio>
                    <Radio value="ignore">忽略</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item name="textCleaning" label="文本清洗项" initialValue={['html', 'space']}>
                <Select mode="multiple" placeholder="选择清洗项">
                    <Option value="html">去除HTML标签</Option>
                    <Option value="space">去除由于空白字符</Option>
                    <Option value="emoji">去除Emoji表情</Option>
                    <Option value="url">去除URL链接</Option>
                    <Option value="email">去除Email地址</Option>
                </Select>
            </Form.Item>
        </>
    );

    const renderAugmentationConfig = () => (
        <>
            <Divider orientation="left">增强策略配置</Divider>
            <Form.Item name="expansionRatio" label="扩充倍数" initialValue={2} rules={[{ required: true }]}>
                <InputNumber min={1} max={10} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="methods" label="增强方法" initialValue={['synonym']} rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="选择增强方法">
                    <Option value="synonym">同义词替换</Option>
                    <Option value="backtrans">回译 (中-英-中)</Option>
                    <Option value="random_delete">随机删除</Option>
                    <Option value="random_swap">随机交换</Option>
                    <Option value="mask_fill">Mask填充 (BERT)</Option>
                </Select>
            </Form.Item>

            <Form.Item name="keepLabel" label="保持标签一致" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
        </>
    );

    const renderDesensitizationConfig = () => (
        <>
            <Divider orientation="left">隐私脱敏规则</Divider>
            <Form.Item name="rules" label="脱敏字段" initialValue={['phone', 'id_card']} rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="选择需要脱敏的字段">
                    <Option value="phone">手机号</Option>
                    <Option value="id_card">身份证号</Option>
                    <Option value="email">邮箱地址</Option>
                    <Option value="name">姓名</Option>
                    <Option value="bank_card">银行卡号</Option>
                    <Option value="address">家庭住址</Option>
                </Select>
            </Form.Item>

            <Form.Item name="method" label="脱敏方式" initialValue="mask">
                <Radio.Group>
                    <Radio value="mask">掩码 (如: 138****0000)</Radio>
                    <Radio value="encrypt">加密 (AES/MD5)</Radio>
                    <Radio value="replace">仿真替换</Radio>
                </Radio.Group>
            </Form.Item>
        </>
    );

    const renderSynthesisConfig = () => (
        <>
            <Divider orientation="left">数据合成参数</Divider>
            <Form.Item name="model" label="基座模型" initialValue="qwen-turbo" rules={[{ required: true }]}>
                <Select>
                    <Option value="qwen-turbo">Qwen-Turbo</Option>
                    <Option value="qwen-plus">Qwen-Plus</Option>
                    <Option value="glm-4">GLM-4</Option>
                    <Option value="deepseek-v2">DeepSeek-V2</Option>
                </Select>
            </Form.Item>

            <Form.Item name="topic" label="合成主题" rules={[{ required: true }]}>
                <Input placeholder="例如：医疗问诊、法律咨询、电商客服" />
            </Form.Item>

            <Form.Item name="count" label="生成数量" initialValue={100}>
                <InputNumber min={1} step={10} style={{ width: 120 }} />
            </Form.Item>

            <Form.Item name="prompt" label="系统提示词(System Prompt)">
                <TextArea rows={4} placeholder="定义AI的角色和生成规则..." />
            </Form.Item>
        </>
    );

    const configMap = {
        cleaning: renderCleaningConfig,
        augmentation: renderAugmentationConfig,
        desensitization: renderDesensitizationConfig,
        synthesis: renderSynthesisConfig,
    };

    return (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            {configMap[taskType]()}
        </div>
    );
}
