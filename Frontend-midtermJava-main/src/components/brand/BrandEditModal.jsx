import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const BrandEditModal = ({ open, brandId, onClose, onBrandUpdated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Fetch brand details for editing
    useEffect(() => {
        if (open && brandId) {
            const fetchBrand = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`/api/brands/${brandId}`);
                    if (response.data.statusCode === 200) {
                        form.setFieldsValue(response.data.data);
                    } else {
                        message.error('Lỗi khi tải thông tin thương hiệu.');
                    }
                } catch (error) {
                    console.error('Error fetching brand:', error);
                    message.error('Lỗi khi tải thông tin thương hiệu.');
                } finally {
                    setLoading(false);
                }
            };
            fetchBrand();
        }
    }, [open, brandId, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await axiosInstance.put(`/api/brands/${brandId}`, values);
            if (response.data.statusCode === 200) {
                message.success('Cập nhật thương hiệu thành công!');
                onBrandUpdated();
                onClose();
                form.resetFields();
            } else {
                message.error('Lỗi khi cập nhật thương hiệu.');
            }
        } catch (error) {
            console.error('Error updating brand:', error);
            message.error('Lỗi khi cập nhật thương hiệu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Sửa thương hiệu"
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
                    label="Tên thương hiệu"
                    rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
                >
                    <Input placeholder="Nhập tên thương hiệu" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BrandEditModal;