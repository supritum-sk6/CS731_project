// frontend/src/pages/ProviderResults.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const backend = process.env.REACT_APP_BACKEND;

const ProviderResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const transports = Array.isArray(state?.transports) ? state.transports : [];

  const handleRemoveTransport = async (transportId) => {
    try {
      await axios.post(`${backend}/provider/transport/option/remove`, { transportId });
      alert(`Transport ${transportId} removed.`);
      // Optional: refresh view
      navigate('/provider/home');
    } catch (err) {
      alert('Remove failed: ' + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Available Transport Options</h2>

      {transports.length === 0 ? (
        <p>No transport options found.</p>
      ) : (
        <div style={styles.cardList}>
          {transports.map((t, index) => (
            <div key={index} style={styles.card}>
              <p><strong>Transport ID:</strong> {t.transport_id}</p>
              <p><strong>Mode:</strong> {t.mode_of_transport}</p>
              <p><strong>Route:</strong> {t.source} → {t.destination}</p>
              <p><strong>Departure:</strong> {t.departure_time}</p>
              <p><strong>Arrival:</strong> {t.arrival_time}</p>
              <p><strong>Seats:</strong> {t.total_seats}</p>
              <p><strong>Price:</strong> ₹{t.price}</p>
              <button onClick={() => handleRemoveTransport(t.transport_id)} style={styles.removeButton}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/provider/home')} style={styles.backButton}>
        Back to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#121212',
    color: '#eee',
    minHeight: '100vh',
  },
  heading: {
    marginBottom: '1.5rem',
  },
  cardList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#1f1f1f',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid #333',
  },
  removeButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#802',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  backButton: {
    marginTop: '2rem',
    padding: '10px 20px',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ProviderResults;
