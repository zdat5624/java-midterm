import { useState, useEffect } from 'react';
import { Typography, Table, Button, message, Space, Tooltip, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, AppstoreAddOutlined, TagsOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';
import CategoryDetailModal from '../../components/category/CategoryDetailModal';
import CategoryEditModal from '../../components/category/CategoryEditModal';
import CategoryCreateModal from '../../components/category/CategoryCreateModal';

const { Title } = Typography;

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
        pageSizeOptions: ['6', '12', '24'],
        showSizeChanger: true,
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Fetch categories
    const fetchCategories = async (page = 1, pageSize = 6, sort = 'id,asc') => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/categories/paged', {
                params: {
                    page: page - 1,
                    size: pageSize,
                    sort: sort,
                },
            });
            if (response.data.statusCode === 200) {
                setCategories(response.data.data.content);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize: response.data.data.size,
                    total: response.data.data.totalElements,
                });
            } else {
                message.error('Lỗi khi tải danh sách danh mục.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Lỗi khi tải danh sách danh mục.');
        } finally {
            setLoading(false);
        }
    };

    // Handle table change
    const handleTableChange = (newPagination, _, sorter) => {
        const newSort = sorter.order
            ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}`
            : 'id,asc';
        fetchCategories(newPagination.current, newPagination.pageSize, newSort);
        setPagination(newPagination);
    };

    // Handle view category
    const handleViewCategory = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsDetailModalOpen(true);
    };

    // Handle edit category
    const handleEditCategory = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setIsEditModalOpen(true);
    };

    // Handle delete category
    const handleDeleteCategory = (categoryId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa danh mục này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await axiosInstance.delete(`/api/categories/${categoryId}`);
                    if (response.status === 204) {
                        message.success('Xóa danh mục thành công!');
                        fetchCategories(pagination.current, pagination.pageSize);
                    } else {
                        message.error('Lỗi khi xóa danh mục.');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    message.error('Lỗi khi xóa danh mục.');
                }
            },
        });
    };

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories(pagination.current, pagination.pageSize);
    }, []);

    const columns = [
        { title: 'Mã', dataIndex: 'id', key: 'id', sorter: true },
        { title: 'Tên danh mục', dataIndex: 'name', key: 'name', sorter: true },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleViewCategory(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleEditCategory(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteCategory(record.id)}
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
                    <TagsOutlined className="mr-2" />Quản lý danh mục
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
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: pagination.pageSizeOptions,
                    showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]} trên ${total} danh mục`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
            />

            <CategoryDetailModal
                open={isDetailModalOpen}
                categoryId={selectedCategoryId}
                onClose={() => setIsDetailModalOpen(false)}
            />

            <CategoryEditModal
                open={isEditModalOpen}
                categoryId={selectedCategoryId}
                onClose={() => setIsEditModalOpen(false)}
                onCategoryUpdated={() => fetchCategories(pagination.current, pagination.pageSize)}
            />

            <CategoryCreateModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCategoryCreated={() => fetchCategories(pagination.current, pagination.pageSize)}
            />
        </div>
    );
};

export default CategoryManagement;