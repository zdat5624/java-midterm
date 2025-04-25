import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Home = () => (
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 128px)',
            textAlign: 'center',
            padding: '0 16px',
        }}
    >
        <Title level={2}>Welcome to Shop MVP</Title>
        <Paragraph>Explore our wide range of products!</Paragraph>
    </div>
);

export default Home;