import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: Clear token and redirect
        navigate('/login');
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <Title level={2}>Logout</Title>
                <p>Are you sure you want to logout?</p>
                <Button type="primary" onClick={handleLogout}>Confirm Logout</Button>
            </div>
        </div>
    );
};

export default Logout;