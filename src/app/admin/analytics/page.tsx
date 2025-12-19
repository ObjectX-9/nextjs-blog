'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Statistic,
    Row,
    Col,
    Select,
    Button,
    Table,
    Progress,
    Tabs,
    Typography,
    Tag,
    Space,
    Modal,
    Form,
    Input,
    Empty,
    Spin,
} from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    UserOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    GlobalOutlined,
    DesktopOutlined,
    MobileOutlined,
    TabletOutlined,
    PlusOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

interface OverviewData {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    bounceRate: number;
    avgDuration: number;
}

interface DailyStat {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
}

interface StatsData {
    overview: OverviewData;
    dailyStats: DailyStat[];
    topPages: { path: string; views: number; uniqueVisitors: number; avgDuration: number }[];
    topReferrers: { referrer: string; count: number; uniqueVisitors: number }[];
    devices: { device: string; count: number; percentage: number }[];
    browsers: { browser: string; count: number; percentage: number }[];
    countries: { country: string; count: number; percentage: number }[];
    trafficSources: { source: string; count: number; percentage: number }[];
    realtimeCount: { count: number; visitors: any[] };
}

export default function AnalyticsPage() {
    const [range, setRange] = useState('7d');
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/stats?range=${range}`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}秒`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    };

    const trafficSourceLabels: Record<string, string> = {
        direct: '直接访问',
        search: '搜索引擎',
        social: '社交媒体',
        referral: '外部链接',
        email: '邮件',
        paid: '付费广告',
        other: '其他',
    };

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'mobile': return <MobileOutlined />;
            case 'tablet': return <TabletOutlined />;
            default: return <DesktopOutlined />;
        }
    };

    const tabItems = [
        { key: 'overview', label: '概览' },
        { key: 'events', label: '事件' },
        { key: 'funnel', label: '漏斗' },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Title level={2} style={{ margin: 0 }}>数据分析</Title>
                    <Tag color="green" icon={<span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />}>
                        {stats?.realtimeCount.count || 0} 人在线
                    </Tag>
                </div>
                <Space>
                    <Select
                        value={range}
                        onChange={setRange}
                        style={{ width: 120 }}
                        options={[
                            { value: '7d', label: '最近7天' },
                            { value: '30d', label: '最近30天' },
                            { value: '90d', label: '最近90天' },
                        ]}
                    />
                    <Button
                        icon={<ReloadOutlined spin={loading} />}
                        onClick={fetchStats}
                    >
                        刷新
                    </Button>
                </Space>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="mb-6"
            />

            <Spin spinning={loading}>
                {activeTab === 'overview' && stats && (
                    <>
                        {/* 核心指标 */}
                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={12} sm={12} md={8} lg={4}>
                                <Card>
                                    <Statistic
                                        title="页面浏览量"
                                        value={stats.overview.pageViews}
                                        prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={8} lg={4}>
                                <Card>
                                    <Statistic
                                        title="独立访客"
                                        value={stats.overview.uniqueVisitors}
                                        prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={8} lg={4}>
                                <Card>
                                    <Statistic
                                        title="会话数"
                                        value={stats.overview.sessions}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="跳出率"
                                        value={stats.overview.bounceRate}
                                        suffix="%"
                                        prefix={<RiseOutlined style={{ color: '#fa8c16' }} />}
                                        valueStyle={{ color: stats.overview.bounceRate > 70 ? '#cf1322' : undefined }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="平均停留"
                                        value={formatDuration(stats.overview.avgDuration)}
                                        prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* 趋势图 */}
                        <Card title="访问趋势" className="mb-6">
                            <SimpleChart data={stats.dailyStats} />
                        </Card>

                        <Row gutter={[16, 16]}>
                            {/* 热门页面 */}
                            <Col xs={24} lg={12}>
                                <Card title="热门页面" size="small">
                                    <Table
                                        dataSource={stats.topPages}
                                        rowKey="path"
                                        size="small"
                                        pagination={false}
                                        columns={[
                                            {
                                                title: '页面',
                                                dataIndex: 'path',
                                                ellipsis: true,
                                            },
                                            {
                                                title: '浏览',
                                                dataIndex: 'views',
                                                width: 70,
                                                align: 'right',
                                            },
                                            {
                                                title: '访客',
                                                dataIndex: 'uniqueVisitors',
                                                width: 70,
                                                align: 'right',
                                            },
                                        ]}
                                    />
                                </Card>
                            </Col>

                            {/* 流量来源 */}
                            <Col xs={24} lg={12}>
                                <Card title="流量来源" size="small">
                                    <div className="space-y-3">
                                        {stats.trafficSources.map((source, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{trafficSourceLabels[source.source] || source.source}</span>
                                                    <span>{source.percentage}%</span>
                                                </div>
                                                <Progress
                                                    percent={source.percentage}
                                                    showInfo={false}
                                                    strokeColor="#1890ff"
                                                    size="small"
                                                />
                                            </div>
                                        ))}
                                        {stats.trafficSources.length === 0 && <Empty description="暂无数据" />}
                                    </div>
                                </Card>
                            </Col>

                            {/* 设备分布 */}
                            <Col xs={24} sm={12} lg={6}>
                                <Card title="设备分布" size="small">
                                    <div className="space-y-3">
                                        {stats.devices.map((device, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{getDeviceIcon(device.device)} {device.device}</span>
                                                    <span>{device.percentage}%</span>
                                                </div>
                                                <Progress
                                                    percent={device.percentage}
                                                    showInfo={false}
                                                    strokeColor="#52c41a"
                                                    size="small"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>

                            {/* 浏览器分布 */}
                            <Col xs={24} sm={12} lg={6}>
                                <Card title="浏览器分布" size="small">
                                    <div className="space-y-3">
                                        {stats.browsers.map((browser, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{browser.browser}</span>
                                                    <span>{browser.percentage}%</span>
                                                </div>
                                                <Progress
                                                    percent={browser.percentage}
                                                    showInfo={false}
                                                    strokeColor="#722ed1"
                                                    size="small"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>

                            {/* 地区分布 */}
                            <Col xs={24} sm={12} lg={6}>
                                <Card title={<><GlobalOutlined /> 地区分布</>} size="small">
                                    <div className="space-y-3">
                                        {stats.countries.map((country, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{country.country}</span>
                                                    <span>{country.percentage}%</span>
                                                </div>
                                                <Progress
                                                    percent={country.percentage}
                                                    showInfo={false}
                                                    strokeColor="#fa8c16"
                                                    size="small"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>

                            {/* 来源网站 */}
                            <Col xs={24} sm={12} lg={6}>
                                <Card title="来源网站" size="small">
                                    {stats.topReferrers.length > 0 ? (
                                        <div className="space-y-2">
                                            {stats.topReferrers.slice(0, 5).map((ref, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="truncate flex-1 mr-2">{ref.referrer}</span>
                                                    <span className="text-gray-500">{ref.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty description="暂无数据" />
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}

                {activeTab === 'events' && <EventsTab range={range} />}
                {activeTab === 'funnel' && <FunnelTab range={range} />}
            </Spin>
        </div>
    );
}

// 简单图表组件
function SimpleChart({ data }: { data: DailyStat[] }) {
    if (!data || data.length === 0) {
        return <Empty description="暂无数据" />;
    }

    const maxPV = Math.max(...data.map(d => d.pageViews), 1);

    return (
        <div style={{ height: 200 }}>
            <div className="flex items-end justify-between h-full gap-2 px-2" style={{ height: 160 }}>
                {data.map((item, i) => (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full"
                        style={{ minWidth: 30, maxWidth: 80 }}
                    >
                        <span className="text-xs text-gray-500 mb-1">{item.pageViews}</span>
                        <div
                            className="w-full rounded-t transition-all hover:opacity-80"
                            style={{
                                height: `${Math.max((item.pageViews / maxPV) * 100, 5)}%`,
                                backgroundColor: '#1890ff',
                                minHeight: 4,
                            }}
                            title={`${item.date}\nPV: ${item.pageViews}\nUV: ${item.uniqueVisitors}`}
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between gap-2 px-2 mt-2 border-t pt-2">
                {data.map((item, i) => (
                    <div key={i} className="flex-1 text-center" style={{ minWidth: 30, maxWidth: 80 }}>
                        <span className="text-xs text-gray-400">{item.date.slice(5)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 事件 Tab
function EventsTab({ range }: { range: string }) {
    const [events, setEvents] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/analytics/events?range=${range}`)
            .then(res => res.json())
            .then(setEvents)
            .finally(() => setLoading(false));
    }, [range]);

    if (loading) return <Spin />;

    return (
        <Row gutter={[16, 16]}>
            <Col span={24}>
                <Card title={`事件总数: ${events?.total || 0}`}>
                    <Table
                        dataSource={events?.topEvents || []}
                        rowKey={(r: any) => r.eventName + r.eventCategory}
                        size="small"
                        pagination={false}
                        columns={[
                            { title: '事件名称', dataIndex: 'eventName' },
                            { title: '分类', dataIndex: 'eventCategory', render: (v) => <Tag>{v}</Tag> },
                            { title: '触发次数', dataIndex: 'count', align: 'right' },
                            { title: '独立用户', dataIndex: 'uniqueUsers', align: 'right' },
                        ]}
                        locale={{ emptyText: <Empty description="暂无事件数据" /> }}
                    />
                </Card>
            </Col>
            <Col span={24}>
                <Card title="事件分类统计">
                    <Row gutter={16}>
                        {events?.eventCategories?.map((cat: any, i: number) => (
                            <Col key={i} xs={12} sm={8} md={6}>
                                <Card size="small">
                                    <Statistic title={cat._id} value={cat.count} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {(!events?.eventCategories || events.eventCategories.length === 0) && (
                        <Empty description="暂无数据" />
                    )}
                </Card>
            </Col>
        </Row>
    );
}

// 漏斗 Tab
function FunnelTab({ range }: { range: string }) {
    const [funnels, setFunnels] = useState<any[]>([]);
    const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchFunnels = () => {
        fetch('/api/analytics/funnel')
            .then(res => res.json())
            .then(setFunnels)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFunnels();
    }, []);

    useEffect(() => {
        if (selectedFunnel) {
            fetch(`/api/analytics/funnel?id=${selectedFunnel}&range=${range}`)
                .then(res => res.json())
                .then(setAnalysis);
        }
    }, [selectedFunnel, range]);

    const handleCreate = async () => {
        const values = await form.validateFields();
        const steps = values.steps.filter((s: any) => s.name && s.eventName);
        if (steps.length < 2) return;

        await fetch('/api/analytics/funnel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: values.name, steps }),
        });

        setModalOpen(false);
        form.resetFields();
        fetchFunnels();
    };

    if (loading) return <Spin />;

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card
                        title="漏斗列表"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                                创建
                            </Button>
                        }
                    >
                        {funnels.length === 0 ? (
                            <Empty description="暂无漏斗" />
                        ) : (
                            <div className="space-y-2">
                                {funnels.map((funnel: any) => (
                                    <Card
                                        key={funnel._id}
                                        size="small"
                                        hoverable
                                        onClick={() => setSelectedFunnel(funnel._id)}
                                        style={{
                                            borderColor: selectedFunnel === funnel._id ? '#1890ff' : undefined,
                                        }}
                                    >
                                        <div className="font-medium">{funnel.name}</div>
                                        <div className="text-xs text-gray-500">{funnel.steps.length} 个步骤</div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    {analysis ? (
                        <Card title={analysis.funnel.name}>
                            <div className="space-y-4">
                                {analysis.steps.map((step: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1">
                                            <span>
                                                <Tag color="blue">{i + 1}</Tag>
                                                {step.name}
                                            </span>
                                            <span>{step.count} 人 ({step.overallRate}%)</span>
                                        </div>
                                        <Progress
                                            percent={step.overallRate}
                                            showInfo={false}
                                            strokeColor="#1890ff"
                                        />
                                        {i < analysis.steps.length - 1 && (
                                            <div className="text-xs text-gray-400 mt-1 ml-6">
                                                ↓ 转化率 {analysis.steps[i + 1].conversionRate}%
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t text-center">
                                <Statistic
                                    title="总转化率"
                                    value={analysis.totalConversionRate}
                                    suffix="%"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </div>
                        </Card>
                    ) : (
                        <Card>
                            <Empty description="选择一个漏斗查看分析" />
                        </Card>
                    )}
                </Col>
            </Row>

            <Modal
                title="创建漏斗"
                open={modalOpen}
                onOk={handleCreate}
                onCancel={() => setModalOpen(false)}
            >
                <Form form={form} layout="vertical" initialValues={{ steps: [{}, {}] }}>
                    <Form.Item name="name" label="漏斗名称" rules={[{ required: true }]}>
                        <Input placeholder="如：注册转化漏斗" />
                    </Form.Item>
                    <Form.List name="steps">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Row key={field.key} gutter={8}>
                                        <Col span={11}>
                                            <Form.Item {...field} name={[field.name, 'name']}>
                                                <Input placeholder={`步骤${index + 1}名称`} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={11}>
                                            <Form.Item {...field} name={[field.name, 'eventName']}>
                                                <Input placeholder="事件名称" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            {fields.length > 2 && (
                                                <Button type="text" danger onClick={() => remove(field.name)}>
                                                    ×
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                ))}
                                <Button type="dashed" onClick={() => add()} block>
                                    + 添加步骤
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </>
    );
}
