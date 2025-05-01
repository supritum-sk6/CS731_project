// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const backend = process.env.REACT_APP_BACKEND;

// const ProviderHome = () => {
//   const navigate = useNavigate();
//   const [showAccount, setShowAccount] = useState(false);
//   const [accountForm, setAccountForm] = useState({
//     companyName: '',
//     contactEmail: '',
//     contactPhone: '',
//   });

//   const [query, setQuery] = useState({ source: '', destination: '' });
//   const [transports, setTransports] = useState([]);

//   const [newOption, setNewOption] = useState({
//     mode: '',
//     source: '',
//     destination: '',
//     departure: '',
//     arrival: '',
//     price: '',
//     seats: '',
//   });

//   const [modeName, setModeName] = useState('');

//   const showError = (err, prefix = 'Error') => {
//     console.error(`${prefix}:`, err);
//     let message;
//     if (err.response?.data) {
//       if (typeof err.response.data === 'object') {
//         message = JSON.stringify(err.response.data, null, 2);
//       } else {
//         message = err.response.data;
//       }
//     } else {
//       message = err.message || JSON.stringify(err);
//     }
//     alert(`${prefix}:\n${message}`);
//   };

//   const handleAccountUpdate = async () => {
//     try {
//       await axios.post(`${backend}/provider/update`, accountForm);
//       alert('Details updated');
//     } catch (err) {
//       showError(err, 'Update failed');
//     }
//   };

//   const handleAccountDelete = async () => {
//     try {
//       await axios.delete(`${backend}/provider/delete`);
//       alert('Account deleted');
//     } catch (err) {
//       showError(err, 'Delete failed');
//     }
//   };

//   const handleQuery = async () => {
//     try {
//       const res = await axios.post(`${backend}/provider/transport/query`, query);
//       setTransports(res.data);
//     // navigate('/provider/results', { state: { transports: res.data.res } });
//     } catch (err) {
//       showError(err, 'Query failed');
//     }
//   };

//   const handleRemoveTransport = async (transportId) => {
//     try {
//       await axios.post(`${backend}/provider/transport/option/remove`, { transportId });
//       setTransports(transports.filter(t => t.transportId !== transportId));
//     } catch (err) {
//       showError(err, 'Remove failed');
//     }
//   };

//   const handleAddTransport = async () => {
//     try {
//       const payload = {
//         ...newOption,
//         price: String(newOption.price),
//         seats: String(newOption.seats),
//       };
//       await axios.post(`${backend}/provider/transport/option/add`, payload);
//       alert('New travel option added');
//     } catch (err) {
//       showError(err, 'Add failed');
//     }
//   };

//   const handleAddMode = async () => {
//     try {
//       await axios.post(`${backend}/provider/transport/mode/add`, { mode: modeName });
//       alert('Mode added');
//     } catch (err) {
//       showError(err, 'Add mode failed');
//     }
//   };

//   const handleRemoveMode = async () => {
//     try {
//       await axios.post(`${backend}/provider/transport/mode/remove`, { mode: modeName });
//       alert('Mode removed');
//     } catch (err) {
//       showError(err, 'Remove mode failed');
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <button style={styles.accountButton} onClick={() => setShowAccount(!showAccount)}>
//           Account
//         </button>
//       </div>

//       {showAccount && (
//         <div style={styles.card}>
//           <h3>Update Account Details</h3>
//           <input name="companyName" placeholder="Company Name" style={styles.input}
//             onChange={e => setAccountForm({ ...accountForm, companyName: e.target.value })} />
//           <input name="contactEmail" placeholder="Email" style={styles.input}
//             onChange={e => setAccountForm({ ...accountForm, contactEmail: e.target.value })} />
//           <input name="contactPhone" placeholder="Phone" style={styles.input}
//             onChange={e => setAccountForm({ ...accountForm, contactPhone: e.target.value })} />
//           <button onClick={handleAccountUpdate} style={styles.button}>Update</button>
//           <button onClick={handleAccountDelete} style={{ ...styles.button, backgroundColor: '#802' }}>Delete Account</button>
//         </div>
//       )}

//       <div style={styles.card}>
//         <h3>Search Travel Options</h3>
//         <input name="source" placeholder="Source" style={styles.input}
//           onChange={e => setQuery({ ...query, source: e.target.value })} />
//         <input name="destination" placeholder="Destination" style={styles.input}
//           onChange={e => setQuery({ ...query, destination: e.target.value })} />
//         <button onClick={handleQuery} style={styles.button}>Search</button>
//         <ul>
//           {transports.map(t => (
//             <li key={t.transportId} style={{ marginTop: '1rem' }}>
//               <div>{t.mode} - {t.source} to {t.destination} on {t.departure}</div>
//               <div>Price: {t.price}, Seats: {t.seats}</div>
//               <button onClick={() => handleRemoveTransport(t.transportId)} style={styles.removeButton}>Remove</button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {transports.length > 0 && (
//         <div style={styles.card}>
//           <h3>Search Results</h3>
//           <ul style={{ listStyle: 'none', padding: 0 }}>
//             {transports.map((t, index) => (
//               <li key={index} style={styles.resultCard}>
//                 <div><strong>Transport ID:</strong> {t.transport_id}</div>
//                 <div><strong>Mode:</strong> {t.mode_of_transport}</div>
//                 <div><strong>Route:</strong> {t.source} → {t.destination}</div>
//                 <div><strong>Departure:</strong> {t.departure_time}</div>
//                 <div><strong>Arrival:</strong> {t.arrival_time}</div>
//                 <div><strong>Seats:</strong> {t.total_seats}</div>
//                 <div><strong>Price:</strong> ₹{t.price}</div>
//                 <button onClick={() => handleRemoveTransport(t.transport_id)} style={styles.removeButton}>
//                   Remove
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}


//       <div style={styles.card}>
//         <h3>Add Travel Option</h3>
//         <input placeholder="Mode" onChange={e => setNewOption({ ...newOption, mode: e.target.value })} style={styles.input} />
//         <input placeholder="Source" onChange={e => setNewOption({ ...newOption, source: e.target.value })} style={styles.input} />
//         <input placeholder="Destination" onChange={e => setNewOption({ ...newOption, destination: e.target.value })} style={styles.input} />
//         <input type="date" placeholder="Departure" onChange={e => setNewOption({ ...newOption, departure: e.target.value })} style={styles.input} />
//         <input type="date" placeholder="Arrival" onChange={e => setNewOption({ ...newOption, arrival: e.target.value })} style={styles.input} />
//         <input placeholder="Price" onChange={e => setNewOption({ ...newOption, price: e.target.value })} style={styles.input} />
//         <input placeholder="Seats" onChange={e => setNewOption({ ...newOption, seats: e.target.value })} style={styles.input} />
//         <button onClick={handleAddTransport} style={styles.button}>Add Transport</button>
//       </div>

//       <div style={styles.card}>
//         <h3>Manage Modes</h3>
//         <input placeholder="Mode (e.g., air)" value={modeName} onChange={e => setModeName(e.target.value)} style={styles.input} />
//         <div style={{ display: 'flex', gap: '1rem' }}>
//           <button onClick={handleAddMode} style={styles.button}>Add Mode</button>
//           <button onClick={handleRemoveMode} style={styles.removeButton}>Remove Mode</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     backgroundColor: '#121212',
//     color: '#eee',
//     padding: '2rem',
//     minHeight: '100vh',
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'flex-start',
//     marginBottom: '1rem',
//   },
//   accountButton: {
//     padding: '0.5rem 1rem',
//     backgroundColor: '#333',
//     color: '#eee',
//     border: 'none',
//     borderRadius: '6px',
//     cursor: 'pointer',
//   },
//   card: {
//     backgroundColor: '#1f1f1f',
//     padding: '1.5rem',
//     borderRadius: '12px',
//     marginBottom: '2rem',
//     maxWidth: '600px',
//   },
//   input: {
//     display: 'block',
//     width: '100%',
//     padding: '10px',
//     marginBottom: '1rem',
//     backgroundColor: '#2b2b2b',
//     color: '#eee',
//     border: '1px solid #444',
//     borderRadius: '6px',
//   },
//   button: {
//     padding: '10px 20px',
//     backgroundColor: '#444',
//     color: '#fff',
//     border: 'none',
//     cursor: 'pointer',
//     borderRadius: '6px',
//     marginRight: '1rem',
//   },
//   removeButton: {
//     padding: '10px 20px',
//     backgroundColor: '#802',
//     color: '#fff',
//     border: 'none',
//     cursor: 'pointer',
//     borderRadius: '6px',
//   },
//   resultCard: {
//   backgroundColor: '#2b2b2b',
//   padding: '1rem',
//   borderRadius: '10px',
//   border: '1px solid #444',
//   marginBottom: '1rem',
// }
// };

// export default ProviderHome;



import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const backend = process.env.REACT_APP_BACKEND;

const ProviderHome = () => {
  const navigate = useNavigate();
  const [showAccount, setShowAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [query, setQuery] = useState({ source: '', destination: '' });
  const [transports, setTransports] = useState([]);

  const [newOption, setNewOption] = useState({
    mode: '',
    source: '',
    destination: '',
    departure: '',
    arrival: '',
    price: '',
    seats: '',
  });

  const [modeName, setModeName] = useState('');

  const showError = (err, prefix = 'Error') => {
    console.error(`${prefix}:`, err);
    const message = err.response?.data
      ? typeof err.response.data === 'object'
        ? JSON.stringify(err.response.data, null, 2)
        : err.response.data
      : err.message || JSON.stringify(err);
    alert(`${prefix}:\n${message}`);
  };

  const handleAccountUpdate = async () => {
    try {
      await axios.post(`${backend}/provider/update`, accountForm);
      alert('Details updated');
    } catch (err) {
      showError(err, 'Update failed');
    }
  };

  const handleAccountDelete = async () => {
    try {
      await axios.delete(`${backend}/provider/delete`);
      alert('Account deleted');
    } catch (err) {
      showError(err, 'Delete failed');
    }
  };

  const handleQuery = async () => {
    try {
      const res = await axios.post(`${backend}/provider/transport/query`, query);
      setTransports(res.data.result || []);
    } catch (err) {
      showError(err, 'Query failed');
    }
  };

  const handleRemoveTransport = async (transportId) => {
    try {
      await axios.post(`${backend}/provider/transport/option/remove`, { transportId });
      setTransports(prev => prev.filter(t => t.transport_id !== transportId));
    } catch (err) {
      showError(err, 'Remove failed');
    }
  };

  const handleAddTransport = async () => {
    try {
      const payload = {
        ...newOption,
        price: String(newOption.price),
        seats: String(newOption.seats),
      };
      await axios.post(`${backend}/provider/transport/option/add`, payload);
      alert('New travel option added');
    } catch (err) {
      showError(err, 'Add failed');
    }
  };

  const handleAddMode = async () => {
    try {
      await axios.post(`${backend}/provider/transport/mode/add`, { mode: modeName });
      alert('Mode added');
    } catch (err) {
      showError(err, 'Add mode failed');
    }
  };

  const handleRemoveMode = async () => {
    try {
      await axios.post(`${backend}/provider/transport/mode/remove`, { mode: modeName });
      alert('Mode removed');
    } catch (err) {
      showError(err, 'Remove mode failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.accountButton} onClick={() => setShowAccount(!showAccount)}>
          Account
        </button>
      </div>

      {showAccount && (
        <div style={styles.card}>
          <h3>Update Account Details</h3>
          <input placeholder="Company Name" style={styles.input}
            onChange={e => setAccountForm({ ...accountForm, companyName: e.target.value })} />
          <input placeholder="Email" style={styles.input}
            onChange={e => setAccountForm({ ...accountForm, contactEmail: e.target.value })} />
          <input placeholder="Phone" style={styles.input}
            onChange={e => setAccountForm({ ...accountForm, contactPhone: e.target.value })} />
          <button onClick={handleAccountUpdate} style={styles.button}>Update</button>
          <button onClick={handleAccountDelete} style={{ ...styles.button, backgroundColor: '#802' }}>Delete Account</button>
        </div>
      )}

      <div style={styles.card}>
        <h3>Search Travel Options</h3>
        <input placeholder="Source" style={styles.input}
          onChange={e => setQuery({ ...query, source: e.target.value })} />
        <input placeholder="Destination" style={styles.input}
          onChange={e => setQuery({ ...query, destination: e.target.value })} />
        <button onClick={handleQuery} style={styles.button}>Search</button>
      </div>

      {transports.length > 0 && (
        <div style={styles.card}>
          <h3>Search Results</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {transports.map((t, index) => (
              <li key={t.transport_id || index} style={styles.resultCard}>
                <div><strong>Transport ID:</strong> {t.transport_id}</div>
                <div><strong>Mode:</strong> {t.mode_of_transport}</div>
                <div><strong>Route:</strong> {t.source} → {t.destination}</div>
                <div><strong>Departure:</strong> {t.departure_time}</div>
                <div><strong>Arrival:</strong> {t.arrival_time}</div>
                <div><strong>Seats:</strong> {t.total_seats}</div>
                <div><strong>Price:</strong> ₹{t.price}</div>
                <button onClick={() => handleRemoveTransport(t.transport_id)} style={styles.removeButton}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.card}>
        <h3>Add Travel Option</h3>
        <input placeholder="Mode" onChange={e => setNewOption({ ...newOption, mode: e.target.value })} style={styles.input} />
        <input placeholder="Source" onChange={e => setNewOption({ ...newOption, source: e.target.value })} style={styles.input} />
        <input placeholder="Destination" onChange={e => setNewOption({ ...newOption, destination: e.target.value })} style={styles.input} />
        <input type="date" placeholder="Departure" onChange={e => setNewOption({ ...newOption, departure: e.target.value })} style={styles.input} />
        <input type="date" placeholder="Arrival" onChange={e => setNewOption({ ...newOption, arrival: e.target.value })} style={styles.input} />
        <input placeholder="Price" onChange={e => setNewOption({ ...newOption, price: e.target.value })} style={styles.input} />
        <input placeholder="Seats" onChange={e => setNewOption({ ...newOption, seats: e.target.value })} style={styles.input} />
        <button onClick={handleAddTransport} style={styles.button}>Add Transport</button>
      </div>

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
  resultCard: {
    backgroundColor: '#2b2b2b',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid #444',
    marginBottom: '1rem',
  }
};

export default ProviderHome;
