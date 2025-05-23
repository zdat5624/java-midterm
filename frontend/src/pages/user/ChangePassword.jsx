import { Typography, Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const ChangePassword = () => {
    const { token, isAuthenticated } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        if (!isAuthenticated) {
            message.error('Vui lòng đăng nhập để đổi mật khẩu!');
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
                {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true,
                }
            );
            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
        } catch (error) {
            message.error('Lỗi khi đổi mật khẩu: ' + (error.response?.data?.message || 'Lỗi server'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Đổi mật khẩu</Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600, margin: '0 auto' }}
            >
                <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>
                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Xác nhận mật khẩu mới" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChangePassword;