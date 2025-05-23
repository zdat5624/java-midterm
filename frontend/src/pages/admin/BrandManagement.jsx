import { useState, useEffect } from 'react';
import { Typography, Table, Button, message, Space, Tooltip, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, TrademarkOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import BrandDetailModal from '../../components/brand/BrandDetailModal';
import BrandEditModal from '../../components/brand/BrandEditModal';
import BrandCreateModal from '../../components/brand/BrandCreateModal';

const { Title } = Typography;

const BrandManagement = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: ['6', '12', '24'],
        showSizeChanger: true,
    });
    const [selectedBrandId, setSelectedBrandId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Fetch brands
    const fetchBrands = async (page = 1, pageSize = 6, sort = 'id,asc') => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/brands/paged', {
                params: {
                    page: page - 1,
                    size: pageSize,
                    sort: sort,
                },
            });
            if (response.data.statusCode === 200) {
                setBrands(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                });
            } else {
                message.error('Lỗi khi tải danh sách thương hiệu.');
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            message.error('Lỗi khi tải danh sách thương hiệu.');
        } finally {
            setLoading(false);
        }
    };

    // Handle table change
    const handleTableChange = (newPagination, _, sorter) => {
        const newSort = sorter.order
            ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
            : 'id,asc';
        fetchBrands(newPagination.current, newPagination.pageSize, newSort);
        setPagination(newPagination);
    };

    // Handle view brand
    const handleViewBrand = (brandId) => {
        setSelectedBrandId(brandId);
        setIsDetailModalOpen(true);
    };

    // Handle edit brand
    const handleEditBrand = (brandId) => {
        setSelectedBrandId(brandId);
        setIsEditModalOpen(true);
    };

    const handleDeleteBrand = (brandId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa thương hiệu này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await axiosInstance.delete(`/api/brands/${brandId}`);
                    if (response.status === 204) {
                        message.success('Xóa thương hiệu thành công!');
                        // Check if the current page will be empty after deletion
                        const isLastItemOnPage = brands.length === 1 && pagination.total > 0;
                        const newPage = isLastItemOnPage && pagination.current > 1
                            ? pagination.current - 1
                            : pagination.current;
                        fetchBrands(newPage, pagination.pageSize);
                    } else {
                        message.error('Lỗi khi xóa thương hiệu.');
                    }
                } catch (error) {
                    console.error('Error deleting brand:', error);
                    message.error('Lỗi khi xóa thương hiệu.');
                }
            },
        });
    };

    // Fetch brands on mount
    useEffect(() => {
        fetchBrands(pagination.current, pagination.pageSize);
    }, []);

    const columns = [
        { title: 'Mã', dataIndex: 'id', key: 'id', sorter: true },
        { title: 'Tên thương hiệu', dataIndex: 'name', key: 'name', sorter: true },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleViewBrand(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleEditBrand(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteBrand(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <TrademarkOutlined className="mr-2" /> Quản lý thương hiệu
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Tạo mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={brands}
                rowKey="id"
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            <BrandDetailModal
                open={isDetailModalOpen}
                brandId={selectedBrandId}
                onClose={() => setIsDetailModalOpen(false)}
            />

            <BrandEditModal
                open={isEditModalOpen}
                brandId={selectedBrandId}
                onClose={() => setIsEditModalOpen(false)}
                onBrandUpdated={() => fetchBrands(pagination.current, pagination.pageSize)}
            />

            <BrandCreateModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onBrandCreated={() => fetchBrands(pagination.current, pagination.pageSize)}
            />
        </div>
    );
};

export default BrandManagement;