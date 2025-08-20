import React, { useEffect, useRef, useState } from 'react';
import { useModel } from '@umijs/max';

interface AutoRefreshProps {
  interval?: number; // 刷新间隔，默认3000ms
  enabled?: boolean; // 是否启用自动刷新
  onRefresh?: () => void; // 自定义刷新逻辑
}

const AutoRefresh: React.FC<AutoRefreshProps> = ({
  interval = 5000,
  enabled = true,
  onRefresh,
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // 静默刷新函数
  const silentRefresh = async () => {
    try {
      // 如果提供了自定义刷新逻辑，使用自定义逻辑
      if (onRefresh) {
        await onRefresh();
      } else {
        // 默认刷新逻辑：重新获取用户信息和全局状态
        const { getLoginUserUsingGet } = await import('@/services/bi/userController');
        
        // 静默获取最新数据
        const userInfo = await getLoginUserUsingGet();
        
        // 更新全局状态（静默更新，不触发UI重渲染）
        if (userInfo && userInfo.data) {
          setInitialState((prevState) => ({
            ...prevState,
            currentUser: userInfo.data,
          }));
        }
      }
      
      setLastRefreshTime(Date.now());
    } catch (error) {
      // 静默处理错误，不显示给用户
      console.log('Auto refresh failed:', error);
    }
  };

  // 启动自动刷新
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      silentRefresh();
    }, interval);
  };

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    // 清理函数
    return () => {
      stopAutoRefresh();
    };
  }, [enabled, interval]);

  // 页面可见性变化时暂停/恢复自动刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else if (enabled) {
        startAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  // 网络状态变化时处理
  useEffect(() => {
    const handleOnline = () => {
      if (enabled) {
        // 网络恢复时立即刷新一次
        silentRefresh();
        startAutoRefresh();
      }
    };

    const handleOffline = () => {
      stopAutoRefresh();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled]);

  // 组件不渲染任何UI，完全静默
  return null;
};

export default AutoRefresh; 