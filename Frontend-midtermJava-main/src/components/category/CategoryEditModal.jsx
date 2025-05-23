import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const CategoryEditModal = ({ open, categoryId, onClose, onCategoryUpdated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Fetch category details for editing
    useEffect(() => {
        if (open && categoryId) {
            const fetchCategory = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`/api/categories/${categoryId}`);
                    if (response.data.statusCode === 200) {
                        form.setFieldsValue(response.data.data);
                    } else {
                        message.error('Lỗi khi tải thông tin danh mục.');
                    }
                } catch (error) {
                    console.error('Error fetching category:', error);
                    message.error('Lỗi khi tải thông tin danh mục.');
                } finally {
                    setLoading(false);
                }
            };
            fetchCategory();
        }
    }, [open, categoryId, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await axiosInstance.put(`/api/categories/${categoryId}`, values);
            if (response.data.statusCode === 200) {
                message.success('Cập nhật danh mục thành công!');
                onCategoryUpdated();
                onClose();
                form.resetFields();
            } else {
                message.error('Lỗi khi cập nhật danh mục.');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            message.error('Lỗi khi cập nhật danh mục.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Sửa danh mục"
            open={open}
            onOk={handleSubmit}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            okText="Cập nhật"
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

export default CategoryEditModal;