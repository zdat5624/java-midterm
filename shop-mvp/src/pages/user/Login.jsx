import { Typography, Form, Input, Button, message, Card, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();



    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: values.email,
                password: values.password,
            });

            if (response.data.statusCode === 200) {
                const { accessToken, user } = response.data.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                console.log('user:', localStorage.getItem('user')); // Debug
                console.log('Calling message.success'); // Debug
                message.success('Đăng nhập thành công!', 2, () => {
                    if (user.role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                });
            } else {
                message.error(response.data.message || 'Đăng nhập thất bại!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f0f5ff', // Màu nền nhẹ nhàng, thay thế bg-gray-100
            }}
        >
            <Card
                style={{
                    width: 400, // Thay thế w-96
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Thay thế shadow-md
                    borderRadius: 8, // Thay thế rounded
                }}
                bodyStyle={{
                    padding: 32, // Thay thế p-8
                }}
            >
                <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                    Đăng Nhập
                </Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" block htmlType="submit" loading={loading}>
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Space
                            direction="vertical"
                            style={{ width: '100%', textAlign: 'center' }}
                        >
                            <Link to="/forgot-password">Forgot Password?</Link>
                            <Button
                                onClick={() => message.success('Test message!')}
                                style={{ marginTop: 16 }}
                            >
                                Test Message
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;