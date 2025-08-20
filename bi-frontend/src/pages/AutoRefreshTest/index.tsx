import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Tag } from 'antd';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const { Title, Text } = Typography;

/**
 * 自动刷新功能测试页面
 */
const AutoRefreshTest: React.FC = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());

  // 使用自动刷新Hook，每3秒刷新一次
  const { isRefreshing, lastRefreshTime: hookLastRefreshTime, manualRefresh } = useAutoRefresh({
    interval: 5000,
    enabled: true,
    onRefresh: async () => {
      // 模拟数据刷新
      setRefreshCount(prev => prev + 1);
      setLastRefreshTime(new Date());
      
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    refreshOnMount: true,
  });

  // 页面挂载时记录开始计次时间
  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const handleManualRefresh = async () => {
    try {
      await manualRefresh();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const handleReset = () => {
    setRefreshCount(0);
    setStartTime(new Date());
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>自动刷新功能测试</Title>
      
      <Card title="自动刷新状态" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>刷新状态：</Text>
            <Tag color={isRefreshing ? 'processing' : 'success'}>
              {isRefreshing ? '🔄 刷新中...' : '✅ 就绪'}
            </Tag>
          </div>
          
          <div>
            <Text strong>自动刷新次数：</Text>
            <Text code>{refreshCount}</Text>
          </div>

          <div>
            <Text strong>开始计次数的时间：</Text>
            <Text code>{startTime.toLocaleTimeString()}</Text>
          </div>
          
          <div>
            <Text strong>最后刷新时间：</Text>
            <Text code>{lastRefreshTime.toLocaleTimeString()}</Text>
          </div>
          
          <div>
            <Text strong>Hook最后刷新时间：</Text>
            <Text code>{new Date(hookLastRefreshTime).toLocaleTimeString()}</Text>
          </div>
        </Space>
      </Card>

      <Card title="手动操作">
        <Space>
          <Button 
            type="primary" 
            onClick={handleManualRefresh}
            loading={isRefreshing}
          >
            手动刷新
          </Button>
          
          <Button onClick={handleReset}>重置计数</Button>
        </Space>
      </Card>

      <Card title="说明" style={{ marginTop: 16 }}>
        <Text>
          此页面用于测试自动刷新功能。页面会每3秒自动刷新一次，更新刷新计数和时间。
          您可以观察到：
        </Text>
        <ul>
          <li>每3秒自动更新刷新计数</li>
          <li>刷新状态指示器</li>
          <li>开始计次数的时间</li>
          <li>最后刷新时间的更新</li>
          <li>手动刷新功能</li>
        </ul>
        <Text type="secondary">
          注意：自动刷新是完全静默的，不会影响用户体验。
        </Text>
      </Card>
    </div>
  );
};

export default AutoRefreshTest; 