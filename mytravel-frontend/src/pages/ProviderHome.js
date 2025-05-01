import React, { useState } from 'react';
import axios from 'axios';

const ProviderHome = () => {
  // Account section
  const [showAccount, setShowAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
  });

  // Query and transport options
  const [query, setQuery] = useState({ source: '', destination: '' });
  const [transports, setTransports] = useState([]);

  // Add transport option
  const [newOption, setNewOption] = useState({
    mode: '',
    source: '',
    destination: '',
    date: '',
    price: '',
    seats: '',
  });

  // Add/remove mode
  const [modeName, setModeName] = useState('');

  const handleAccountUpdate = async () => {
    try {
      const res = await axios.post('/provider/update', accountForm);
      alert('Details updated');
    } catch (err) {
      alert(`Error: ${err.response?.data || err.message}`);
    }
  };

  const handleAccountDelete = async () => {
    try {
      const res = await axios.delete('/provider/delete');
      alert('Account deleted');
    } catch (err) {
      alert(`Error: ${err.response?.data || err.message}`);
    }
  };

  const handleQuery = async () => {
    try {
      const res = await axios.post('/provider/transport/query', query);
      setTransports(res.data);
    } catch (err) {
      alert(`Query failed: ${err.response?.data || err.message}`);
    }
  };

  const handleRemoveTransport = async (transportId) => {
    try {
      await axios.post('/provider/transport/option/remove', { transportId });
      setTransports(transports.filter(t => t.transportId !== transportId));
    } catch (err) {
      alert(`Remove failed: ${err.response?.data || err.message}`);
    }
  };

  const handleAddTransport = async () => {
    try {
      await axios.post('/provider/transport/option/add', newOption);
      alert('New travel option added');
    } catch (err) {
      alert(`Add failed: ${err.response?.data || err.message}`);
    }
  };

  const handleAddMode = async () => {
    try {
      await axios.post('/provider/transport/mode/add', { mode: modeName });
      alert('Mode added');
    } catch (err) {
      alert(`Add mode failed: ${err.response?.data || err.message}`);
    }
  };

  const handleRemoveMode = async () => {
    try {
      await axios.post('/provider/transport/mode/remove', { mode: modeName });
      alert('Mode removed');
    } catch (err) {
      alert(`Remove mode failed: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      {/* Account Button */}
      <div style={styles.header}>
        <button style={styles.accountButton} onClick={() => setShowAccount(!showAccount)}>
          Account
        </button>
      </div>

      {/* Account dropdown */}
      {showAccount && (
        <div style={styles.card}>
          <h3>Update Account Details</h3>
          <input name="companyName" placeholder="Company Name" style={styles.input}
            onChange={e => setAccountForm({ ...accountForm, companyName: e.target.value })} />
          <input name="contactEmail" placeholder="Email" style={styles.input}
            onChange={e => setAccountForm({ ...accountForm, contactEmail: e.target.value })} />
          <input name="contactPhone" placeholder="Phone" style={styles.input}
            onChange={e => setAccountForm({ ...accountForm, contactPhone: e.target.value })} />
          <button onClick={handleAccountUpdate} style={styles.button}>Update</button>
          <button onClick={handleAccountDelete} style={{ ...styles.button, backgroundColor: '#802' }}>Delete Account</button>
        </div>
      )}

      {/* Search travel options */}
      <div style={styles.card}>
        <h3>Search Travel Options</h3>
        <input name="source" placeholder="Source" style={styles.input}
          onChange={e => setQuery({ ...query, source: e.target.value })} />
        <input name="destination" placeholder="Destination" style={styles.input}
          onChange={e => setQuery({ ...query, destination: e.target.value })} />
        <button onClick={handleQuery} style={styles.button}>Search</button>
        <ul>
          {transports.map(t => (
            <li key={t.transportId} style={{ marginTop: '1rem' }}>
              <div>{t.mode} - {t.source} to {t.destination} on {t.date}</div>
              <div>Price: {t.price}, Seats: {t.seats}</div>
              <button onClick={() => handleRemoveTransport(t.transportId)} style={styles.removeButton}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Add new travel option */}
      <div style={styles.card}>
        <h3>Add Travel Option</h3>
        <input placeholder="Mode" onChange={e => setNewOption({ ...newOption, mode: e.target.value })} style={styles.input} />
        <input placeholder="Source" onChange={e => setNewOption({ ...newOption, source: e.target.value })} style={styles.input} />
        <input placeholder="Destination" onChange={e => setNewOption({ ...newOption, destination: e.target.value })} style={styles.input} />
        <input type="date" onChange={e => setNewOption({ ...newOption, date: e.target.value })} style={styles.input} />
        <input placeholder="Price" onChange={e => setNewOption({ ...newOption, price: e.target.value })} style={styles.input} />
        <input placeholder="Seats" onChange={e => setNewOption({ ...newOption, seats: e.target.value })} style={styles.input} />
        <button onClick={handleAddTransport} style={styles.button}>Add Transport</button>
      </div>

      {/* Add/Remove Mode */}
      <div style={styles.card}>
        <h3>Manage Modes</h3>
        <input placeholder="Mode (e.g., air)" value={modeName} onChange={e => setModeName(e.target.value)} style={styles.input} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleAddMode} style={styles.button}>Add Mode</button>
          <button onClick={handleRemoveMode} style={styles.removeButton}>Remove Mode</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#121212',
    color: '#eee',
    padding: '2rem',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '1rem',
  },
  accountButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#333',
    color: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#1f1f1f',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    maxWidth: '600px',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '1rem',
    backgroundColor: '#2b2b2b',
    color: '#eee',
    border: '1px solid #444',
    borderRadius: '6px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
    marginRight: '1rem',
  },
  removeButton: {
    padding: '10px 20px',
    backgroundColor: '#802',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '6px',
  },
};

export default ProviderHome;
