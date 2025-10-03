import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Import the local video file
import animeVideo from './video/animevideo.mp4';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { signup, googleSignup } = useAuth();
  const navigate = useNavigate();

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

  // UPDATED Validation schema with Yup - removed email validation for username
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    user_name: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    dateOfBirth: Yup.date()
      .required('Date of birth is required')
      .max(new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000), 'You must be at least 13 years old')
      .min(new Date('1900-01-01'), 'Please enter a valid date'),
    gender: Yup.string()
      .required('Gender is required')
      .oneOf(['male', 'female', 'other', 'prefer-not-to-say'], 'Please select a valid gender'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      user_name: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      dateOfBirth: null,
      gender: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      
      // Remove confirmPassword from data sent to server
      const { confirmPassword, ...signupData } = values;
      
      try {
        const result = await signup(signupData);
        
        if (result.success) {
          // Always navigate to login page after successful signup
          navigate('/login', { 
            state: { 
              message: 'Account created successfully! Please login to continue.',
              type: 'success'
            } 
          });
        } else {
          formik.setFieldError('general', result.message || 'Signup failed. Please try again.');
        }
      } catch (error) {
        console.error('Signup error:', error);
        formik.setFieldError('general', 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  // UPDATED Google signup handler for JWT
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      formik.setErrors({});
      
      // Decode the JWT token to get user info
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const googleUser = JSON.parse(jsonPayload);
      
      const userData = {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        sub: googleUser.sub
      };

      const result = await googleSignup(userData);
      
      if (result.success) {
        // Navigate to login after Google signup
        navigate('/login', { 
          state: { 
            message: 'Account created successfully with Google! Please login.',
            type: 'success'
          } 
        });
      } else {
        formik.setFieldError('general', result.message || 'Google signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      formik.setFieldError('general', 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    formik.setFieldError('general', 'Google signup failed. Please try again.');
  };

  return (
    <div className="signup-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .signup-container {
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
          
          .signup-form {
            background: rgba(255, 255, 255, 0.12);
            padding: 30px 25px;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 500px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            position: relative;
            z-index: 1;
            transition: all 0.3s ease-in-out;
            opacity: ${videoLoaded ? 1 : 0.8};
            overflow: visible;
            margin: 0 auto;
          }
          
          .signup-form::before {
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
          
          .signup-form h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 600;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            line-height: 1.3;
          }
          
          .form-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .form-group-full {
            margin-bottom: 0;
            position: relative;
          }
          
          .form-group {
            position: relative;
            min-width: 0;
          }
          
          .form-group label, .form-group-full label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.95);
            font-size: 0.95rem;
            letter-spacing: 0.3px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          
          .form-group input, .form-group select, 
          .form-group-full input, .form-group-full select {
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
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          .form-group input::placeholder, .form-group select::placeholder,
          .form-group-full input::placeholder, .form-group-full select::placeholder {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.95rem;
          }
          
          .form-group input:focus, .form-group select:focus,
          .form-group-full input:focus, .form-group-full select:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .form-group input.error, .form-group select.error,
          .form-group-full input.error, .form-group-full select.error {
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
          
          .signup-btn {
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
            margin-top: 20px;
            box-shadow: 0 8px 25px rgba(120, 115, 245, 0.4);
          }
          
          .signup-btn:hover {
            background: linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(120, 115, 245, 0.6);
          }
          
          .signup-btn:active {
            transform: translateY(-1px);
          }
          
          .signup-btn:disabled {
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
          
          .google-signup {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
          }
          
          .login-link {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            margin-top: 25px;
            line-height: 1.4;
          }
          
          .login-link a {
            color: #ff6ec4;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .login-link a:hover {
            color: #7873f5;
            text-decoration: underline;
          }
          
          /* Date Picker Styles - Mobile Optimized */
          .react-datepicker-wrapper {
            width: 100%;
          }
          
          .react-datepicker__input-container input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            box-sizing: border-box;
            font-size: 1rem;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff !important;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
            backdrop-filter: blur(10px);
          }
          
          .react-datepicker__input-container input::placeholder {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.95rem;
          }
          
          .react-datepicker__input-container input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .react-datepicker__input-container input.error {
            border-color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
          }
          
          /* Date Picker Dropdown Styles - Mobile Optimized */
          .react-datepicker {
            background: rgba(40, 40, 60, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            font-family: 'Poppins', sans-serif;
            font-size: 0.9rem;
            width: 100%;
            max-width: 300px;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
          
          .react-datepicker__header {
            background: rgba(120, 115, 245, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px;
          }
          
          .react-datepicker__current-month,
          .react-datepicker-time__header,
          .react-datepicker-year-header {
            color: white;
            font-weight: 600;
            font-size: 0.95rem;
          }
          
          .react-datepicker__day-name {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.85rem;
            width: 2rem;
            line-height: 2rem;
          }
          
          .react-datepicker__day {
            color: white;
            font-size: 0.85rem;
            width: 2rem;
            line-height: 2rem;
            margin: 0.1rem;
          }
          
          .react-datepicker__day:hover {
            background: rgba(120, 115, 245, 0.3);
            border-radius: 50%;
          }
          
          .react-datepicker__day--selected {
            background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%);
            border-radius: 50%;
          }
          
          .react-datepicker__day--keyboard-selected {
            background: rgba(120, 115, 245, 0.5);
            border-radius: 50%;
          }
          
          .react-datepicker__navigation-icon::before {
            border-color: white;
            border-width: 2px 2px 0 0;
            height: 8px;
            width: 8px;
          }
          
          .react-datepicker__triangle {
            display: none;
          }
          
          /* Select Dropdown Styles - Mobile Optimized */
          .form-group select {
            background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23ffffff' d='m0 1 2 2 2-2z'/></svg>");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 10px;
            padding-right: 40px;
          }
          
          .form-group select option {
            background: rgba(40, 40, 60, 0.95);
            color: white;
            padding: 10px;
            font-size: 0.9rem;
          }
          
          /* Custom scrollbar for select dropdown */
          .form-group select::-webkit-scrollbar {
            width: 6px;
          }
          
          .form-group select::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          
          .form-group select::-webkit-scrollbar-thumb {
            background: rgba(120, 115, 245, 0.5);
            border-radius: 3px;
          }
          
          .form-group select::-webkit-scrollbar-thumb:hover {
            background: rgba(120, 115, 245, 0.7);
          }
          
          /* Animation for form elements */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .form-group, .form-group-full {
            animation: fadeInUp 0.6s ease-out;
          }
          
          /* Samsung Galaxy A26 Specific Optimizations */
          @media screen and (max-width: 412px) and (max-height: 915px) {
            .signup-container {
              padding: 15px 10px;
              min-height: 100vh;
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .signup-form {
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
            
            .signup-form h2 {
              font-size: 1.5rem;
              margin-bottom: 25px;
            }
            
            .form-grid {
              gap: 15px;
              margin-bottom: 25px;
            }
            
            .form-group input, .form-group select,
            .form-group-full input, .form-group-full select,
            .react-datepicker__input-container input {
              padding: 12px 14px;
              font-size: 0.95rem;
              border-radius: 8px;
            }
            
            .form-group label, .form-group-full label {
              font-size: 0.9rem;
              margin-bottom: 6px;
            }
            
            .signup-btn {
              padding: 14px;
              font-size: 1rem;
              margin-top: 15px;
              border-radius: 8px;
            }
            
            .divider {
              margin: 25px 0;
            }
            
            .divider span {
              padding: 0 15px;
              font-size: 0.85rem;
            }
            
            .login-link {
              font-size: 0.9rem;
              margin-top: 20px;
            }
          }
          
          /* Very small devices (Galaxy A26 is 412px, but for extra safety) */
          @media screen and (max-width: 360px) {
            .signup-container {
              padding: 10px 8px;
            }
            
            .signup-form {
              padding: 20px 15px;
            }
            
            .app-title {
              font-size: 2rem;
            }
            
            .app-subtitle {
              font-size: 0.85rem;
            }
            
            .signup-form h2 {
              font-size: 1.3rem;
            }
            
            .form-group input, .form-group select,
            .form-group-full input, .form-group-full select {
              padding: 10px 12px;
              font-size: 0.9rem;
            }
          }
          
          /* Tablet and larger mobile devices */
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            .signup-form {
              max-width: 600px;
              padding: 40px 35px;
            }
            
            .app-title {
              font-size: 3rem;
            }
            
            .app-subtitle {
              font-size: 1.1rem;
            }
            
            .signup-form h2 {
              font-size: 2rem;
            }
          }
          
          /* Desktop devices */
          @media screen and (min-width: 1025px) {
            .signup-form {
              max-width: 500px;
              padding: 40px 35px;
            }
          }
          
          /* Prevent zoom on input focus for mobile */
          @media screen and (max-width: 768px) {
            .form-group input, .form-group select,
            .form-group-full input, .form-group-full select {
              font-size: 16px; /* Prevents zoom on iOS */
            }
          }
          
          /* Touch device optimizations */
          @media (hover: none) and (pointer: coarse) {
            .signup-btn:hover {
              transform: none;
            }
            
            .form-group input:focus, .form-group select:focus {
              transform: none;
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
      
      <div className="signup-form">
        <div className="app-title">MyAnimeVerse</div>
        <p className="app-subtitle">Your portal to the anime universe</p>
        <h2>Create Your Account</h2>
        
        <form onSubmit={formik.handleSubmit}>
          <div className="form-grid">
            {formik.errors.general && <div className="error-message">{formik.errors.general}</div>}
            
            {/* Full Name */}
            <div className="form-group-full">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your full name"
                className={formik.touched.name && formik.errors.name ? 'error' : ''}
              />
              {formik.touched.name && formik.errors.name && (
                <span className="field-error">{formik.errors.name}</span>
              )}
            </div>
            
            {/* UPDATED Username field - no longer requires email format */}
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
            
            {/* Email for OTP */}
            <div className="form-group">
              <label htmlFor="email">Email for OTP</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email for OTP verification"
                className={formik.touched.email && formik.errors.email ? 'error' : ''}
              />
              {formik.touched.email && formik.errors.email && (
                <span className="field-error">{formik.errors.email}</span>
              )}
            </div>
            
            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <DatePicker
                id="dateOfBirth"
                name="dateOfBirth"
                selected={formik.values.dateOfBirth}
                onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                onBlur={formik.handleBlur}
                className={`react-datepicker-wrapper ${formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'error' : ''}`}
                dateFormat="MMMM d, yyyy"
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                placeholderText="Select your date of birth"
                wrapperClassName="date-picker-wrapper"
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <span className="field-error">{formik.errors.dateOfBirth}</span>
              )}
            </div>
            
            {/* Gender */}
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.gender && formik.errors.gender ? 'error' : ''}
              >
                <option value="" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Select your gender</option>
                <option value="male" style={{ color: 'white', background: 'rgba(40, 40, 60, 0.95)' }}>Male</option>
                <option value="female" style={{ color: 'white', background: 'rgba(40, 40, 60, 0.95)' }}>Female</option>
                <option value="other" style={{ color: 'white', background: 'rgba(40, 40, 60, 0.95)' }}>Other</option>
                <option value="prefer-not-to-say" style={{ color: 'white', background: 'rgba(40, 40, 60, 0.95)' }}>Prefer not to say</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <span className="field-error">{formik.errors.gender}</span>
              )}
            </div>
            
            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Create a strong password"
                className={formik.touched.password && formik.errors.password ? 'error' : ''}
              />
              {formik.touched.password && formik.errors.password && (
                <span className="field-error">{formik.errors.password}</span>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Confirm your password"
                className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <span className="field-error">{formik.errors.confirmPassword}</span>
              )}
            </div>
            
            {/* Sign Up Button */}
            <button type="submit" disabled={loading} className="signup-btn">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="google-signup">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_white"
            size="large"
            text="signup_with"
            width={isMobile ? "300" : "350"}
          />
        </div>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;