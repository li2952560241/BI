import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from '@umijs/max';

interface PageAutoRefreshProps {
  interval?: number; // 刷新间隔，默认3000ms
  enabled?: boolean; // 是否启用自动刷新
  onRefresh?: () => Promise<void>; // 自定义刷新逻辑
  refreshOnRouteChange?: boolean; // 路由变化时是否刷新
  refreshOnFocus?: boolean; // 页面获得焦点时是否刷新
}

const PageAutoRefresh: React.FC<PageAutoRefreshProps> = ({
  interval = 5000,
  enabled = true,
  onRefresh,
  refreshOnRouteChange = true,
  refreshOnFocus = true,
}) => {
  const location = useLocation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 静默刷新函数
  const silentRefresh = useCallback(async () => {
    if (isRefreshing || !enabled) return;
    
    try {
      setIsRefreshing(true);
      
      if (onRefresh) {
        await onRefresh();
      }
      
      setLastRefreshTime(Date.now());
    } catch (error) {
      // 静默处理错误，不显示给用户
      console.log('Page auto refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, enabled, isRefreshing]);

  // 启动自动刷新
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      silentRefresh();
    }, interval);
  }, [interval, silentRefresh]);

  // 停止自动刷新
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 处理路由变化
  useEffect(() => {
    if (refreshOnRouteChange && enabled) {
      // 路由变化时立即刷新一次
      silentRefresh();
    }
  }, [location.pathname, refreshOnRouteChange, enabled, silentRefresh]);

  // 处理页面焦点变化
  useEffect(() => {
    const handleFocus = () => {
      if (refreshOnFocus && enabled) {
        // 页面获得焦点时立即刷新一次
        silentRefresh();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else if (enabled) {
        startAutoRefresh();
        if (refreshOnFocus) {
          silentRefresh();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, refreshOnFocus, silentRefresh, startAutoRefresh, stopAutoRefresh]);

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
  }, [enabled, silentRefresh, startAutoRefresh, stopAutoRefresh]);

  // 组件不渲染任何UI，完全静默
  return null;
};

export default PageAutoRefresh; 