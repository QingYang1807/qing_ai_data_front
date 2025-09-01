// 测试数据处理API路径
const testProcessingAPI = async () => {
  console.log('测试数据处理API路径...');
  
  try {
    // 测试创建任务API
    const response = await fetch('/api/processing/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskName: '测试任务',
        taskDescription: '测试数据处理任务',
        datasetId: 1,
        processingType: 'CLEANING',
        config: '{"outputFormat":"JSON","cleaning":{"removeNulls":true}}'
      })
    });
    
    const data = await response.json();
    console.log('创建任务响应:', data);
    
    if (response.ok) {
      console.log('✅ API路径正确，请求成功');
    } else {
      console.log('❌ API请求失败:', data);
    }
  } catch (error) {
    console.error('❌ API测试失败:', error);
  }
};

// 如果是在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.testProcessingAPI = testProcessingAPI;
  console.log('测试函数已加载，可以在浏览器控制台中运行: testProcessingAPI()');
}

// 如果是在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testProcessingAPI };
} 