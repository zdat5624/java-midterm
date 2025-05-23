import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const CategoryCreateModal = ({ open, onClose, onCategoryCreated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await axiosInstance.post('/api/categories', values);
            if (response.data.statusCode === 201) {
                message.success('Tạo danh mục thành công!');
                onCategoryCreated();
                onClose();
                form.resetFields();
            } else {
                message.error('Lỗi khi tạo danh mục.');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            message.error('Lỗi khi tạo danh mục.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo danh mục mới"
            open={open}
            onOk={handleSubmit}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            okText="Tạo"
            cancelText="Hủy"
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryCreateModal;