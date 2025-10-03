import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import the same local video file
import animeVideo from './video/animevideo.mp4';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
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

  // Validation schema with Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required')
      .test(
        'valid-domain',
        'Email domain must be from a supported provider (gmail.com, outlook.com, yahoo.com, hotmail.com)',
        (value) => {
          if (!value) return false;
          const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
          const domain = value.split('@')[1];
          return domains.includes(domain);
        }
      )
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage('');
      formik.setErrors({});

      try {
        const response = await axios.post('/api/forgot-password', { email: values.email });
        
        if (response.data.success) {
          setMessage('OTP sent to your email!');
          // Navigate to verify OTP page after a short delay
          setTimeout(() => {
            navigate('/verify-otp', { state: { email: values.email } });
          }, 1500);
        } else {
          formik.setFieldError('general', response.data.message);
        }
      } catch (error) {
        // Handle specific error cases
        const errorMessage = error.response?.data?.message || 'Failed to send OTP';
        
        // If it's a Google account error, show a link to login with Google
        if (errorMessage.includes('Google account')) {
          formik.setFieldError('general', `${errorMessage} Please use Google Sign-In.`);
        } 
        // If it's a multiple accounts error, provide guidance
        else if (errorMessage.includes('multiple accounts')) {
          formik.setFieldError('general', `${errorMessage} Please try logging in with your username or use Google Sign-In.`);
        } else {
          formik.setFieldError('general', errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="forgot-password-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .forgot-password-container {
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
          
          .forgot-password-form {
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
          
          .forgot-password-form::before {
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
            margin-bottom: 25px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 1rem;
            font-weight: 300;
            letter-spacing: 0.5px;
            line-height: 1.4;
            padding: 0 10px;
          }
          
          .forgot-password-form h2 {
            text-align: center;
            margin-bottom: 25px;
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 600;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            line-height: 1.3;
          }
          
          .form-description {
            text-align: center;
            margin-bottom: 30px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            line-height: 1.5;
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
          
          .submit-btn {
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
          
          .submit-btn:hover {
            background: linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(120, 115, 245, 0.6);
          }
          
          .submit-btn:active {
            transform: translateY(-1px);
          }
          
          .submit-btn:disabled {
            background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          .auth-links {
            text-align: center;
            margin-top: 25px;
          }
          
          .auth-link {
            display: block;
            margin: 8px 0;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.95rem;
            line-height: 1.4;
          }
          
          .auth-link a {
            color: #ff6ec4;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .auth-link a:hover {
            color: #7873f5;
            text-decoration: underline;
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
          
          .form-group {
            animation: fadeInUp 0.6s ease-out;
          }
          
          /* Samsung Galaxy A26 Specific Optimizations (412x915px) */
          @media screen and (max-width: 412px) and (max-height: 915px) {
            .forgot-password-container {
              padding: 15px 10px;
              min-height: 100vh;
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .forgot-password-form {
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
              margin-bottom: 20px;
              padding: 0 5px;
            }
            
            .forgot-password-form h2 {
              font-size: 1.5rem;
              margin-bottom: 20px;
            }
            
            .form-description {
              font-size: 0.9rem;
              margin-bottom: 25px;
              line-height: 1.4;
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
            
            .submit-btn {
              padding: 14px;
              font-size: 1rem;
              margin-top: 5px;
              border-radius: 8px;
            }
            
            .auth-links {
              margin-top: 20px;
            }
            
            .auth-link {
              font-size: 0.9rem;
              margin: 6px 0;
            }
          }
          
          /* Very small devices (less than 360px) */
          @media screen and (max-width: 360px) {
            .forgot-password-container {
              padding: 10px 8px;
            }
            
            .forgot-password-form {
              padding: 20px 15px;
            }
            
            .app-title {
              font-size: 2rem;
            }
            
            .app-subtitle {
              font-size: 0.85rem;
            }
            
            .forgot-password-form h2 {
              font-size: 1.3rem;
            }
            
            .form-group input {
              padding: 10px 12px;
              font-size: 0.9rem;
            }
            
            .submit-btn {
              padding: 12px;
              font-size: 0.95rem;
            }
          }
          
          /* Tablet and larger mobile devices (769px - 1024px) */
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            .forgot-password-form {
              max-width: 500px;
              padding: 40px 35px;
            }
            
            .app-title {
              font-size: 3rem;
            }
            
            .app-subtitle {
              font-size: 1.1rem;
            }
            
            .forgot-password-form h2 {
              font-size: 2rem;
            }
          }
          
          /* Desktop devices (1025px and above) */
          @media screen and (min-width: 1025px) {
            .forgot-password-form {
              max-width: 450px;
              padding: 40px 35px;
            }
          }
          
          /* Prevent zoom on input focus for mobile iOS devices */
          @media screen and (max-width: 768px) {
            .form-group input {
              font-size: 16px;
            }
          }
          
          /* Touch device optimizations */
          @media (hover: none) and (pointer: coarse) {
            .submit-btn:hover {
              transform: none;
            }
            
            .form-group input:focus {
              transform: none;
            }
            
            .auth-link a:hover {
              text-decoration: none;
            }
          }
          
          /* Landscape mode optimizations for mobile */
          @media screen and (max-height: 500px) and (orientation: landscape) {
            .forgot-password-container {
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .forgot-password-form {
              padding: 20px 25px;
              max-height: 90vh;
              overflow-y: auto;
            }
            
            .form-group {
              margin-bottom: 15px;
            }
            
            .app-title {
              font-size: 1.8rem;
              margin-bottom: 5px;
            }
            
            .app-subtitle {
              margin-bottom: 15px;
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
      
      <div className="forgot-password-form">
        <div className="app-title">MyAnimeVerse</div>
        <p className="app-subtitle">Your portal to the anime universe</p>
        <h2>Reset Password</h2>
        
        <p className="form-description">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
        
        {message && <div className="success-message">{message}</div>}
        {formik.errors.general && <div className="error-message">{formik.errors.general}</div>}
        
        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your registered email"
              className={formik.touched.email && formik.errors.email ? 'error' : ''}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="field-error">{formik.errors.email}</span>
            )}
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="auth-links">
          <p className="auth-link">
            Remember your password? <Link to="/login">Login here</Link>
          </p>
          
          <p className="auth-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;