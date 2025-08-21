import { genChartByAiUsingPost } from '@/services/bi/chartController';
import { UploadOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload, Tooltip, Alert} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import useResponsive from '@/hooks/useResponsive';

/**
 * 添加图表页面
 * @constructor
 */
const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setOption] = useState<any>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasUploadedFile, setHasUploadedFile] = useState<boolean>(false);
  const { isMobile, isTablet } = useResponsive();

  // 获取示例文件
  const fetchSampleFile = async (): Promise<File> => {
    const sampleUrl = '/test-data/test_excel.xlsx';
    try {
      const res = await fetch(sampleUrl);
      if (!res.ok) {
        throw new Error('示例文件下载失败');
      }
      const blob = await res.blob();
      const file = new File([blob], 'test_excel.xlsx', { type: blob.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return file;
    } catch (e: any) {
      throw new Error(e?.message || '无法获取示例文件');
    }
  };

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    if (submitting) return;
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);

    // 构造基础参数（移除文件字段）
    const params = {
      ...values,
      file: undefined,
    };

    try {
      // 如果未上传文件，则自动使用示例文件
      const uploadFile: File = values?.file?.file?.originFileObj || (await fetchSampleFile());

      const res = await genChartByAiUsingPost(params, {}, uploadFile);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功');
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error('图表代码解析错误');
        } else {
          setChart(res.data);
          setOption(chartOption);
        }
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
    setSubmitting(false);
  };

  // 响应式列配置
  const getColSpan = () => {
    if (isMobile) return 24;
    if (isTablet) return 12;
    return 12;
  };

  // 处理文件上传变化
  const handleFileChange = (info: any) => {
    if (info.fileList.length > 0) {
      setHasUploadedFile(true);
    } else {
      setHasUploadedFile(false);
    }
  };

  return (
    <div className="add-chart">
      <Row gutter={isMobile ? 16 : 24}>
        <Col span={getColSpan()}>
          <Card title="智能分析" className="mobile-padding">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* 只在未上传文件时显示提示 */}
              {!hasUploadedFile && (
                <Alert 
                  type="info" 
                  showIcon 
                  message="温馨提示" 
                  description={
                    <span>
                      如未上传数据文件，将自动使用示例文件 <strong>test_excel.xlsx</strong> 进行分析。
                      您也可以点击右侧按钮下载示例文件。
                    </span>
                  }
                />
              )}
              <Form 
                name="addChart" 
                labelAlign="left"
                labelCol={{ span: isMobile ? 24 : 4 }}
                wrapperCol={{ span: isMobile ? 24 : 16 }}
                onFinish={onFinish} 
                initialValues={{}}
                layout={isMobile ? "vertical" : "horizontal"}
              >
                <Form.Item
                  name="goal"
                  label="分析目标"
                  rules={[{ required: true, message: '请输入分析目标' }]}
                >
                  <TextArea 
                    placeholder="请输入你的分析需求，比如：分析网站用户的增长情况" 
                    rows={isMobile ? 4 : 3}
                    className="mobile-full-width"
                  />
                </Form.Item>
                <Form.Item name="name" label="图表名称">
                  <Input 
                    placeholder="请输入图表名称" 
                    className="mobile-full-width"
                  />
                </Form.Item>
                <Form.Item name="chartType" label="图表类型">
                  <Select
                    placeholder="请选择图表类型"
                    className="mobile-full-width"
                    options={[
                      { value: '折线图', label: '折线图' },
                      { value: '柱状图', label: '柱状图' },
                      { value: '堆叠图', label: '堆叠图' },
                      { value: '饼图', label: '饼图' },
                      { value: '雷达图', label: '雷达图' },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="原始数据" name="file" valuePropName="file">
                  <Space direction={isMobile ? 'vertical' : 'horizontal'} className="mobile-full-width" style={{ width: '100%' }}>
                    <Upload 
                      name="file" 
                      maxCount={1}
                      className="mobile-full-width"
                      accept=".csv,.xlsx"
                      beforeUpload={() => false}
                      onChange={handleFileChange}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        className="mobile-full-width"
                        size={isMobile ? "large" : "middle"}
                      >
                        选择数据文件（CSV / Excel）
                      </Button>
                    </Upload>
                    <Button 
                      icon={<DownloadOutlined />} 
                      href="/test-data/test_excel.xlsx" 
                      target="_blank" 
                      download
                    >
                      下载示例数据
                    </Button>
                    <Tooltip title="未选择文件时会自动使用示例数据">
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                </Form.Item>

                <Form.Item 
                  wrapperCol={isMobile ? { span: 24 } : { span: 16, offset: 4 }}
                  className="mobile-text-center"
                >
                  <Space 
                    direction={isMobile ? "vertical" : "horizontal"} 
                    size={isMobile ? "middle" : "small"}
                    className="mobile-full-width"
                  >
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={submitting} 
                      disabled={submitting}
                      size={isMobile ? "large" : "middle"}
                      className="mobile-full-width"
                    >
                      提交
                    </Button>
                    <Button 
                      htmlType="reset"
                      size={isMobile ? "large" : "middle"}
                      className="mobile-full-width"
                    >
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>
        <Col span={getColSpan()}>
          <Card title="分析结论" className="mobile-padding">
            {chart?.genResult ?? <div>请先在左侧进行提交</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider />
          <Card title="可视化图表" className="mobile-padding">
            {
              option ? (
                <div className="chart-container">
                  <ReactECharts 
                    option={option} 
                    style={{ 
                      height: isMobile ? '300px' : '400px',
                      width: '100%'
                    }}
                  />
                </div>
              ) : (
                <div>请先在左侧进行提交</div>
              )
            }
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddChart;
