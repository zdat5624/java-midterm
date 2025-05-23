import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const BrandCreateModal = ({ open, onClose, onBrandCreated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await axiosInstance.post('/api/brands', values);
            if (response.data.statusCode === 201) {
                message.success('Tạo thương hiệu thành công!');
                onBrandCreated();
                onClose();
                form.resetFields();
            } else {
                message.error('Lỗi khi tạo thương hiệu.');
            }
        } catch (error) {
            console.error('Error creating brand:', error);
            message.error('Lỗi khi tạo thương hiệu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo thương hiệu mới"
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
                    label="Tên thương hiệu"
                    rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
                >
                    <Input placeholder="Nhập tên thương hiệu" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BrandCreateModal;