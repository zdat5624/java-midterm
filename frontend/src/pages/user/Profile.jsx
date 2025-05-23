import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, Select, message, Upload, Avatar, Spin } from 'antd';
import { BellOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const Profile = () => {
    const [form] = Form.useForm();
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newAvatar, setNewAvatar] = useState(null);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await axiosInstance.get(`/api/users/${user.id}`);
                const userData = response.data.data;
                form.setFieldsValue({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    gender: userData.gender,
                    address: userData.address,
                });
                if (userData.avatar) {
                    setAvatarUrl(`${import.meta.env.VITE_UPLOADS_URL}/${userData.avatar}`);
                }
            } catch (error) {
                message.error('Không thể tải thông tin hồ sơ');
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, [isAuthenticated, user, form, navigate, isLoading]);

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await axiosInstance.post('/api/upload/img', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.statusCode === 201 && response.data.data.uploaded.length > 0) {
                const uploadedFileName = response.data.data.uploaded[0];
                setNewAvatar(uploadedFileName);
                setAvatarUrl(`${import.meta.env.VITE_UPLOADS_URL}/${uploadedFileName}`);
                return true;
            } else {
                message.error('Tải ảnh lên thất bại');
                return false;
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi khi tải ảnh lên');
            return false;
        }
    };

    const handleChange = ({ file, fileList }) => {
        setFileList(fileList);
        if (file.status === 'done') {
            setFileList([]);
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Vui lòng chọn file ảnh!');
            return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return false;
        }
        return true;
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const updatedAvatar = newAvatar || (avatarUrl ? avatarUrl.split('/').pop() : 'avatar-default.webp');
            const updateData = {
                id: user.id,
                name: values.name,
                gender: values.gender,
                phone: values.phone,
                address: values.address,
                avatar: updatedAvatar,
            };

            const response = await axiosInstance.put('/api/users/update-profile', updateData);
            if (response.status === 200) {
                message.success('Cập nhật hồ sơ thành công');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Spin tip="Đang kiểm tra xác thực..." size="large" />
            </div>
        );
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-100 py-4 px-4">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
                <Title level={2} className="text-center text-gray-800 mb-6 flex items-center justify-center">
                    <UserOutlined className="mr-2 " />
                    Thông tin cá nhân
                </Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        name: '',
                        email: '',
                        phone: '',
                        gender: null,
                        address: '',
                    }}
                    className="space-y-4"
                >
                    <Form.Item className="mb-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                {avatarUrl ? (
                                    <Avatar
                                        src={avatarUrl}
                                        alt="Avatar"
                                        size={120}
                                        className="border-2 border-gray-200 rounded-full"
                                    />
                                ) : (
                                    <Avatar
                                        size={120}
                                        icon={<UserOutlined />}
                                        className="border-2 border-gray-200 rounded-full bg-gray-200"
                                    />
                                )}
                                <Upload
                                    fileList={fileList}
                                    customRequest={({ file, onSuccess, onError }) => {
                                        handleUpload(file).then((success) => {
                                            if (success) {
                                                onSuccess('ok');
                                            } else {
                                                onError('error');
                                            }
                                        });
                                    }}
                                    onChange={handleChange}
                                    beforeUpload={beforeUpload}
                                    accept="image/*"
                                    showUploadList={false}
                                >
                                    <Button
                                        title="Tải lên ảnh đại diện"
                                        icon={<UploadOutlined />}
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-none hover:bg-blue-700"
                                    />
                                </Upload>
                            </div>
                        </div>
                    </Form.Item>
                    <Form.Item
                        label="Tên"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên' },
                            { min: 5, message: 'Tên phải có ít nhất 5 ký tự' },
                            { max: 50, message: 'Tên không được vượt quá 50 ký tự' },
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên của bạn"
                            className="rounded-md border-gray-300 focus:border-blue-600"
                        />
                    </Form.Item>
                    <Form.Item label="Email" name="email">
                        <Input
                            placeholder="Nhập email của bạn"
                            disabled
                            className="rounded-md border-gray-300 bg-gray-50"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            {
                                pattern: /^(\+84|0)[0-9]{9,10}$/,
                                message: 'Định dạng số điện thoại không hợp lệ',
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại"
                            className="rounded-md border-gray-300 focus:border-blue-600"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                    >
                        <Select
                            placeholder="Chọn giới tính"
                            className="rounded-md"
                        >
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address">
                        <Input
                            placeholder="Nhập địa chỉ của bạn"
                            className="rounded-md border-gray-300 focus:border-blue-600"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 rounded-md h-10"
                        >
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Profile;