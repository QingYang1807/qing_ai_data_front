import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, FormOutlined, ClockCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { AnnotationStats as StatsType } from '@/types/annotation';

interface Props {
    stats: StatsType;
}

const AnnotationStats: React.FC<Props> = ({ stats }) => {
    return (
        <Row gutter={16} className="mb-6">
            <Col span={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="总任务数"
                        value={stats.total}
                        prefix={<FormOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="进行中"
                        value={stats.inProgress}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="已完成"
                        value={stats.completed}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                    <Statistic
                        title="平均准确率"
                        value={stats.avgAccuracy}
                        precision={1}
                        suffix="%"
                        prefix={<LineChartOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default AnnotationStats;
