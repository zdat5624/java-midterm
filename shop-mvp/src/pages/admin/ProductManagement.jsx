import { Typography, Table, Button, Input } from 'antd';

const { Title } = Typography;
const { Search } = Input;

const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
        title: 'Action', key: 'action', render: () => (
            <>
                <Button type="link">Edit</Button>
                <Button type="link" danger>Delete</Button>
            </>
        )
    },
];

const data = [
    { key: '1', id: '1', name: 'iPhone 13', price: '$799.99', category: 'Electronics' },
];

const ProductManagement = () => (
    <div>
        <Title level={2}>Product Management</Title>
        <div className="mb-4 flex gap-4">
            <Search placeholder="Search products" style={{ width: 300 }} />
            <Button type="primary">Add Product</Button>
        </div>
        <Table columns={columns} dataSource={data} />
    </div>
);

export default ProductManagement;