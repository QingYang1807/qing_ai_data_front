import React from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface Props {
    children: React.ReactNode;
    sidebarLeft: React.ReactNode;
    sidebarRight: React.ReactNode;
    title: string;
    onSave: () => void;
}

const WorkspaceLayout: React.FC<Props> = ({ children, sidebarLeft, sidebarRight, title, onSave }) => {
    const router = useRouter();

    return (
        <Layout className="h-screen overflow-hidden">
            <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between h-14">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} type="text" />
                    <Title level={5} style={{ margin: 0 }}>{title}</Title>
                </Space>

                <Space>
                    <Text type="secondary">Item 12 / 100</Text>
                    <Button icon={<LeftOutlined />} />
                    <Button icon={<RightOutlined />} />
                    <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>Save & Next</Button>
                </Space>
            </Header>

            <Layout>
                <Sider width={250} theme="light" className="border-r border-gray-200">
                    {sidebarLeft}
                </Sider>

                <Content className="bg-gray-100 p-4 relative overflow-auto flex items-center justify-center">
                    {children}
                </Content>

                <Sider width={300} theme="light" className="border-l border-gray-200">
                    {sidebarRight}
                </Sider>
            </Layout>
        </Layout>
    );
};

export default WorkspaceLayout;
