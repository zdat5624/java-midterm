import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, InputNumber, message, Upload, Image } from 'antd';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosConfig';

const { Option } = Select;
const { TextArea } = Input;

const ProductEditModal = ({ open, productId, onClose, onProductUpdated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // Gọi API để lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/categories/paged', {
                params: { page: 0, size: 100, sort: 'id,asc' },
            });
            if (response.data.statusCode === 200) {
                setCategories(response.data.data.content);
            } else {
                message.error('Không thể tải danh sách danh mục.');
            }
        } catch (err) {
            console.error('Lỗi khi lấy danh mục:', err);
            message.error('Đã xảy ra lỗi khi tải danh sách danh mục.');
        }
    };

    // Gọi API để lấy danh sách thương hiệu
    const fetchBrands = async () => {
        try {
            const response = await axiosInstance.get('/api/brands/paged', {
                params: { page: 0, size: 100, sort: 'id,asc' },
            });
            if (response.data.statusCode === 200) {
                setBrands(response.data.data.content);
            } else {
                message.error('Không thể tải danh sách thương hiệu.');
            }
        } catch (err) {
            console.error('Lỗi khi lấy thương hiệu:', err);
            message.error('Đã xảy ra lỗi khi tải danh sách thương hiệu.');
        }
    };

    // Gọi API để lấy thông tin sản phẩm
    const fetchProductDetails = async () => {
        if (!productId) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/products/${productId}`);
            if (response.data.statusCode === 200) {
                const productData = response.data.data;
                setProduct(productData);

                // Ánh xạ brand và category thành brandId và categoryId
                const selectedBrand = brands.find((b) => b.name === productData.brand);
                const selectedCategory = categories.find((c) => c.name === productData.category);

                form.setFieldsValue({
                    name: productData.name,
                    price: productData.price,
                    brandId: selectedBrand ? selectedBrand.id : undefined,
                    categoryId: selectedCategory ? selectedCategory.id : undefined,

                    shortDescription: productData.shortDescription,
                    detailedDescription: productData.detailedDescription,
                });

                // Hiển thị hình ảnh hiện tại
                if (productData.images && productData.images.length > 0) {
                    const urls = productData.images.map((img) => `${import.meta.env.VITE_UPLOADS_URL}/${img}`);
                    setImageUrls(urls);
                }
            } else {
                message.error('Không thể tải thông tin sản phẩm.');
            }
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
            message.error('Đã xảy ra lỗi khi tải thông tin sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi modal mở
    useEffect(() => {
        if (open && productId) {
            fetchCategories();
            fetchBrands();
            fetchProductDetails();
        }
        // Reset khi Modal đóng
        if (!open) {
            setProduct(null);
            setFileList([]);
            setImageUrls([]);
            form.resetFields();
        }
    }, [open, productId, form]);

    // Cập nhật form khi brands hoặc categories thay đổi
    useEffect(() => {
        if (product && brands.length > 0 && categories.length > 0) {
            const selectedBrand = brands.find((b) => b.name === product.brand);
            const selectedCategory = categories.find((c) => c.name === product.category);
            form.setFieldsValue({
                brandId: selectedBrand ? selectedBrand.id : undefined,
                categoryId: selectedCategory ? selectedCategory.id : undefined,
            });
        }
    }, [brands, categories, product, form]);

    // Xử lý upload hình ảnh
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
                setImageUrls((prev) => [...prev, `${import.meta.env.VITE_UPLOADS_URL}/${uploadedFileName}`]);
                return uploadedFileName;
            } else {
                message.error('Tải hình ảnh lên thất bại.');
                return false;
            }
        } catch (err) {
            console.error('Lỗi khi tải hình ảnh:', err);
            message.error('Đã xảy ra lỗi khi tải hình ảnh lên.');
            return false;
        }
    };

    // Xử lý thay đổi file trong Upload
    const handleChange = ({ fileList }) => {
        setFileList(fileList);
    };

    // Xử lý trước khi upload
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

    // Xử lý xóa hình ảnh
    const handleRemoveImage = (index) => {
        setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    // Xử lý di chuyển hình ảnh lên trên
    const moveImageUp = (index) => {
        if (index === 0) return;
        setImageUrls((prev) => {
            const newUrls = [...prev];
            [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
            return newUrls;
        });
    };

    // Xử lý di chuyển hình ảnh xuống dưới
    const moveImageDown = (index) => {
        if (index === imageUrls.length - 1) return;
        setImageUrls((prev) => {
            const newUrls = [...prev];
            [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
            return newUrls;
        });
    };

    // Xử lý cập nhật sản phẩm
    const handleUpdateProduct = async (values) => {
        try {
            setLoading(true);
            const images = imageUrls.map((url) => url.split('/').pop());
            const response = await axiosInstance.put(`/api/products/${productId}`, {
                name: values.name,
                price: values.price,
                brandId: values.brandId,
                categoryId: values.categoryId,
                shortDescription: values.shortDescription,
                detailedDescription: values.detailedDescription,
                images: images.length > 0 ? images : product?.images || [],
            });
            if (response.data.statusCode === 200) {
                message.success('Cập nhật sản phẩm thành công!');
                onProductUpdated();
                onClose();
            } else {
                message.error('Cập nhật sản phẩm thất bại.');
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            message.error('Đã xảy ra lỗi khi cập nhật sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa sản phẩm"
            open={open}
            onCancel={onClose}
            centered
            width={800}
            styles={{ body: { padding: '16px' } }}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={() => form.submit()}
                >
                    Lưu
                </Button>,
            ]}
        >
            {loading && <div>Đang tải...</div>}
            {!loading && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateProduct}
                    disabled={loading}
                >
                    <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Giá"
                        rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    >
                        <InputNumber min={0} step={1000} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="brandId"
                        label="Thương hiệu"
                        rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
                    >
                        <Select placeholder="Chọn thương hiệu">
                            {brands.map((brand) => (
                                <Option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="categoryId"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="shortDescription"
                        label="Mô tả ngắn"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="detailedDescription"
                        label="Mô tả chi tiết"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label="Hình ảnh">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, minHeight: 120 }}>
                            {imageUrls.length > 0 ? (
                                imageUrls.map((url, index) => (
                                    <div
                                        key={url}
                                        style={{
                                            position: 'relative',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: 4,
                                            padding: 4,
                                            backgroundColor: 'transparent',
                                        }}
                                    >
                                        <Image
                                            src={url}
                                            alt={`Hình ảnh ${index}`}
                                            width={100}
                                            height={100}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column' }}>
                                            <Button
                                                type="link"
                                                icon={<ArrowUpOutlined />}
                                                onClick={() => moveImageUp(index)}
                                                disabled={index === 0}
                                            />
                                            <Button
                                                type="link"
                                                icon={<ArrowDownOutlined />}
                                                onClick={() => moveImageDown(index)}
                                                disabled={index === imageUrls.length - 1}
                                            />
                                        </div>
                                        <div style={{ position: 'absolute', top: 0, right: 0 }}>
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#888', padding: '16px' }}>
                                    Chưa có hình ảnh nào được tải lên.
                                </div>
                            )}
                        </div>
                        <Upload
                            fileList={fileList}
                            customRequest={async ({ file, onSuccess, onError }) => {
                                const uploadedFileName = await handleUpload(file);
                                if (uploadedFileName) {
                                    onSuccess('ok');
                                } else {
                                    onError('error');
                                }
                            }}
                            onChange={handleChange}
                            beforeUpload={beforeUpload}
                            accept="image/*"
                            multiple
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default ProductEditModal;