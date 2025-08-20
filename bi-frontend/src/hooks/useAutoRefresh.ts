import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // 刷新间隔，默认3000ms
  enabled?: boolean; // 是否启用自动刷新
  onRefresh?: () => Promise<void>; // 自定义刷新逻辑
  refreshOnMount?: boolean; // 组件挂载时是否立即刷新
  refreshOnUnmount?: boolean; // 组件卸载时是否停止刷新
}

interface UseAutoRefreshReturn {
  isRefreshing: boolean;
  lastRefreshTime: number;
  startRefresh: () => void;
  stopRefresh: () => void;
  manualRefresh: () => Promise<void>;
}

export const useAutoRefresh = (options: UseAutoRefreshOptions = {}): UseAutoRefreshReturn => {
  const {
    interval = 5000,
    enabled = true,
    onRefresh,
    refreshOnMount = true,
    refreshOnUnmount = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  const refreshFnRef = useRef<() => Promise<void>>(async () => {});
  const mountTriggeredRef = useRef<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());

  // 保持最新的 onRefresh 引用
  useEffect(() => {
    refreshFnRef.current = async () => {
      if (isRefreshingRef.current || !onRefresh) return;
      try {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        await onRefresh();
        setLastRefreshTime(Date.now());
      } catch (error) {
        // 静默处理错误
        console.log('Auto refresh failed:', error);
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    };
  }, [onRefresh]);

  // 手动刷新函数（稳定引用）
  const manualRefresh = useCallback(async () => {
    await refreshFnRef.current();
  }, []);

  // 启动自动刷新（稳定引用）
  const startRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      refreshFnRef.current();
    }, interval);
  }, [interval]);

  // 停止自动刷新（稳定引用）
  const stopRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 仅在挂载时触发一次的初始刷新
  useEffect(() => {
    if (!mountTriggeredRef.current && enabled && refreshOnMount) {
      mountTriggeredRef.current = true;
      refreshFnRef.current();
    }
    // 仅在 enabled 或 refreshOnMount 变化时再判断一次
  }, [enabled, refreshOnMount]);

  // 管理定时器：只依赖 enabled 与 interval，避免因为函数引用变化而重建
  useEffect(() => {
    if (enabled) {
      startRefresh();
    } else {
      stopRefresh();
    }
    return () => {
      if (refreshOnUnmount) {
        stopRefresh();
      }
    };
  }, [enabled, interval, startRefresh, stopRefresh, refreshOnUnmount]);

  // 页面可见性变化时暂停/恢复自动刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRefresh();
      } else if (enabled) {
        startRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startRefresh, stopRefresh]);

  // 网络状态变化时处理
  useEffect(() => {
    const handleOnline = () => {
      if (enabled) {
        // 网络恢复时立即刷新一次
        refreshFnRef.current();
        startRefresh();
      }
    };

    const handleOffline = () => {
      stopRefresh();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, startRefresh, stopRefresh]);

  return {
    isRefreshing,
    lastRefreshTime,
    startRefresh,
    stopRefresh,
    manualRefresh,
  };
}; 