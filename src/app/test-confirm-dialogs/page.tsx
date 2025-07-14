'use client';

import React, { useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function TestConfirmDialogs() {
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

  const showConfirmDialog = (type: 'danger' | 'warning' | 'info' | 'success', title: string, message: string) => {
    setConfirmDialog({
      visible: true,
      title,
      message,
      type,
      onConfirm: () => {
        console.log(`${type} 操作已确认`);
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            确认对话框测试
          </h1>
          <p className="text-gray-600">
            测试现代化的确认对话框组件，替换传统的 alert 和 confirm
          </p>
        </div>

        {/* 测试按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => showConfirmDialog('danger', '删除确认', '确定要删除这个项目吗？此操作不可恢复。')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-red-200"
          >
            <h3 className="font-semibold text-red-900 mb-2">危险操作</h3>
            <p className="text-sm text-gray-600">测试删除确认对话框</p>
          </button>

          <button
            onClick={() => showConfirmDialog('warning', '警告确认', '此操作可能会影响系统性能，是否继续？')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-yellow-200"
          >
            <h3 className="font-semibold text-yellow-900 mb-2">警告操作</h3>
            <p className="text-sm text-gray-600">测试警告确认对话框</p>
          </button>

          <button
            onClick={() => showConfirmDialog('info', '信息确认', '是否要查看详细信息？')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-blue-200"
          >
            <h3 className="font-semibold text-blue-900 mb-2">信息操作</h3>
            <p className="text-sm text-gray-600">测试信息确认对话框</p>
          </button>

          <button
            onClick={() => showConfirmDialog('success', '成功确认', '操作已完成，是否要保存结果？')}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-green-200"
          >
            <h3 className="font-semibold text-green-900 mb-2">成功操作</h3>
            <p className="text-sm text-gray-600">测试成功确认对话框</p>
          </button>
        </div>

        {/* 功能说明 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">视觉设计</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 现代化的玻璃态设计</li>
                <li>• 不同操作类型的颜色区分</li>
                <li>• 平滑的动画过渡效果</li>
                <li>• 响应式布局适配</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">交互体验</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 键盘 ESC 键关闭</li>
                <li>• 点击遮罩层关闭</li>
                <li>• 加载状态显示</li>
                <li>• 无障碍访问支持</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">类型支持</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• danger - 危险操作（红色）</li>
                <li>• warning - 警告操作（黄色）</li>
                <li>• info - 信息操作（蓝色）</li>
                <li>• success - 成功操作（绿色）</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">使用场景</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 删除数据源/数据集</li>
                <li>• 删除用户连接权限</li>
                <li>• 删除表登记信息</li>
                <li>• 其他需要确认的操作</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 代码示例 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">使用示例</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`// 1. 导入组件
import ConfirmDialog from '@/components/common/ConfirmDialog';

// 2. 定义状态
const [confirmDialog, setConfirmDialog] = useState({
  visible: false,
  title: '',
  message: '',
  type: 'danger' as const,
  onConfirm: () => {}
});

// 3. 显示确认对话框
const handleDelete = () => {
  setConfirmDialog({
    visible: true,
    title: '删除确认',
    message: '确定要删除这个项目吗？',
    type: 'danger',
    onConfirm: () => {
      // 执行删除操作
      deleteItem();
      setConfirmDialog(prev => ({ ...prev, visible: false }));
    }
  });
};

// 4. 在组件中渲染
<ConfirmDialog
  visible={confirmDialog.visible}
  title={confirmDialog.title}
  message={confirmDialog.message}
  type={confirmDialog.type}
  onConfirm={confirmDialog.onConfirm}
  onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
} 