import { useState, useEffect } from 'react';
import { Modal, Descriptions, message } from 'antd';
import axiosInstance from '../../api/axiosConfig';

const BrandDetailModal = ({ open, brandId, onClose }) => {
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch brand details
    useEffect(() => {
        if (open && brandId) {
            const fetchBrand = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`/api/brands/${brandId}`);
                    if (response.data.statusCode === 200) {
                        setBrand(response.data.data);
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
    }, [open, brandId]);

    return (
        <Modal
            title="Chi tiết thương hiệu"
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
        >
            {loading ? (
                <div>Đang tải...</div>
            ) : brand ? (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Mã">{brand.id}</Descriptions.Item>
                    <Descriptions.Item label="Tên thương hiệu">{brand.name}</Descriptions.Item>
                </Descriptions>
            ) : (
                <div>Không có dữ liệu</div>
            )}
        </Modal>
    );
};

export default BrandDetailModal;