export enum SynthesisType {
    LLM = "llm",
    FINANCIAL = "financial",
    CODE = "code",
    KG = "kg",
    MULTIMODAL = "multimodal"
}

export enum SynthesisMethod {
    // LLM Methods
    QA_GENERATION = "qa_generation",
    COT_GENERATION = "cot_generation",
    FEW_SHOT = "few_shot",

    // Financial Methods
    FINANCIAL_CALCULATION = "financial_calculation",
    MARKET_SIMULATION = "market_simulation",

    // Code Methods
    QUANT_STRATEGY = "quant_strategy",
    SQL_GENERATION = "sql_generation",

    // KG Methods
    GRAPH_TRAVERSAL = "graph_traversal",
    ENTITY_RELATION = "entity_relation"
}

export enum SynthesisStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}

export interface SynthesisConfig {
    topic: string;
    num_samples: number;
    difficulty?: string;
    model?: string;
    extra_params?: Record<string, any>;
}

export interface SynthesisTask {
    id: string;
    name: string;
    type: SynthesisType;
    method: SynthesisMethod;
    status: SynthesisStatus;
    config: SynthesisConfig;
    created_at: string;
    updated_at: string;
    result_count: number;
    error_message?: string;
}

export interface SynthesisResult {
    id: string;
    task_id: string;
    data: any[];
    quality_score?: number;
    created_at: string;
}

export interface CreateTaskRequest {
    name: string;
    type: SynthesisType;
    method: SynthesisMethod;
    config: SynthesisConfig;
}
