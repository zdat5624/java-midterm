import { Typography, Card, Row, Col } from 'antd';

const { Title } = Typography;

const Dashboard = () => (
    <div>
        <Title level={2}>Dashboard</Title>
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={6}>
                <Card title="Doanh thu tháng" bordered={false}>
                    <p>10,000</p>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
                <Card title="Doanh thu năm" bordered={false}>
                    <p>10,000</p>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
                <Card title="Tổng người dùng" bordered={false}>
                    <p>100</p>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
                <Card title="Đơn hàng chờ" bordered={false}>
                    <p>50</p>
                </Card>
            </Col>
        </Row>
    </div>
);

export default Dashboard;
