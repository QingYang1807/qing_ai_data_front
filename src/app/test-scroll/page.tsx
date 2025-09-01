'use client';

import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';

export default function TestScrollPage() {
  return (
    <div className="bg-white w-full">
      {/* 顶部区域 */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">滚动测试页面</h1>
          <p className="text-xl">这个页面用于测试滚动功能是否正常工作</p>
        </div>
      </section>

      {/* 中间区域 */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">中间区域</h2>
          <p className="text-lg text-gray-600 mb-8">如果你能看到这个区域，说明滚动功能正常</p>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p>测试内容 1</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p>测试内容 2</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p>测试内容 3</p>
            </div>
          </div>
        </div>
      </section>

      {/* 底部区域 */}
      <section className="bg-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">底部区域</h2>
          <p className="text-xl mb-8">如果你能看到这个区域，说明滚动功能完全正常！</p>
          <Link href="/welcome">
            <Button type="primary" size="large">
              返回欢迎页面
            </Button>
          </Link>
        </div>
      </section>

      {/* 额外的测试区域 */}
      {Array.from({ length: 10 }, (_, i) => (
        <section key={i} className={`py-16 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">测试区域 {i + 1}</h3>
            <p className="text-gray-600">
              这是第 {i + 1} 个测试区域，用于确保页面可以正常滚动。
              如果你能看到这个区域，说明滚动功能工作正常。
            </p>
          </div>
        </section>
      ))}
    </div>
  );
} 