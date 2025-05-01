import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserHome = () => {
  const [showAccount, setShowAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  const [query, setQuery] = useState({ source: '', destination: '', date: '', mode: '' });
  const [options, setOptions] = useState([]);

  const [bookingDetails, setBookingDetails] = useState({
    transportId: '',
    travellerName: '',
    seatNumber: '',
    bookingDate: '',
    journeyDate: '',
  });

  const [bookedTravels, setBookedTravels] = useState([]);

  const handleAccountUpdate = async () => {
    try {
      await axios.post('/user/update', accountForm);
      alert('Details updated');
    } catch (err) {
      alert(`Error: ${err.response?.data || err.message}`);
    }
  };

  const handleAccountDelete = async () => {
    try {
      await axios.delete('/user/delete');
      alert('Account deleted');
    } catch (err) {
      alert(`Error: ${err.response?.data || err.message}`);
    }
  };

  const handleQuery = async () => {
    try {
      const res = await axios.post('/user/transport/query', query);
      setOptions(res.data);
    } catch (err) {
      alert(`Query failed: ${err.response?.data || err.message}`);
    }
  };

  const handleBook = async () => {
    try {
      const res = await axios.post('/user/ticket/book', {
        ...bookingDetails,
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
      });
      alert('Booking successful');
    } catch (err) {
      alert(`Booking failed: ${err.response?.data || err.message}`);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await axios.post('/user/ticket/query');
      setBookedTravels(res.data);
    } catch (err) {
      alert(`Load bookings failed: ${err.response?.data || err.message}`);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.post('/user/ticket/cancel', { bookingId });
      loadBookings();
      alert('Booking cancelled');
    } catch (err) {
      alert(`Cancel failed: ${err.response?.data || err.message}`);
    }
  };

  const handleDateChange = async (bookingId, newDate) => {
    try {
      await axios.post('/user/ticket/update', { bookingId, newDate });
      loadBookings();
      alert('Date updated');
    } catch (err) {
      alert(`Update failed: ${err.response?.data || err.message}`);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.accountButton} onClick={() => setShowAccount(!showAccount)}>
          Account
        </button>
      </div>

      {showAccount && (
        <div style={styles.card}>
          <h3>Update Account</h3>
          <input placeholder="Name" style={styles.input} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} />
          <input placeholder="Email" style={styles.input} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} />
          <input placeholder="Phone Number" style={styles.input} onChange={e => setAccountForm({ ...accountForm, phoneNumber: e.target.value })} />
          <button onClick={handleAccountUpdate} style={styles.button}>Update</button>
          <button onClick={handleAccountDelete} style={styles.removeButton}>Delete Account</button>
        </div>
      )}

      <div style={styles.card}>
        <h3>Search Transports</h3>
        <input placeholder="Source" onChange={e => setQuery({ ...query, source: e.target.value })} style={styles.input} />
        <input placeholder="Destination" onChange={e => setQuery({ ...query, destination: e.target.value })} style={styles.input} />
        <input type="date" onChange={e => setQuery({ ...query, date: e.target.value })} style={styles.input} />
        <input placeholder="Mode (bus, air, train)" onChange={e => setQuery({ ...query, mode: e.target.value })} style={styles.input} />
        <button onClick={handleQuery} style={styles.button}>Search</button>

        <ul>
          {options.map(o => (
            <li key={o.transportId} style={{ marginTop: '1rem' }}>
              <div>{o.mode} - {o.source} → {o.destination} on {o.date}</div>
              <div>Price: {o.price}, Available: {o.seats}</div>
              <input placeholder="Your Name" onChange={e => setBookingDetails({ ...bookingDetails, travellerName: e.target.value, transportId: o.transportId })} style={styles.input} />
              <input placeholder="Seat Number" onChange={e => setBookingDetails({ ...bookingDetails, seatNumber: e.target.value })} style={styles.input} />
              <input type="date" onChange={e => setBookingDetails({ ...bookingDetails, journeyDate: e.target.value, bookingDate: new Date().toISOString().split('T')[0] })} style={styles.input} />
              <button onClick={handleBook} style={styles.button}>Book</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.card}>
        <h3>Upcoming Travels</h3>
        {bookedTravels.map(b => (
          <div key={b.bookingId} style={{ borderTop: '1px solid #555', paddingTop: '1rem' }}>
            <div>{b.travellerName} - {b.source} → {b.destination} on {b.journeyDate}</div>
            <div>Seat: {b.seatNumber} | Status: {b.bookingStatus}</div>
            <input type="date" onChange={(e) => handleDateChange(b.bookingId, e.target.value)} style={styles.input} />
            <button onClick={() => handleCancel(b.bookingId)} style={styles.removeButton}>Cancel</button>
          </div>
        ))}
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
    marginTop: '0.5rem',
  },
};

export default UserHome;
