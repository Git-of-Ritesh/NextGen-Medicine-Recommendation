import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={user?.profileImage || 'https://via.placeholder.com/150'} 
            alt="Profile" 
            className="profile-image-large"
          />
          <button className="edit-avatar-btn">Change Photo</button>
        </div>
        <h1 className="profile-name">{user?.username || 'User'}</h1>
        <p className="profile-email">{user?.email}</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Username</label>
              <p>{user?.username}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-item">
              <label>Age</label>
              <p>{user?.age}</p>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Account Settings</h2>
          <div className="settings-list">
            <button className="settings-btn">
              <span>Change Password</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-btn">
              <span>Notification Preferences</span>
              <span className="arrow">→</span>
            </button>
            <button className="settings-btn">
              <span>Privacy Settings</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h2>Danger Zone</h2>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 