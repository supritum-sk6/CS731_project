import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProviderLogin = () => {
  const [form, setForm] = useState({
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/provider/login', form);
      alert(`Login successful: ${JSON.stringify(res.data)}`);
      // redirect to provider dashboard here if needed
    } catch (err) {
      alert(`Login failed: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Service Provider Login</h2>
      <input
        type="email"
        name="contactEmail"
        placeholder="Email"
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="text"
        name="contactPhone"
        placeholder="Phone Number"
        onChange={handleChange}
        style={styles.input}
      />
      <button onClick={handleSubmit} style={styles.button}>
        Login
      </button>
      <p style={styles.toggle}>
        Don't have an account? <Link to="/provider/register" style={{ color: '#bbb' }}>Register here</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1e1e1e',
    color: '#eee',
    maxWidth: '400px',
    margin: '10vh auto',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '1rem',
    backgroundColor: '#2b2b2b',
    border: '1px solid #444',
    color: '#eee',
    borderRadius: '6px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#444',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  toggle: {
    marginTop: '1rem',
    color: '#aaa',
  },
};

export default ProviderLogin;
