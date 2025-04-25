import { Typography, Form, Input, Button, Select } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Profile = () => (
    <div>
        <Title level={2}>Your Profile</Title>
        <Form layout="vertical">
            <Form.Item label="Name">
                <Input placeholder="Enter your name" />
            </Form.Item>
            <Form.Item label="Email">
                <Input placeholder="Enter your email" disabled />
            </Form.Item>
            <Form.Item label="Phone">
                <Input placeholder="Enter your phone" />
            </Form.Item>
            <Form.Item label="Gender">
                <Select placeholder="Select gender">
                    <Option value="MALE">Male</Option>
                    <Option value="FEMALE">Female</Option>
                    <Option value="OTHER">Other</Option>
                </Select>
            </Form.Item>
            <Form.Item label="Address">
                <Input placeholder="Enter your address" />
            </Form.Item>
            <Button type="primary">Save Changes</Button>
        </Form>
    </div>
);

export default Profile;