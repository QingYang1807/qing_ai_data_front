import React from 'react';
import { Button, Tooltip, Space } from 'antd';
import {
    DragOutlined,
    BorderOutlined,
    GatewayOutlined, // Polygon substitute
    FontSizeOutlined,
    ScissorOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons';
import { AnnotationType } from '@/types/annotation';

interface Props {
    type: AnnotationType;
    selectedTool: string;
    onSelectTool: (tool: string) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const Toolbar: React.FC<Props> = ({ type, selectedTool, onSelectTool, onZoomIn, onZoomOut }) => {
    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 flex space-x-2 z-10">
            <Space>
                {/* Common Tools */}
                <Tooltip title="Select / Move">
                    <Button
                        type={selectedTool === 'select' ? 'primary' : 'default'}
                        icon={<DragOutlined />}
                        onClick={() => onSelectTool('select')}
                    />
                </Tooltip>

                <div className="w-px h-6 bg-gray-300 mx-2" />

                {/* Type Specific Tools */}
                {type === 'IMAGE' && (
                    <>
                        <Tooltip title="Rectangle Box">
                            <Button
                                type={selectedTool === 'bbox' ? 'primary' : 'default'}
                                icon={<BorderOutlined />}
                                onClick={() => onSelectTool('bbox')}
                            />
                        </Tooltip>
                        <Tooltip title="Polygon">
                            <Button
                                type={selectedTool === 'polygon' ? 'primary' : 'default'}
                                icon={<GatewayOutlined />}
                                onClick={() => onSelectTool('polygon')}
                            />
                        </Tooltip>
                    </>
                )}

                {type === 'TEXT' && (
                    <>
                        <Tooltip title="Entity Selection">
                            <Button
                                type={selectedTool === 'entity' ? 'primary' : 'default'}
                                icon={<FontSizeOutlined />}
                                onClick={() => onSelectTool('entity')}
                            />
                        </Tooltip>
                    </>
                )}

                <div className="w-px h-6 bg-gray-300 mx-2" />

                <Tooltip title="Zoom In">
                    <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
                </Tooltip>
                <Tooltip title="Zoom Out">
                    <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
                </Tooltip>

            </Space>
        </div>
    );
};

export default Toolbar;
