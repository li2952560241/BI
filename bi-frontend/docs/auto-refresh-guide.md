# 自动刷新功能使用指南

## 概述

本项目提供了多种自动刷新功能，可以在用户无感知的情况下自动更新页面内容，确保数据的实时性。

## 功能特性

- ✅ **静默刷新**：用户完全无感知的自动刷新
- ✅ **智能暂停**：页面不可见时自动暂停刷新
- ✅ **网络感知**：网络断开时暂停，恢复时继续
- ✅ **错误处理**：静默处理刷新错误，不影响用户体验
- ✅ **性能优化**：避免重复请求和资源浪费
- ✅ **全环境支持**：在开发环境和生产环境都可以使用
- ✅ **请求重试**：失败时自动重试，确保数据传输
- ✅ **超时控制**：防止请求长时间挂起

## 使用方式

### 1. 全局自动刷新（已集成）

全局自动刷新功能已经集成到主应用中，会自动刷新用户信息。

**位置**：`src/app.tsx`
**刷新间隔**：3秒
**启用条件**：在所有环境下启用（开发环境和生产环境）

### 2. 页面级自动刷新

在具体页面中使用 `useAutoRefresh` Hook：

```tsx
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

const MyPage: React.FC = () => {
  const [data, setData] = useState([]);
  
  // 使用自动刷新Hook
  const { isRefreshing } = useAutoRefresh({
    interval: 3000, // 3秒刷新一次
    enabled: true,   // 启用自动刷新
    onRefresh: async () => {
      // 自定义刷新逻辑
      const res = await fetchData();
      setData(res.data);
    },
    refreshOnMount: true, // 组件挂载时立即刷新
  });

  return (
    <div>
      {/* 页面内容 */}
    </div>
  );
};
```

### 3. 组件级自动刷新

使用 `PageAutoRefresh` 组件：

```tsx
import PageAutoRefresh from '@/components/AutoRefresh/PageAutoRefresh';

const MyPage: React.FC = () => {
  return (
    <div>
      <PageAutoRefresh
        interval={3000}
        enabled={true}
        onRefresh={async () => {
          // 自定义刷新逻辑
        }}
        refreshOnRouteChange={true}
        refreshOnFocus={true}
      />
      {/* 页面内容 */}
    </div>
  );
};
```

### 4. 增强版自动刷新

使用 `EnhancedAutoRefresh` 组件，提供更好的错误处理和重试机制：

```tsx
import EnhancedAutoRefresh from '@/components/AutoRefresh/EnhancedAutoRefresh';

const MyPage: React.FC = () => {
  return (
    <div>
      <EnhancedAutoRefresh
        interval={3000}
        enabled={true}
        retryCount={3}        // 失败重试3次
        retryDelay={1000}     // 重试间隔1秒
        timeout={10000}       // 请求超时10秒
        onRefresh={async () => {
          // 自定义刷新逻辑
        }}
      />
      {/* 页面内容 */}
    </div>
  );
};
```

### 5. 测试页面

项目包含一个自动刷新功能测试页面，可以验证功能是否正常工作：

**访问路径**：`/auto_refresh_test`
**功能**：
- 每3秒自动刷新计数
- 显示刷新状态
- 手动刷新功能
- 实时时间更新

## 配置选项

### useAutoRefresh Hook 选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `interval` | `number` | `3000` | 刷新间隔（毫秒） |
| `enabled` | `boolean` | `true` | 是否启用自动刷新 |
| `onRefresh` | `() => Promise<void>` | - | 自定义刷新逻辑 |
| `refreshOnMount` | `boolean` | `true` | 组件挂载时是否立即刷新 |
| `refreshOnUnmount` | `boolean` | `true` | 组件卸载时是否停止刷新 |

### PageAutoRefresh 组件选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `interval` | `number` | `3000` | 刷新间隔（毫秒） |
| `enabled` | `boolean` | `true` | 是否启用自动刷新 |
| `onRefresh` | `() => Promise<void>` | - | 自定义刷新逻辑 |
| `refreshOnRouteChange` | `boolean` | `true` | 路由变化时是否刷新 |
| `refreshOnFocus` | `boolean` | `true` | 页面获得焦点时是否刷新 |

### EnhancedAutoRefresh 组件选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `interval` | `number` | `3000` | 刷新间隔（毫秒） |
| `enabled` | `boolean` | `true` | 是否启用自动刷新 |
| `onRefresh` | `() => Promise<void>` | - | 自定义刷新逻辑 |
| `retryCount` | `number` | `3` | 失败重试次数 |
| `retryDelay` | `number` | `1000` | 重试延迟时间（毫秒） |
| `timeout` | `number` | `10000` | 请求超时时间（毫秒） |

## 最佳实践

### 1. 合理设置刷新间隔

- **实时数据**：3-5秒
- **半实时数据**：10-30秒
- **静态数据**：1-5分钟

### 2. 错误处理

```tsx
const { isRefreshing } = useAutoRefresh({
  interval: 3000,
  onRefresh: async () => {
    try {
      const res = await fetchData();
      setData(res.data);
    } catch (error) {
      // 静默处理错误，不显示给用户
      console.log('Auto refresh failed:', error);
    }
  },
});
```

### 3. 条件启用

```tsx
const { isRefreshing } = useAutoRefresh({
  interval: 3000,
  enabled: shouldAutoRefresh, // 根据条件启用
  onRefresh: async () => {
    // 刷新逻辑
  },
});
```

### 4. 性能优化

```tsx
// 避免在刷新函数中执行重计算
const { isRefreshing } = useAutoRefresh({
  interval: 3000,
  onRefresh: useCallback(async () => {
    // 使用 useCallback 避免重复创建函数
    const res = await fetchData();
    setData(res.data);
  }, []),
});
```

## 实际应用示例

### 图表列表页面（MyChart）

```tsx
// 每3秒自动刷新图表状态
const { isRefreshing } = useAutoRefresh({
  interval: 3000,
  enabled: true,
  onRefresh: async () => {
    const res = await listMyChartByPageUsingPost(searchParams);
    if (res.data) {
      setChartList(res.data.records ?? []);
      setTotal(res.data.total ?? 0);
    }
  },
});
```

### 实时数据展示

```tsx
// 实时展示系统状态
const { isRefreshing } = useAutoRefresh({
  interval: 3000, // 3秒刷新
  enabled: true,
  onRefresh: async () => {
    const res = await getSystemStatus();
    setSystemStatus(res.data);
  },
});
```

### 高可靠性数据刷新

```tsx
// 使用增强版自动刷新，确保数据传输
<EnhancedAutoRefresh
  interval={3000}
  retryCount={5}
  retryDelay={2000}
  timeout={15000}
  onRefresh={async () => {
    const res = await fetchCriticalData();
    setCriticalData(res.data);
  }}
/>
```

## 注意事项

1. **避免过度刷新**：不要设置过短的刷新间隔，以免影响性能
2. **错误处理**：始终在刷新函数中添加错误处理
3. **内存泄漏**：确保在组件卸载时清理定时器
4. **用户体验**：保持刷新过程对用户完全透明
5. **网络优化**：在网络不佳时考虑延长刷新间隔
6. **开发环境**：现在在开发环境也可以使用，便于调试
7. **请求可靠性**：使用增强版组件确保数据传输的可靠性

## 调试

如需调试自动刷新功能，可以：

1. **使用测试页面**：访问 `/auto_refresh_test` 查看实时刷新状态
2. **临时显示刷新状态**：

```tsx
const { isRefreshing } = useAutoRefresh({
  // ... 配置
});

return (
  <div>
    {/* 临时显示刷新状态（仅用于调试） */}
    {process.env.NODE_ENV === 'development' && (
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
        {isRefreshing ? '🔄 刷新中...' : '✅ 就绪'}
      </div>
    )}
    {/* 页面内容 */}
  </div>
);
```

3. **查看控制台日志**：刷新过程中的错误会记录在控制台中
4. **网络监控**：使用浏览器开发者工具监控网络请求 