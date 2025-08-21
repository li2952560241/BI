import { listMyChartByPageUsingPost } from '@/services/bi/chartController';

import { useModel } from '@@/exports';
import {Avatar, Card, List, message, Result} from 'antd';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';
import Search from "antd/es/input/Search";
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import useResponsive from '@/hooks/useResponsive';

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 将useResponsive Hook调用移到最前面
  const { isMobile, isTablet } = useResponsive();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPost(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          })
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };

  // 使用自动刷新Hook，每3秒静默刷新数据
  const { isRefreshing } = useAutoRefresh({
    interval: 3000,
    enabled: true, // 启用自动刷新
    onRefresh: async () => {
      // 静默刷新，不显示loading状态
      try {
        const res = await listMyChartByPageUsingPost(searchParams);
        if (res.data) {
          setChartList(res.data.records ?? []);
          setTotal(res.data.total ?? 0);
          // 隐藏图表的 title
          if (res.data.records) {
            res.data.records.forEach(data => {
              if (data.status === 'succeed') {
                const chartOption = JSON.parse(data.genChart ?? '{}');
                chartOption.title = undefined;
                data.genChart = JSON.stringify(chartOption);
              }
            })
          }
        }
      } catch (error) {
        // 静默处理错误，不显示给用户
        console.log('Auto refresh chart list failed:', error);
      }
    },
    refreshOnMount: true, // 组件挂载时立即刷新
  });

  useEffect(() => {
    loadData();
  }, [searchParams]);

  // 响应式网格配置
  const getGridConfig = () => {
    if (isMobile) {
      return {
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1,
      };
    }
    if (isTablet) {
      return {
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 2,
        xl: 2,
        xxl: 2,
      };
    }
    return {
      gutter: 16,
      xs: 1,
      sm: 1,
      md: 1,
      lg: 2,
      xl: 2,
      xxl: 2,
    };
  };

  // 响应式分页配置
  const getPaginationConfig = () => {
    const baseConfig = {
      ...searchParams,
      pageSize: searchParams.pageSize,
      total: total,
      onChange: (page: number, pageSize: number) => {
        setSearchParams({
          ...searchParams,
          current: page,
          pageSize,
        })
      },
      onShowSizeChange: (current: number, size: number) => {
        setSearchParams({
          ...searchParams,
          current: 1,
          pageSize: size,
        })
      },
      size: isMobile ? "small" as const : "default" as const,
    };

    if (isMobile) {
      return {
        ...baseConfig,
        showSizeChanger: false,
        showQuickJumper: false,
        showTotal: (total: number) => `共 ${total} 条`,
        simple: true,
      };
    }

    return {
      ...baseConfig,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number) => `共 ${total} 条记录`,
    };
  };

  return (
    <div className="my-chart-page">
      {/* 自动刷新状态指示器（可选，用于调试） */}
      {/* {isRefreshing && <div style={{ display: 'none' }}>正在静默刷新...</div>} */}
      
      <Card title="我的图表" className="mobile-padding">
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="请输入图表名称"
            enterButton
            loading={loading}
            size={isMobile ? "large" : "middle"}
            className="mobile-full-width"
            onSearch={(value) => {
              setSearchParams({
                ...initSearchParams,
                name: value,
              })
            }}
          />
        </div>
        <List
          grid={getGridConfig()}
          pagination={getPaginationConfig()}
          dataSource={chartList}
          loading={loading}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card style={{ width: '100%' }} className="mobile-padding">
                <List.Item.Meta
                  avatar={<Avatar src={currentUser?.userAvatar} />}
                  title={item.name}
                  description={item.chartType ? '图表类型：' + item.chartType : undefined}
                />
                <>
                  {
                    item.status === 'wait' && (
                      <>
                        <Result
                          status="info"
                          title="待生成"
                          subTitle={item.execMessage ?? '系统繁忙，请耐心等待'}
                        />
                      </>
                    )
                  }
                  {
                    item.status === 'running' && (
                      <>
                        <Result
                          status="info"
                          title="生成中"
                          subTitle={item.execMessage ?? '正在生成图表，请稍候'}
                        />
                      </>
                    )
                  }
                  {
                    item.status === 'succeed' && (
                      <>
                        <div style={{ marginBottom: 16 }}>
                          <p><strong>分析目标：</strong>{item.goal}</p>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <p><strong>分析结论：</strong>{item.genResult}</p>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <ReactECharts 
                            option={JSON.parse(item.genChart ?? '{}')} 
                            style={{
                              height: isMobile ? '250px' : '300px',
                              width: '100%'
                            }}
                          />
                        </div>
                      </>
                    )
                  }
                  {
                    item.status === 'failed' && (
                      <>
                        <Result
                          status="error"
                          title="生成失败"
                          subTitle={item.execMessage}
                        />
                      </>
                    )
                  }
                </>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default MyChartPage;
