import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomeSelector from './pages/HomeSelector';

import ProviderLogin from './pages/ProviderLogin';
import ProviderRegister from './pages/ProviderRegister';
import ProviderHome from './pages/ProviderHome';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserHome from './pages/UserHome';

const App = () => {
  return (
    <div style={{ backgroundColor: '#121212', color: '#eee', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<HomeSelector />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route path="/provider/home" element={<ProviderHome />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/home" element={<UserHome />} />
      </Routes>
    </div>
  );
};

export default App;
