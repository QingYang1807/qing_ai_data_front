'use client';

import React, { useState } from 'react';
import { Inter } from 'next/font/google';
import { ConfigProvider, App } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import zhCN from 'antd/locale/zh_CN';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const antdTheme = {
  token: {
    colorPrimary: '#3b82f6',
    borderRadius: 8,
    colorBgContainer: '#ffffff',
  },
  components: {
    Layout: {
      bodyBg: '#f8fafc',
      siderBg: '#ffffff',
      headerBg: '#ffffff',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#eff6ff',
      itemSelectedColor: '#1d4ed8',
      itemHoverBg: '#f1f5f9',
    },
    Button: {
      borderRadius: 8,
    },
    Table: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 12,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5分钟
        refetchOnWindowFocus: false,
        retry: 3,
      },
    },
  }));

  return (
    <html lang="zh-CN">
      <head>
        <title>AI数据处理平台</title>
        <meta name="description" content="智能AI数据处理平台，提供数据采集、清洗、标注、增强等全流程数据处理服务" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider 
            locale={zhCN} 
            theme={antdTheme}
          >
            <App>
              <div className="min-h-screen bg-gray-50">
                {children}
              </div>
            </App>
          </ConfigProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
} 