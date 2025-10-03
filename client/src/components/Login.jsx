import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import the same local video file
import animeVideo from './video/animevideo.mp4';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const { login, googleSignup, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Debug auth functions and user state
  useEffect(() => {
    console.log('Auth state:', { 
      user, 
      isAuthenticated, 
      authLoading,
      hasLogin: !!login,
      hasGoogleSignup: !!googleSignup 
    });
  }, [user, isAuthenticated, authLoading, login, googleSignup]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  // Video loading and error handling
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  // Check for success message from signup redirect
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Simplified validation schema
  const validationSchema = Yup.object({
    user_name: Yup.string()
      .required('Username is required'),
    password: Yup.string()
      .required('Password is required')
  });

  // UPDATED login function for JWT
  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      console.log('Attempting login with:', { username });
      
      if (!login) {
        throw new Error('Login function not available');
      }

      const result = await login(username, password);
      console.log('Login result:', result);
      
      if (result.success) {
        // Immediately navigate to dashboard after successful login
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard', { replace: true });
        
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // UPDATED Google login handler for JWT
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      if (!googleSignup) {
        throw new Error('Google signup function not available');
      }

      // Decode the JWT token
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      
      const googleUser = JSON.parse(jsonPayload);
      console.log('Google user data:', googleUser);
      
      const userData = {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        sub: googleUser.sub
      };

      const result = await googleSignup(userData);
      console.log('Google signup result:', result);
      
      if (result.success) {
        // Immediately navigate to dashboard after successful Google login
        console.log('Google login successful, navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setErrorMessage('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google login failed. Please try again.');
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      user_name: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('Form submitted with values:', values);
      
      const result = await handleLogin(values.user_name, values.password);
      
      if (!result.success) {
        setErrorMessage(result.message);
      }
    },
  });

  // Clear error when form values change
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [formik.values.user_name, formik.values.password]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="login-container">
        <style>
          {`
            .login-container {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #6a1b9a 0%, #311b92 100%);
              font-family: 'Poppins', sans-serif;
              color: white;
              padding: 20px;
            }
            .loading-spinner {
              text-align: center;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top: 4px solid #ffffff;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            width: 100%;
            padding: 20px 15px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            font-family: 'Poppins', sans-serif;
          }
          
          .video-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
            filter: brightness(0.5) contrast(1.1);
            transition: opacity 0.5s ease-in-out;
            opacity: ${videoLoaded ? 1 : 0};
          }
          
          .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(5, 2, 7, 0.8) 0%, rgba(49, 27, 146, 0.9) 100%);
            z-index: -1;
          }
          
          .fallback-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #6a1b9a 0%, #311b92 100%);
            z-index: -2;
          }
          
          .login-form {
            background: rgba(255, 255, 255, 0.12);
            padding: 30px 25px;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 450px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            position: relative;
            z-index: 1;
            transition: all 0.3s ease-in-out;
            opacity: ${videoLoaded ? 1 : 0.8};
            overflow: visible;
            margin: 0 auto;
          }
          
          .login-form::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2);
            border-radius: 20px 20px 0 0;
          }
          
          .app-title {
            text-align: center;
            margin-bottom: 10px;
            color: #ffffff;
            font-size: 2.5rem;
            font-weight: 700;
            text-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            font-family: 'Poppins', sans-serif;
            letter-spacing: 1px;
            background: linear-gradient(45deg, #ffffff, #e0e0ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
          }
          
          .app-subtitle {
            text-align: center;
            margin-bottom: 30px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            font-weight: 300;
            letter-spacing: 0.5px;
            line-height: 1.4;
            padding: 0 10px;
          }
          
          .login-form h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 600;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            line-height: 1.3;
          }
          
          .form-group {
            margin-bottom: 25px;
            position: relative;
          }
          
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.95);
            font-size: 0.95rem;
            letter-spacing: 0.3px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          
          .form-group input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            box-sizing: border-box;
            font-size: 1rem;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
            backdrop-filter: blur(10px);
          }
          
          .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.95rem;
          }
          
          .form-group input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .form-group input.error {
            border-color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
          }
          
          .field-error {
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 6px;
            display: block;
            font-weight: 500;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            min-height: 18px;
            line-height: 1.3;
          }
          
          .error-message {
            background-color: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid rgba(255, 107, 107, 0.3);
            backdrop-filter: blur(10px);
            font-size: 0.9rem;
            line-height: 1.4;
          }
          
          .success-message {
            background-color: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid rgba(76, 175, 80, 0.3);
            backdrop-filter: blur(10px);
            font-size: 0.9rem;
            line-height: 1.4;
          }
          
          .login-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-top: 10px;
            box-shadow: 0 8px 25px rgba(120, 115, 245, 0.4);
          }
          
          .login-btn:hover {
            background: linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(120, 115, 245, 0.6);
          }
          
          .login-btn:active {
            transform: translateY(-1px);
          }
          
          .login-btn:disabled {
            background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          .divider {
            display: flex;
            align-items: center;
            margin: 30px 0;
          }
          
          .divider::before,
          .divider::after {
            content: "";
            flex: 1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            height: 1px;
          }
          
          .divider span {
            padding: 0 20px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            font-weight: 500;
          }
          
          .google-login {
            display: flex;
            justify-content: center;
            margin-bottom: 25px;
          }
          
          .forgot-password {
            text-align: center;
            margin: 20px 0;
          }
          
          .forgot-password a {
            color: #ff6ec4;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            font-size: 0.95rem;
          }
          
          .forgot-password a:hover {
            color: #7873f5;
            text-decoration: underline;
          }
          
          .signup-link {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            margin-top: 20px;
            line-height: 1.4;
          }
          
          .signup-link a {
            color: #ff6ec4;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .signup-link a:hover {
            color: #7873f5;
            text-decoration: underline;
          }

          /* Samsung Galaxy A26 Specific Optimizations */
          @media screen and (max-width: 412px) and (max-height: 915px) {
            .login-container {
              padding: 15px 10px;
              min-height: 100vh;
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .login-form {
              padding: 25px 20px;
              border-radius: 15px;
              max-width: 100%;
              margin: 0;
            }
            
            .app-title {
              font-size: 2.2rem;
              margin-bottom: 8px;
            }
            
            .app-subtitle {
              font-size: 0.9rem;
              margin-bottom: 25px;
              padding: 0 5px;
            }
            
            .login-form h2 {
              font-size: 1.5rem;
              margin-bottom: 25px;
            }
            
            .form-group {
              margin-bottom: 20px;
            }
            
            .form-group input {
              padding: 12px 14px;
              font-size: 0.95rem;
              border-radius: 8px;
            }
            
            .form-group label {
              font-size: 0.9rem;
              margin-bottom: 6px;
            }
            
            .login-btn {
              padding: 14px;
              font-size: 1rem;
              margin-top: 5px;
              border-radius: 8px;
            }
            
            .divider {
              margin: 25px 0;
            }
            
            .divider span {
              padding: 0 15px;
              font-size: 0.85rem;
            }
            
            .forgot-password {
              margin: 15px 0;
            }
            
            .signup-link {
              font-size: 0.9rem;
              margin-top: 15px;
            }
          }
          
          /* Very small devices */
          @media screen and (max-width: 360px) {
            .login-container {
              padding: 10px 8px;
            }
            
            .login-form {
              padding: 20px 15px;
            }
            
            .app-title {
              font-size: 2rem;
            }
            
            .app-subtitle {
              font-size: 0.85rem;
            }
            
            .login-form h2 {
              font-size: 1.3rem;
            }
            
            .form-group input {
              padding: 10px 12px;
              font-size: 0.9rem;
            }
            
            .login-btn {
              padding: 12px;
              font-size: 0.95rem;
            }
          }
          
          /* Tablet and larger mobile devices */
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            .login-form {
              max-width: 500px;
              padding: 40px 35px;
            }
            
            .app-title {
              font-size: 3rem;
            }
            
            .app-subtitle {
              font-size: 1.1rem;
            }
            
            .login-form h2 {
              font-size: 2rem;
            }
          }
          
          /* Desktop devices */
          @media screen and (min-width: 1025px) {
            .login-form {
              max-width: 450px;
              padding: 40px 35px;
            }
          }
          
          /* Prevent zoom on input focus for mobile */
          @media screen and (max-width: 768px) {
            .form-group input {
              font-size: 16px; /* Prevents zoom on iOS */
            }
          }
          
          /* Touch device optimizations */
          @media (hover: none) and (pointer: coarse) {
            .login-btn:hover {
              transform: none;
            }
            
            .form-group input:focus {
              transform: none;
            }
            
            .forgot-password a:hover,
            .signup-link a:hover {
              text-decoration: none;
            }
          }
          
          /* Landscape mode optimizations */
          @media screen and (max-height: 500px) and (orientation: landscape) {
            .login-container {
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .login-form {
              padding: 20px 25px;
              max-height: 90vh;
              overflow-y: auto;
            }
            
            .form-group {
              margin-bottom: 15px;
            }
            
            .divider {
              margin: 20px 0;
            }
          }
        `}
      </style>
      
      {/* Fallback background in case video fails to load */}
      <div className="fallback-background"></div>
      
      {/* Local video background */}
      <video
        ref={videoRef}
        className="video-background"
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleVideoLoad}
      >
        <source src={animeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay"></div>
      
      <div className="login-form">
        <div className="app-title">MyAnimeVerse</div>
        <p className="app-subtitle">Your portal to the anime universe</p>
        <h2>Welcome Back</h2>
        
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="user_name">Username</label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formik.values.user_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your username"
              className={formik.touched.user_name && formik.errors.user_name ? 'error' : ''}
            />
            {formik.touched.user_name && formik.errors.user_name && (
              <span className="field-error">{formik.errors.user_name}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your password"
              className={formik.touched.password && formik.errors.password ? 'error' : ''}
            />
            {formik.touched.password && formik.errors.password && (
              <span className="field-error">{formik.errors.password}</span>
            )}
          </div>
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'LOGGING IN...' : 'Login'}
          </button>
        </form>

        <p className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_white"
            size="large"
            text="signin_with"
            shape="rectangular"
            width={isMobile ? "280" : "350"}
          />
        </div>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;