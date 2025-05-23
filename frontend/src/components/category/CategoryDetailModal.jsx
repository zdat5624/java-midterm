import { useState, useEffect } from 'react';
import { Modal, Descriptions, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const CategoryDetailModal = ({ open, categoryId, onClose }) => {
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch category details
    useEffect(() => {
        if (open && categoryId) {
            const fetchCategory = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`/api/categories/${categoryId}`);
                    if (response.data.statusCode === 200) {
                        setCategory(response.data.data);
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
    }, [open, categoryId]);

    return (
        <Modal
            title="Chi tiết danh mục"
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
        >
            {loading ? (
                <div>Đang tải...</div>
            ) : category ? (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Mã">{category.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên danh mục">{category.name}</Descriptions.Item>
                </Descriptions>
            ) : (
                <div>Không có dữ liệu</div>
            )}
        </Modal>
    );
};

export default CategoryDetailModal;