import { SynthesisTask, SynthesisResult, CreateTaskRequest } from '@/types/synthesis';

const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:9202';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const synthesisApi = {
    // 创建合成任务
    createTask: async (request: CreateTaskRequest): Promise<SynthesisTask> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/synthesis/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating synthesis task:', error);
            throw error;
        }
    },

    // 获取任务列表
    listTasks: async (): Promise<SynthesisTask[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/synthesis/tasks`);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error listing synthesis tasks:', error);
            throw error;
        }
    },

    // 获取任务详情
    getTask: async (taskId: string): Promise<SynthesisTask> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/synthesis/tasks/${taskId}`);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting synthesis task:', error);
            throw error;
        }
    },

    // 获取任务结果
    getTaskResult: async (taskId: string): Promise<SynthesisResult> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/synthesis/tasks/${taskId}/result`);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting task result:', error);
            throw error;
        }
    },
};
