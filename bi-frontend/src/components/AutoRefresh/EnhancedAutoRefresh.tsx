import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useModel } from '@umijs/max';

interface EnhancedAutoRefreshProps {
  interval?: number; // 刷新间隔，默认3000ms
  enabled?: boolean; // 是否启用自动刷新
  onRefresh?: () => Promise<void>; // 自定义刷新逻辑
  retryCount?: number; // 失败重试次数
  retryDelay?: number; // 重试延迟时间
  timeout?: number; // 请求超时时间
}

const EnhancedAutoRefresh: React.FC<EnhancedAutoRefreshProps> = ({
  interval = 5000,
  enabled = true,
  onRefresh,
  retryCount = 3,
  retryDelay = 1000,
  timeout = 10000,
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [lastError, setLastError] = useState<string>('');

  // 带重试机制的刷新函数
  const silentRefreshWithRetry = useCallback(async (retryAttempt = 0): Promise<void> => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setLastError('');

      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, timeout);
      });

      // 执行刷新逻辑
      const refreshPromise = onRefresh ? onRefresh() : (async () => {
        const { getLoginUserUsingGet } = await import('@/services/bi/userController');
        const userInfo = await getLoginUserUsingGet();
        if (userInfo && userInfo.data) {
          setInitialState((prevState) => ({
            ...prevState,
            currentUser: userInfo.data,
          }));
        }
      })();

      // 使用Promise.race来处理超时
      await Promise.race([refreshPromise, timeoutPromise]);
      
      // 清除超时定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setLastRefreshTime(Date.now());
      setErrorCount(0);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMessage);
      setErrorCount(prev => prev + 1);
      
      console.log(`Auto refresh failed (attempt ${retryAttempt + 1}):`, errorMessage);
      
      // 如果还有重试次数，延迟后重试
      if (retryAttempt < retryCount - 1) {
        setTimeout(() => {
          silentRefreshWithRetry(retryAttempt + 1);
        }, retryDelay);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, retryCount, retryDelay, timeout, setInitialState]);

  // 启动自动刷新
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      silentRefreshWithRetry();
    }, interval);
  }, [interval, silentRefreshWithRetry]);

  // 停止自动刷新
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 启动/停止自动刷新
  useEffect(() => {
    if (enabled) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

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
  }, [enabled, startAutoRefresh, stopAutoRefresh]);

  // 网络状态变化时处理
  useEffect(() => {
    const handleOnline = () => {
      if (enabled) {
        // 网络恢复时立即刷新一次
        silentRefreshWithRetry();
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
  }, [enabled, silentRefreshWithRetry, startAutoRefresh, stopAutoRefresh]);

  // 组件不渲染任何UI，完全静默
  return null;
};

export default EnhancedAutoRefresh; 