'use client';

import React from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Dataset } from '@/types';

interface ProcessingHistoryProps {
  onBack: () => void;
  selectedDataset?: Dataset;
}

const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({ onBack, selectedDataset }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">处理历史</h3>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          返回
        </button>
      </div>
      
      {selectedDataset && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">数据集: {selectedDataset.name}</p>
        </div>
      )}
      
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">暂无处理历史记录</p>
      </div>
    </div>
  );
};

export default ProcessingHistory; 