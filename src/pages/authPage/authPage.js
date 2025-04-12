import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './authPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    age: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin) {
      // Username validation
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 2 || formData.username.length > 50) {
        newErrors.username = 'Username must be between 2 and 50 characters';
      }

      // Age validation
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else if (isNaN(formData.age) || formData.age < 10 || formData.age > 120) {
        newErrors.age = 'Age must be between 10 and 120';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!isLogin && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const res = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          
          // Redirect to dashboard
          navigate('/');
        } else {
          // Registration success
          alert('Account created successfully! Please login.');
          setIsLogin(true);
          setFormData({
            email: '',
            password: '',
            username: '',
            age: ''
          });
        }
      } else {
        // Handle specific error cases
        if (res.status === 429) {
          setApiError('Too many attempts. Please try again later.');
        } else if (data.message) {
          setApiError(data.message);
        } else {
          setApiError(isLogin ? 'Login failed' : 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add profile fetch function
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Add token check on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, [navigate]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setApiError('');
    setFormData({
      email: '',
      password: '',
      username: '',
      age: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="left-panel">
        <div className="brand-name">Alternative Medicine</div>
        <p className="tagline">
          Your personalized alternative medicine recommendation system.
        </p>
      </div>

      <div className="right-panel">
        <div className="auth-form">
          <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

          {apiError && <div className="error-message">{apiError}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="username" className="input-label">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`input-field ${errors.username ? 'error' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`input-field ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`input-field ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder={isLogin ? "Enter your password" : "Create a password"}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
              {!isLogin && (
                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="input-group">
                <label htmlFor="age" className="input-label">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className={`input-field ${errors.age ? 'error' : ''}`}
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                />
                {errors.age && <span className="error-text">{errors.age}</span>}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            <div className="switch-mode">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                onClick={toggleMode} 
                className="switch-button"
                disabled={isLoading}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;