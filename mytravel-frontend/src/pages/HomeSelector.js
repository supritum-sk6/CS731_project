import React from 'react';
import { useNavigate } from 'react-router-dom';

const cardStyle = {
  backgroundColor: '#1f1f1f',
  color: '#fff',
  padding: '2rem',
  borderRadius: '12px',
  width: '250px',
  margin: '1rem',
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  transition: 'transform 0.2s ease-in-out',
};

const cardHover = {
  ...cardStyle,
  transform: 'scale(1.05)',
};

const HomeSelector = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh' 
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Welcome to MyTravel</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div
          style={hovered === 'provider' ? cardHover : cardStyle}
          onClick={() => navigate('/provider/login')}
          onMouseEnter={() => setHovered('provider')}
          onMouseLeave={() => setHovered(null)}
        >
          <h2>Service Provider</h2>
          <p>Login or register to manage travel services</p>
        </div>

        <div
          style={hovered === 'customer' ? cardHover : cardStyle}
          onClick={() => navigate('/user/login')}
          onMouseEnter={() => setHovered('customer')}
          onMouseLeave={() => setHovered(null)}
        >
          <h2>Customer</h2>
          <p>Login or register to book tickets</p>
        </div>
      </div>
    </div>
  );
};

export default HomeSelector;
