import { genChartByAiUsingPost } from '@/services/bi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload} from 'antd';
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
  const { isMobile, isTablet } = useResponsive();

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);
    // 对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try {
      const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功');
        const chartOption = JSON.parse(res.data.genChart ?? '');
        if (!chartOption) {
          throw new Error('图表代码解析错误')
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

  // 响应式表单标签配置
  const getFormLabelCol = () => {
    if (isMobile) return { span: 24 };
    if (isTablet) return { span: 6 };
    return { span: 4 };
  };

  const getFormWrapperCol = () => {
    if (isMobile) return { span: 24 };
    if (isTablet) return { span: 18 };
    return { span: 16 };
  };

  return (
    <div className="add-chart">
      <Row gutter={isMobile ? 16 : 24}>
        <Col span={getColSpan()}>
          <Card title="智能分析" className="mobile-padding">
            <Form 
              name="addChart" 
              labelAlign={isMobile ? "left" : "left"}
              labelCol={getFormLabelCol()}
              wrapperCol={getFormWrapperCol()}
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
              <Form.Item name="file" label="原始数据">
                <Upload 
                  name="file" 
                  maxCount={1}
                  className="mobile-full-width"
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    className="mobile-full-width"
                    size={isMobile ? "large" : "middle"}
                  >
                    上传 CSV 文件
                  </Button>
                </Upload>
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
