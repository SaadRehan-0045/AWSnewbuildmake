import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import the same local video file
import animeVideo from './video/animevideo.mp4';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email and OTP from location state
  const { email, otp } = location.state || {};

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
    newPassword: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage('');
      formik.setErrors({});

      try {
        const response = await axios.post('/api/reset-password', {
          email,
          otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        });
        
        if (response.data.success) {
          setMessage('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Password reset successfully! Please login with your new password.' } 
            });
          }, 2000);
        } else {
          formik.setFieldError('general', response.data.message);
        }
      } catch (error) {
        formik.setFieldError('general', error.response?.data?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    },
  });

  if (!email || !otp) {
    return (
      <div className="reset-password-container">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            .reset-password-container {
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
            
            .error-form {
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
              text-align: center;
            }
            
            .error-form::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2);
              border-radius: 20px 20px 0 0;
            }
            
            .error-form h2 {
              color: #ff6b6b;
              margin-bottom: 15px;
              font-size: 1.8rem;
            }
            
            .error-form p {
              color: rgba(255, 255, 255, 0.8);
              margin-bottom: 25px;
              font-size: 1rem;
              line-height: 1.4;
            }
            
            .back-btn {
              padding: 12px 25px;
              background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%);
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 0.95rem;
              cursor: pointer;
              transition: all 0.3s ease;
              font-weight: 600;
            }
            
            .back-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(120, 115, 245, 0.4);
            }

            /* Mobile optimizations for error state */
            @media screen and (max-width: 412px) {
              .reset-password-container {
                padding: 15px 10px;
              }
              
              .error-form {
                padding: 25px 20px;
              }
              
              .error-form h2 {
                font-size: 1.5rem;
                margin-bottom: 12px;
              }
              
              .error-form p {
                font-size: 0.9rem;
                margin-bottom: 20px;
              }
              
              .back-btn {
                padding: 10px 20px;
                font-size: 0.9rem;
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
        
        <div className="error-form">
          <h2>Error</h2>
          <p>Invalid reset link. Please start the password reset process again.</p>
          <button 
            onClick={() => navigate('/forgot-password')}
            className="back-btn"
          >
            Go Back to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .reset-password-container {
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
          
          .reset-password-form {
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
          
          .reset-password-form::before {
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
          
          .reset-password-form h2 {
            text-align: center;
            margin-bottom: 25px;
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 600;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            line-height: 1.3;
          }
          
          .email-display {
            text-align: center;
            margin-bottom: 30px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #7873f5;
            line-height: 1.4;
          }
          
          .email-display strong {
            color: #ffffff;
            font-weight: 600;
            word-break: break-all;
          }
          
          .password-requirements {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #7873f5;
          }
          
          .password-requirements h4 {
            color: #ffffff;
            margin-bottom: 10px;
            font-size: 0.95rem;
            font-weight: 600;
          }
          
          .password-requirements ul {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.85rem;
            padding-left: 18px;
            margin: 0;
          }
          
          .password-requirements li {
            margin-bottom: 4px;
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
          
          .reset-btn {
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
          
          .reset-btn:hover {
            background: linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(120, 115, 245, 0.6);
          }
          
          .reset-btn:active {
            transform: translateY(-1px);
          }
          
          .reset-btn:disabled {
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
            margin: 10px 0;
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
            .reset-password-container {
              padding: 15px 10px;
              min-height: 100vh;
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .reset-password-form {
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
            
            .reset-password-form h2 {
              font-size: 1.5rem;
              margin-bottom: 20px;
            }
            
            .email-display {
              font-size: 0.9rem;
              padding: 10px;
              margin-bottom: 25px;
            }
            
            .password-requirements {
              padding: 12px;
              margin-bottom: 20px;
            }
            
            .password-requirements h4 {
              font-size: 0.9rem;
            }
            
            .password-requirements ul {
              font-size: 0.8rem;
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
            
            .reset-btn {
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
              margin: 8px 0;
            }
          }
          
          /* Very small devices (less than 360px) */
          @media screen and (max-width: 360px) {
            .reset-password-container {
              padding: 10px 8px;
            }
            
            .reset-password-form {
              padding: 20px 15px;
            }
            
            .app-title {
              font-size: 2rem;
            }
            
            .app-subtitle {
              font-size: 0.85rem;
            }
            
            .reset-password-form h2 {
              font-size: 1.3rem;
            }
            
            .form-group input {
              padding: 10px 12px;
              font-size: 0.9rem;
            }
            
            .reset-btn {
              padding: 12px;
              font-size: 0.95rem;
            }
          }
          
          /* Tablet and larger mobile devices (769px - 1024px) */
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            .reset-password-form {
              max-width: 500px;
              padding: 40px 35px;
            }
            
            .app-title {
              font-size: 3rem;
            }
            
            .app-subtitle {
              font-size: 1.1rem;
            }
            
            .reset-password-form h2 {
              font-size: 2rem;
            }
          }
          
          /* Desktop devices (1025px and above) */
          @media screen and (min-width: 1025px) {
            .reset-password-form {
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
            .reset-btn:hover {
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
            .reset-password-container {
              align-items: flex-start;
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .reset-password-form {
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
            
            .email-display {
              margin-bottom: 20px;
            }
            
            .password-requirements {
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
      
      <div className="reset-password-form">
        <div className="app-title">MyAnimeVerse</div>
        <p className="app-subtitle">Your portal to the anime universe</p>
        <h2>Reset Password</h2>
        
        <div className="email-display">
          Reset password for: <strong>{email}</strong>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        {formik.errors.general && <div className="error-message">{formik.errors.general}</div>}
        
        <form onSubmit={formik.handleSubmit}>
          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li>At least 8 characters long</li>
              <li>Contains at least one uppercase letter</li>
              <li>Contains at least one lowercase letter</li>
              <li>Contains at least one number</li>
            </ul>
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your new password"
              className={formik.touched.newPassword && formik.errors.newPassword ? 'error' : ''}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <span className="field-error">{formik.errors.newPassword}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Confirm your new password"
              className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <span className="field-error">{formik.errors.confirmPassword}</span>
            )}
          </div>
          
          <button type="submit" disabled={loading} className="reset-btn">
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-links">
          <p className="auth-link">
            Remember your password? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;