'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { WorkspaceProvider, useWorkspace } from '@/components/annotation/workspace/WorkspaceContext';
import WorkspaceLayout from '@/components/annotation/workspace/WorkspaceLayout';
import Toolbar from '@/components/annotation/workspace/Toolbar';
import Canvas from '@/components/annotation/workspace/Canvas';
import { FileListSidebar, PropertiesSidebar } from '@/components/annotation/workspace/Sidebars';
import { AnnotationTask, Annotation, AnnotationType } from '@/types/annotation';
import { message } from 'antd';

// Mock Data
const MOCK_FILES = [
    { id: '1', name: 'image_001.jpg', status: 'pending', url: 'https://via.placeholder.com/800x600?text=Image+1' },
    { id: '2', name: 'image_002.jpg', status: 'done', url: 'https://via.placeholder.com/800x600?text=Image+2' },
    { id: '3', name: 'image_003.jpg', status: 'pending', url: 'https://via.placeholder.com/800x600?text=Image+3' },
];

const WorkspaceInner = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { state, dispatch } = useWorkspace();
    const [loading, setLoading] = useState(false);

    // Load Task and Files
    useEffect(() => {
        const taskId = params.id as string;
        const typeParam = searchParams.get('type') as AnnotationType;

        // Determine type: fallback to IMAGE if not provided
        const taskType: AnnotationType = typeParam || 'IMAGE';

        // In a real app, fetch task by ID
        const task: AnnotationTask = {
            id: taskId,
            name: `Mock Task (${taskType})`,
            type: taskType,
            status: 'IN_PROGRESS',
            datasetId: 'ds-1',
            datasetName: 'Mock Dataset',
            createdAt: '',
            updatedAt: '',
            progress: 30,
            totalItems: 100,
            completedItems: 30
        };

        dispatch({ type: 'SET_TASK', payload: task });
        dispatch({ type: 'SET_CURRENT_ITEM', payload: '1' }); // Select first item
    }, [params.id, searchParams, dispatch]);

    const handleSave = () => {
        message.success('Annotations saved');
        // Logic to move to next item would go here
    };

    const currentFile = MOCK_FILES.find(f => f.id === state.currentItemId);

    // Mock Annotation Selection
    const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

    return (
        <WorkspaceLayout
            title={state.task?.name || 'Loading...'}
            onSave={handleSave}
            sidebarLeft={
                <FileListSidebar
                    items={MOCK_FILES}
                    activeId={state.currentItemId}
                    onItemClick={(id) => dispatch({ type: 'SET_CURRENT_ITEM', payload: id })}
                />
            }
            sidebarRight={
                <PropertiesSidebar
                    selectedAnnotation={selectedAnnotation} // In real app, this comes from state.annotations selection
                    onUpdate={(ann) => dispatch({ type: 'UPDATE_ANNOTATION', payload: ann })}
                />
            }
        >
            <div className="relative w-full h-full flex flex-col">
                <Toolbar
                    type={state.task?.type || 'IMAGE'}
                    selectedTool={state.selectedTool}
                    onSelectTool={(tool) => dispatch({ type: 'SET_TOOL', payload: tool })}
                    onZoomIn={() => dispatch({ type: 'SET_ZOOM', payload: state.zoomLevel + 10 })}
                    onZoomOut={() => dispatch({ type: 'SET_ZOOM', payload: state.zoomLevel - 10 })}
                />

                <div className="flex-1 relative overflow-hidden bg-gray-200">
                    <Canvas
                        type={state.task?.type || 'IMAGE'}
                        content={currentFile}
                        selectedTool={state.selectedTool}
                        loading={!state.task}
                    />
                </div>
            </div>
        </WorkspaceLayout>
    );
};

export default function WorkspacePage() {
    return (
        <WorkspaceProvider>
            <WorkspaceInner />
        </WorkspaceProvider>
    );
}
