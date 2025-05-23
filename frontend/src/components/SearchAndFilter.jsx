import { Typography, Input, Radio, Slider, Button, Divider, Spin, Tooltip, Select } from 'antd';
import { SearchOutlined, TagsOutlined, ShopOutlined, DollarOutlined, SortAscendingOutlined, FilterOutlined, RedoOutlined, TrademarkOutlined } from '@ant-design/icons';
import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { useAuth } from '../pages/contexts/AuthContext';
import { message } from 'antd';

// Custom equality function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
    const isEqual = (
        prevProps.categoryId === nextProps.categoryId &&
        prevProps.brandId === nextProps.brandId &&
        prevProps.name === nextProps.name &&
        prevProps.priceRange[0] === nextProps.priceRange[0] &&
        prevProps.priceRange[1] === nextProps.priceRange[1] &&
        prevProps.sort === nextProps.sort &&
        prevProps.loading === nextProps.loading &&
        prevProps.searchInput === nextProps.searchInput &&
        prevProps.handleSearchChange === nextProps.handleSearchChange &&
        prevProps.handleCategoryChange === nextProps.handleCategoryChange &&
        prevProps.handleBrandChange === nextProps.handleBrandChange &&
        prevProps.handlePriceRangeChange === nextProps.handlePriceRangeChange &&
        prevProps.handleResetPrice === nextProps.handleResetPrice &&
        prevProps.handleResetAll === nextProps.handleResetAll &&
        prevProps.setSort === nextProps.setSort &&
        prevProps.fetchProducts === nextProps.fetchProducts &&
        prevProps.searchInputRef === nextProps.searchInputRef
    );
    console.log('SearchAndFilter arePropsEqual:', isEqual, { prevProps, nextProps });
    return isEqual;
};

const { Search } = Input;

const SearchAndFilter = ({
    categoryId,
    brandId,
    name,
    priceRange,
    sort,
    setSort,
    loading,
    searchInput,
    handleSearchChange,
    handleCategoryChange,
    handleBrandChange,
    handlePriceRangeChange,
    handleResetPrice,
    handleResetAll,
    fetchProducts,
    searchInputRef,
}) => {
    console.log('SearchAndFilter rendered');
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [brandsLoading, setBrandsLoading] = useState(false);

    // Fetch categories
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/paged`, {
                params: { page: 0, size: 100, sort: 'id,asc' },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            if (response.data.statusCode === 200) {
                setCategories(response.data.data.content);
            } else {
                message.error('Lỗi khi tải danh sách danh mục.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Lỗi khi tải danh mục.');
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch brands
    const fetchBrands = async () => {
        setBrandsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/brands/paged`, {
                params: { page: 0, size: 100, sort: 'id,asc' },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                withCredentials: true,
            });
            if (response.data.statusCode === 200) {
                setBrands(response.data.data.content);
            } else {
                message.error('Lỗi khi tải danh sách thương hiệu.');
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            message.error('Lỗi khi tải thương hiệu.');
        } finally {
            setBrandsLoading(false);
        }
    };

    // Fetch categories and brands on mount
    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                    <FilterOutlined className="mr-2" /> Bộ lọc
                </h3>
                <Tooltip title="Đặt lại tất cả bộ lọc">
                    <Button
                        type="link"
                        onClick={handleResetAll}
                        className="text-blue-500 hover:text-blue-600 p-0"
                        icon={<RedoOutlined />}
                    />
                </Tooltip>
            </div>
            <Divider className="my-4" />
            <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center">
                    <SearchOutlined className="mr-2" /> Tìm kiếm
                </h4>
                <Search
                    ref={searchInputRef}
                    size="large"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchInput}
                    onChange={(e) => {
                        console.log('Search onChange:', e.target.value);
                        handleSearchChange(e.target.value, false);
                    }}
                    onSearch={(value) => {
                        console.log('Search onSearch:', value);
                        handleSearchChange(value, true);
                    }}
                    allowClear
                    enterButton
                    className="rounded-lg"
                    disabled={loading}
                />
            </div>
            <Divider className="my-4" />
            <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center">
                    <TagsOutlined className="mr-2" /> Danh mục
                </h4>
                <Spin spinning={categoriesLoading}>
                    <Radio.Group
                        value={categoryId}
                        onChange={handleCategoryChange}
                        className="flex flex-col space-y-2"
                        disabled={categoriesLoading || loading}
                    >
                        <Radio value={null}>Tất cả</Radio>
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <Radio key={category.id} value={category.id}>
                                    {category.name}
                                </Radio>
                            ))
                        ) : (
                            <div className="text-gray-500">Không có danh mục</div>
                        )}
                    </Radio.Group>
                </Spin>
            </div>
            <Divider className="my-4" />
            <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center">
                    <TrademarkOutlined className="mr-2" /> Thương hiệu
                </h4>
                <Spin spinning={brandsLoading}>
                    <Radio.Group
                        value={brandId}
                        onChange={handleBrandChange}
                        className="flex flex-col space-y-2"
                        disabled={brandsLoading || loading}
                    >
                        <Radio value={null}>Tất cả</Radio>
                        {brands.length > 0 ? (
                            brands.map((brand) => (
                                <Radio key={brand.id} value={brand.id}>
                                    {brand.name}
                                </Radio>
                            ))
                        ) : (
                            <div className="text-gray-500">Không có thương hiệu</div>
                        )}
                    </Radio.Group>
                </Spin>
            </div>
            <Divider className="my-4" />
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium flex items-center">
                        <DollarOutlined className="mr-2" /> Khoảng giá (triệu VNĐ)
                    </h4>
                    <Tooltip title="Đặt lại">
                        <Button
                            type="link"
                            onClick={handleResetPrice}
                            className="text-blue-500 hover:text-blue-600 p-0"
                            icon={<RedoOutlined />}
                        />
                    </Tooltip>
                </div>
                <Slider
                    range
                    min={0}
                    max={150}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    tooltip={{ formatter: (value) => `${value} triệu` }}
                    disabled={loading}
                />
                <div className="flex justify-between text-sm text-gray-600">
                    <span>{priceRange[0]} triệu</span>
                    <span>{priceRange[1]} triệu</span>
                </div>
            </div>
            <Divider className="my-4" />
            <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center">
                    <SortAscendingOutlined className="mr-2" /> Sắp xếp
                </h4>
                <Select
                    size="large"
                    value={sort}
                    onChange={setSort}
                    className="w-full rounded-lg"
                    disabled={loading}
                >
                    <Select.Option value="price,desc">Giá: Cao đến thấp</Select.Option>
                    <Select.Option value="price,asc">Giá: Thấp đến cao</Select.Option>
                    <Select.Option value="name,asc">Tên: A-Z</Select.Option>
                    <Select.Option value="name,desc">Tên: Z-A</Select.Option>
                </Select>
            </div>
            <Divider className="my-4" />
            <Button
                type="primary"
                size="large"
                onClick={fetchProducts}
                className="w-full bg-blue-500 hover:bg-blue-600"
                loading={loading}
            >
                Áp dụng bộ lọc
            </Button>
        </div>
    );
};

export default memo(SearchAndFilter, arePropsEqual);