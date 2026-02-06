export type AugmentationType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'multimodal';

export type TextAugmentationMethod = 'synonym' | 'back_translation' | 'random_insertion' | 'random_swap' | 'random_deletion' | 'noise_injection' | 'context_augment' | 'knowledge_injection';
export type ImageAugmentationMethod = 'rotation' | 'crop' | 'flip' | 'color_jitter' | 'noise' | 'blur' | 'cutout';
export type AudioAugmentationMethod = 'speed' | 'pitch' | 'noise' | 'reverb' | 'time_shift';
export type VideoAugmentationMethod = 'frame_extraction' | 'time_warp' | 'crop' | 'rotation';
export type CodeAugmentationMethod = 'variable_rename' | 'comment_deletion' | 'dead_code_insertion';
export type MultimodalAugmentationMethod = 'image_captioning' | 'text_to_image' | 'cross_modal_translation';

export interface AugmentationStrategyConfig {
    method: string;
    params: Record<string, any>;
}

export interface AugmentationTask {
    id: string;
    name: string;
    description?: string;
    type: AugmentationType;
    dataSourceId: string;
    dataSourceName: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    config: AugmentationStrategyConfig[];
    multiplier: number;
    createdAt: string;
    updatedAt: string;
    outputCount?: number;
}

export const AUGMENTATION_TYPES: { label: string; value: AugmentationType }[] = [
    { label: '文本增强', value: 'text' },
    { label: '图像增强', value: 'image' },
    { label: '语音增强', value: 'audio' },
    { label: '视频增强', value: 'video' },
    { label: '代码增强', value: 'code' },
    { label: '多模态增强', value: 'multimodal' },
];
