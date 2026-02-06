'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Download,
    Filter,
    Zap,
    Tag,
    CheckCircle,
    RefreshCw,
    Server,
    Bot,
    ArrowRight,
    Database,
    Monitor
} from 'lucide-react';

const DataPipelineFlow = () => {
    const router = useRouter();

    const steps = [
        {
            id: 'collect',
            title: '数据采集',
            subTitle: '文本/图像/语音',
            path: '/dashboard/collect',
            icon: Download,
            color: 'blue'
        },
        {
            id: 'cleaning',
            title: '数据清洗',
            subTitle: '去重/过滤/标准化',
            path: '/dashboard/cleaning',
            icon: Filter,
            color: 'indigo'
        },
        {
            id: 'augment',
            title: '增强/合成',
            subTitle: '噪声注入/GAN生成',
            path: '/dashboard/augment',
            icon: Zap,
            color: 'purple'
        },
        {
            id: 'annotation',
            title: '标注打标',
            subTitle: '自动/人工标注',
            path: '/dashboard/annotation',
            icon: Tag,
            color: 'pink'
        },
        {
            id: 'quality',
            title: '质量评估',
            subTitle: '准确性/一致性',
            path: '/dashboard/quality',
            icon: CheckCircle,
            color: 'green'
        },
        {
            id: 'conversion',
            title: '格式转换',
            subTitle: 'TFRecord/Parquet',
            path: '/dashboard/conversion',
            icon: RefreshCw,
            color: 'orange'
        },
        {
            id: 'feeding',
            title: '数据投喂',
            subTitle: '预取/缓存/负载',
            path: '/dashboard/feeding',
            icon: Server,
            color: 'cyan'
        },
        {
            id: 'training',
            title: '训练迭代',
            subTitle: '在线学习/评估',
            path: '/dashboard/training',
            icon: Bot,
            color: 'red'
        }
    ];

    return (
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
            <div className="glass-card p-6 min-w-[1200px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-blue-600" />
                        数据处理全流程
                    </h3>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">点击节点进入对应管理页面</span>
                        <button
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium flex items-center transition-colors"
                            onClick={() => router.push('/dashboard/infrastructure')}
                        >
                            <Monitor className="w-3 h-3 mr-1" />
                            基础设施监控
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between relative">
                    {/* Connecting Line - Behind steps */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -transla-y-1/2 hidden md:block" style={{ zIndex: 0 }}></div>

                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            {/* Step Card */}
                            <div
                                className="relative z-10 group cursor-pointer flex flex-col items-center"
                                onClick={() => router.push(step.path)}
                            >
                                {/* Icon Circle */}
                                <div className={`w-14 h-14 rounded-full bg-${step.color}-50 border-2 border-${step.color}-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300`}>
                                    <step.icon className={`w-6 h-6 text-${step.color}-500`} />
                                </div>

                                {/* Content */}
                                <div className="text-center">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h4>
                                    <p className="text-xs text-gray-500 max-w-[100px] leading-tight px-1 hidden md:block">
                                        {step.subTitle}
                                    </p>
                                </div>

                                {/* Status Dot (Mock) */}
                                <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500`}></div>
                            </div>

                            {/* Arrow (except last) */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 flex justify-center z-10 text-gray-300 -mt-8 px-2">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataPipelineFlow;
