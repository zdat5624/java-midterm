import { Typography, Input, Select, Button, Card, Row, Col } from 'antd';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductList = () => (
    <div>
        <Title level={2}>Products</Title>
        <div className="mb-4">
            <Search placeholder="Search products" />
            <Select placeholder="Category" >
                <Option value="electronics">Electronics</Option>
                <Option value="clothing">Clothing</Option>
            </Select>
            <Select placeholder="Brand">
                <Option value="apple">Apple</Option>
                <Option value="samsung">Samsung</Option>
            </Select>
            <Button type="primary">Filter</Button>
        </div>
        <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((item) => (
                <Col span={6} key={item}>
                    <Card title={`Product ${item}`} cover={<img alt="example" src="https://via.placeholder.com/150" />}>
                        <p>Price: $99.99</p>
                        <Button type="primary">View</Button>
                    </Card>
                </Col>
            ))}
        </Row>
    </div>
);

export default ProductList;