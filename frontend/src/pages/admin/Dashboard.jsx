import { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../api/axiosConfig';
import { DashboardOutlined } from '@ant-design/icons';
const { Title } = Typography;

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Gọi API để lấy dữ liệu dashboard
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/admin/dashboard');
                if (response.data.statusCode === 200) {
                    setDashboardData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Hàm định dạng số tiền
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Lấy tháng hiện tại (từ 1-12)
    const currentMonth = new Date().getMonth() + 1; // getMonth() trả về 0-11, cộng 1 để thành 1-12

    // Lọc dữ liệu biểu đồ: chỉ giữ các tháng từ 1 đến tháng hiện tại
    const chartData = (dashboardData?.yearlyRevenueChart || []).filter(
        (item) => item.month <= currentMonth
    );

    return (
        <div>
            <Title level={2}><DashboardOutlined className='mr-2' />Dashboard</Title>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {/* Thống kê */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Doanh thu tháng" bordered={false}>
                                <p>{dashboardData ? formatCurrency(dashboardData.currentMonthRevenue) : '0'}</p>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Doanh thu năm" bordered={false}>
                                <p>{dashboardData ? formatCurrency(dashboardData.currentYearRevenue) : '0'}</p>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Tổng người dùng" bordered={false}>
                                <p>{dashboardData ? dashboardData.totalUsers : '0'}</p>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card title="Đơn hàng chờ" bordered={false}>
                                <p>{dashboardData ? dashboardData.pendingOrders : '0'}</p>
                            </Card>
                        </Col>
                    </Row>

                    {/* Biểu đồ doanh thu năm hiện tại */}
                    <Card title="Biểu đồ doanh thu năm hiện tại" bordered={false}>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    label={{ value: 'Tháng', position: 'insideBottomRight', offset: -10 }}
                                    tickFormatter={(month) => `Th${month}`}
                                />
                                <YAxis
                                    label={{
                                        value: 'Doanh thu (VND)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        dx: -5,
                                        dy: 50,
                                    }}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)} // Định dạng giá trị doanh thu
                                    labelFormatter={(label) => `Tháng ${label}`} // Định dạng nhãn thành "Tháng 3"
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#1890ff" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;