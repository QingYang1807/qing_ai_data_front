import React, { useEffect, useRef } from 'react';
import { Card, Empty, Tag } from 'antd';

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

interface ProcessingTaskLogsProps {
    logs: LogEntry[];
    height?: number | string;
}

export default function ProcessingTaskLogs({ logs, height = 400 }: ProcessingTaskLogsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-blue-500';
            case 'WARN': return 'text-orange-500';
            case 'ERROR': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    if (!logs || logs.length === 0) {
        return (
            <Card bordered={false} className="bg-gray-900 text-gray-200 font-mono text-sm" bodyStyle={{ padding: 0 }}>
                <div style={{ height }} className="flex items-center justify-center">
                    <Empty description={<span className="text-gray-500">暂无日志</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            </Card>
        );
    }

    return (
        <div
            className="bg-[#1e1e1e] text-gray-300 font-mono text-xs md:text-sm p-4 rounded-md overflow-auto shadow-inner"
            style={{ height }}
            ref={scrollRef}
        >
            {logs.map((log, index) => (
                <div key={index} className="mb-1 leading-5 hover:bg-[#2a2a2a] px-1 rounded transition-colors">
                    <span className="text-gray-500 select-none mr-3">[{log.timestamp}]</span>
                    <span className={`font-bold mr-3 ${getLevelColor(log.level)}`}>{log.level}</span>
                    <span className="break-all">{log.message}</span>
                </div>
            ))}
            <div className="animate-pulse text-gray-500 mt-2">_</div>
        </div>
    );
}
