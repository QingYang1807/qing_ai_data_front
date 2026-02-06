import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AnnotationTask, Annotation } from '@/types/annotation';

// State Definition
interface WorkspaceState {
    task: AnnotationTask | null;
    currentItemId: string | null;
    annotations: Annotation[];
    selectedTool: string;
    zoomLevel: number;
}

// Action Definition
type Action =
    | { type: 'SET_TASK'; payload: AnnotationTask }
    | { type: 'SET_CURRENT_ITEM'; payload: string }
    | { type: 'ADD_ANNOTATION'; payload: Annotation }
    | { type: 'UPDATE_ANNOTATION'; payload: Annotation }
    | { type: 'DELETE_ANNOTATION'; payload: string }
    | { type: 'SET_TOOL'; payload: string }
    | { type: 'SET_ZOOM'; payload: number };

const initialState: WorkspaceState = {
    task: null,
    currentItemId: null,
    annotations: [],
    selectedTool: 'select',
    zoomLevel: 100,
};

// Reducer
const workspaceReducer = (state: WorkspaceState, action: Action): WorkspaceState => {
    switch (action.type) {
        case 'SET_TASK':
            return { ...state, task: action.payload };
        case 'SET_CURRENT_ITEM':
            return { ...state, currentItemId: action.payload };
        case 'ADD_ANNOTATION':
            return { ...state, annotations: [...state.annotations, action.payload] };
        case 'UPDATE_ANNOTATION':
            return {
                ...state,
                annotations: state.annotations.map(a =>
                    a.id === action.payload.id ? action.payload : a
                ),
            };
        case 'DELETE_ANNOTATION':
            return {
                ...state,
                annotations: state.annotations.filter(a => a.id !== action.payload),
            };
        case 'SET_TOOL':
            return { ...state, selectedTool: action.payload };
        case 'SET_ZOOM':
            return { ...state, zoomLevel: action.payload };
        default:
            return state;
    }
};

// Context
const WorkspaceContext = createContext<{
    state: WorkspaceState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Provider Component
export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(workspaceReducer, initialState);

    return (
        <WorkspaceContext.Provider value={{ state, dispatch }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

// Hook
export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
