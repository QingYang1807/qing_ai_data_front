export type AnnotationType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'CODE' | '3D';
export type AnnotationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface AnnotationTask {
    id: string;
    name: string;
    description?: string;
    type: AnnotationType;
    status: AnnotationStatus;
    datasetId: string;
    datasetName: string;
    createdAt: string;
    updatedAt: string;
    progress: number;
    totalItems: number;
    completedItems: number;
    annotators?: string[];
}

export interface Annotation {
    id: string;
    taskId: string;
    itemId: string;
    content: any; // The actual annotation data (depends on type)
    annotatorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface AnnotationStats {
    total: number;
    inProgress: number;
    completed: number;
    avgAccuracy: number;
}
