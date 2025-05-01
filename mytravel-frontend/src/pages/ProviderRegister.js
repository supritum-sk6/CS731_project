import React, { useState } from 'react';
import axios from 'axios';

const ProviderRegister = () => {
  const [form, setForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND}/provider/register`,
        form
      );
      alert(`Registered successfully: ${JSON.stringify(res.data)}`);
    } catch (err) {
      alert(`Error: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Service Provider Registration</h2>
      <input
        type="text"
        name="companyName"
        placeholder="Company Name"
        onChange={handleChange}
        style={styles.input}
      />
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
        Register
      </button>
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
};

export default ProviderRegister;
