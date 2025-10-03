import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Box, styled, FormControl, InputBase, Button, TextareaAutosize, 
  Typography, TextField, MenuItem, Chip, Grid, Alert, CircularProgress,
  Snackbar, Dialog, DialogActions, DialogContent, DialogTitle, Slider,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CloudUpload, Crop, ZoomIn, ZoomOut, RotateLeft, RotateRight } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Layout from './Layout.jsx';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Formik and Yup imports
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import the same local video file
import animeVideo from './video/animevideo.mp4';

// Styled Components with glass morphism design - RESPONSIVE UPDATES
const Container = styled(Box)(({ theme }) => `
  margin: ${theme.breakpoints.down('sm') ? '20px 15px' : '50px 100px'};
  max-width: 100%;
  overflow-x: hidden;
`);

const GlassCard = styled(Box)(({ theme }) => `
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${theme.breakpoints.down('sm') ? '16px' : '20px'};
  padding: ${theme.breakpoints.down('sm') ? '20px 15px' : '30px'};
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  margin-bottom: ${theme.breakpoints.down('sm') ? '20px' : '30px'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2);
    border-radius: ${theme.breakpoints.down('sm') ? '16px 16px 0 0' : '20px 20px 0 0'};
  }
`);

const Image = styled('img')(({ theme }) => `
  width: 100%;
  height: ${theme.breakpoints.down('sm') ? '30vh' : '50vh'};
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
`);

const StyledFormControl = styled(FormControl)(({ theme }) => `
  margin-top: 10px;
  display: flex;
  flex-direction: ${theme.breakpoints.down('sm') ? 'column' : 'row'};
`);

const InputTextField = styled(InputBase)(({ theme }) => `
  flex: 1;
  margin: ${theme.breakpoints.down('sm') ? '0 0 15px 0' : '0 30px'};
  font-size: ${theme.breakpoints.down('sm') ? '20px' : '25px'};
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`);

const Textarea = styled(TextareaAutosize)(({ theme }) => `
  width: 100%;
  margin-top: 20px;
  font-size: ${theme.breakpoints.down('sm') ? '16px' : '18px'};
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: ${theme.breakpoints.down('sm') ? '12px' : '16px'};
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  
  &:focus-visible {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`);

const DropzoneContainer = styled(Box)(({ theme, isDragActive }) => `
  border: 2px dashed rgba(120, 115, 245, 0.5);
  border-radius: 12px;
  padding: ${theme.breakpoints.down('sm') ? '20px' : '30px'};
  text-align: center;
  cursor: pointer;
  margin-top: 20px;
  background-color: ${isDragActive ? 'rgba(120, 115, 245, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background-color: rgba(120, 115, 245, 0.1);
    border-color: rgba(120, 115, 245, 0.8);
  }
`);

const SectionTitle = styled(Typography)(({ theme }) => `
  margin-top: ${theme.breakpoints.down('sm') ? '20px' : '30px'};
  margin-bottom: ${theme.breakpoints.down('sm') ? '15px' : '20px'};
  font-weight: 600;
  color: white;
  border-bottom: 2px solid rgba(120, 115, 245, 0.5);
  padding-bottom: ${theme.breakpoints.down('sm') ? '8px' : '10px'};
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-size: ${theme.breakpoints.down('sm') ? '1.3rem' : '1.5rem'};
`);

const ErrorText = styled(Typography)(({ theme }) => `
  color: #ff6b6b;
  margin-top: 8px;
  font-size: ${theme.breakpoints.down('sm') ? '12px' : '14px'};
  font-weight: 500;
`);

const CharacterCount = styled(Typography)(({ theme, count }) => `
  text-align: right;
  font-size: ${theme.breakpoints.down('sm') ? '12px' : '14px'};
  color: ${count > 150 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)'};
  margin-top: 8px;
`);

const PublishButtonContainer = styled(Box)(({ theme }) => `
  display: flex;
  justify-content: ${theme.breakpoints.down('sm') ? 'center' : 'flex-end'};
  margin-top: ${theme.breakpoints.down('sm') ? '30px' : '40px'};
  padding-top: ${theme.breakpoints.down('sm') ? '20px' : '30px'};
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`);

const ControlsContainer = styled(Box)(({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.breakpoints.down('sm') ? '12px' : '16px'};
  margin-top: 16px;
  padding: ${theme.breakpoints.down('sm') ? '15px' : '20px'};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
`);

const ControlRow = styled(Box)(({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.breakpoints.down('sm') ? '12px' : '16px'};
  flex-wrap: ${theme.breakpoints.down('sm') ? 'wrap' : 'nowrap'};
`);

const ControlLabel = styled(Typography)(({ theme }) => `
  min-width: ${theme.breakpoints.down('sm') ? '60px' : '80px'};
  font-weight: 500;
  color: white;
  font-size: ${theme.breakpoints.down('sm') ? '14px' : '16px'};
`);

// Anime genres and categories
const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Isekai', 'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller'
];

const CATEGORIES = [
  'TV Series', 'Movie', 'OVA', 'ONA', 'Special', 'Music'
];

const MAX_FILE_SIZE = 100 * 1024; // 100KB in bytes

// Validation Schema using Yup - removed username and email
const validationSchema = Yup.object({
  title: Yup.string()
    .required('Anime name is required')
    .min(3, 'Anime name must be at least 3 characters'),
  description: Yup.string()
    .required('Anime details are required')
    .min(150, 'Anime details must be at least 150 characters'),
  picture: Yup.string()
    .required('Cover image is required'),
  downloadLinks: Yup.string()
    .required('Download links are required')
    .test('valid-links', 'Please provide valid download links', (value) => {
      if (!value) return false;
      const links = value.split(',').map(link => link.trim());
      return links.every(link => link.length > 0);
    }),
  category: Yup.string()
    .required('Category is required'),
  genres: Yup.array()
    .min(1, 'At least one genre is required')
    .required('At least one genre is required'),
  userId: Yup.string().required('User ID is required')
});

// Custom styled TextField for consistent theming - RESPONSIVE UPDATES
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    fontSize: theme.breakpoints.down('sm') ? '14px' : '16px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(120, 115, 245, 0.8)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: theme.breakpoints.down('sm') ? '14px' : '16px',
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: theme.breakpoints.down('sm') ? '12px' : '14px',
    '&.Mui-error': {
      color: '#ff6b6b',
    },
  },
  '& .MuiMenu-paper': {
    backgroundColor: 'rgba(40, 40, 60, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  '& .MuiMenuItem-root': {
    color: 'white',
    fontSize: theme.breakpoints.down('sm') ? '14px' : '16px',
    '&:hover': {
      backgroundColor: 'rgba(120, 115, 245, 0.3)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(120, 115, 245, 0.5)',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgba(120, 115, 245, 0.6)',
    },
  },
}));

const CreatePost = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const { user, authToken, getToken } = useAuth();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Video background state
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!user || !authToken) {
        const token = getToken?.();
        if (!token) {
          setSnackbar({ 
            open: true, 
            message: 'Please login to create a post', 
            severity: 'warning' 
          });
          // Optional: Redirect immediately to login
          // navigate('/login');
        }
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [user, authToken, getToken, navigate]);

  // Memoized formik instance to prevent unnecessary re-renders
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      picture: '',
      downloadLinks: '',
      genres: [],
      category: '',
      userId: user?.userId || user?._id || ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await savePost(values);
    },
    enableReinitialize: true
  });

  // Memoized user effect to prevent unnecessary dependencies
  useEffect(() => {
    if (user) {
      formik.setValues(prevValues => ({
        ...prevValues,
        userId: user.userId || user._id || ''
      }));
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoized display image URL
  const displayImage = useMemo(() => {
    return croppedImage || (formik.values.picture ? `http://localhost:8080/file/${formik.values.picture}` : 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9pJTIwc2E0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80');
  }, [croppedImage, formik.values.picture]);

  // Memoized file validation function
  const validateImageFile = useCallback((fileToValidate) => {
    // Check file size (max 100KB)
    if (fileToValidate.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Image size must be less than 100KB. Your file is ${(fileToValidate.size / 1024).toFixed(2)}KB.`
      };
    }
    
    // Check file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validImageTypes.includes(fileToValidate.type)) {
      return {
        isValid: false,
        error: 'Only JPG, JPEG, and PNG images are allowed.'
      };
    }
    
    return { isValid: true, error: null };
  }, []);

  // Optimized drop handler with proper dependencies
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setSnackbar({ 
          open: true, 
          message: 'File is too large. Maximum size is 100KB.', 
          severity: 'error' 
        });
      } else if (error.code === 'file-invalid-type') {
        setSnackbar({ 
          open: true, 
          message: 'Invalid file type. Only JPG, JPEG, and PNG images are allowed.', 
          severity: 'error' 
        });
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Validate the file
      const validation = validateImageFile(selectedFile);
      if (!validation.isValid) {
        setSnackbar({ 
          open: true, 
          message: validation.error, 
          severity: 'error' 
        });
        return;
      }
      
      setFile(selectedFile);
      // Open crop dialog instead of uploading immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setCropDialogOpen(true);
        // Reset zoom and rotation when new image is loaded
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [validateImageFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE // 100KB limit
  });

  // Memoized image load handler
  const onImageLoad = useCallback((e) => {
    // Set initial crop to center of image
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
  }, []);

  // Optimized crop function with proper cleanup
  const getCroppedImg = useCallback((image, cropConfig, fileName) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate scale based on zoom
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Set canvas dimensions
    canvas.width = cropConfig.width;
    canvas.height = cropConfig.height;

    // Apply rotation transformation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped and transformed image
    ctx.drawImage(
      image,
      cropConfig.x * scaleX,
      cropConfig.y * scaleY,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY,
      0,
      0,
      cropConfig.width,
      cropConfig.height
    );

    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [rotation]);

  // Optimized crop complete handler
  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped.jpg'
      );
      
      // Create a preview URL for the cropped image
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setCroppedImage(croppedImageUrl);
      
      // Close the crop dialog
      setCropDialogOpen(false);
      
      // Upload the cropped image
      uploadFile(croppedImageBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error cropping image', 
        severity: 'error' 
      });
    }
  }, [completedCrop, getCroppedImg]);

  // UPDATED: Optimized file upload function with JWT token - FIXED
  const uploadFile = useCallback(async (fileToUpload) => {
    if (!fileToUpload) return;
    
    // Final validation before upload
    const validation = validateImageFile(fileToUpload);
    if (!validation.isValid) {
      setSnackbar({ 
        open: true, 
        message: validation.error, 
        severity: 'error' 
      });
      setFile(null);
      return;
    }
    
    setUploading(true);
    const data = new FormData();
    data.append("file", fileToUpload);
    
    try {
      // UPDATED: Get token from AuthContext - FIXED
      const token = authToken || (getToken ? getToken() : null);
      
      if (!token) {
        setSnackbar({ 
          open: true, 
          message: 'Please login to upload images', 
          severity: 'error' 
        });
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // UPDATED: Add Authorization header
        }
      };

      const uploadResponse = await axios.post('http://localhost:8080/file/upload', data, config);
      // Update Formik values instead of local state
      formik.setFieldValue('picture', uploadResponse.data.filename);
      formik.setFieldError('picture', '');
      setSnackbar({ open: true, message: 'Image uploaded successfully!', severity: 'success' });
    } catch (error) {
      console.error("Error uploading image:", error);
      let errorMessage = 'Error uploading image';
      
      // UPDATED: Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        navigate('/login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      formik.setFieldError('picture', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [validateImageFile, formik, authToken, getToken, navigate]);

  // UPDATED: Optimized save post function with JWT token - FIXED
  const savePost = useCallback(async (values) => {
    // Check if user is authenticated
    if (!user) {
      setSnackbar({ open: true, message: 'Please log in to create a post', severity: 'error' });
      navigate('/login');
      return;
    }

    // Wait for any ongoing uploads to complete
    if (uploading) {
      setSnackbar({ open: true, message: 'Please wait for the image to finish uploading', severity: 'warning' });
      return;
    }

    // Validate that picture is uploaded
    if (!values.picture) {
      setSnackbar({ open: true, message: 'Please upload a cover image first', severity: 'error' });
      return;
    }

    try {
      // UPDATED: Get token from AuthContext - FIXED
      const token = authToken || (getToken ? getToken() : null);
      
      if (!token) {
        setSnackbar({ open: true, message: 'Please login to create a post', severity: 'error' });
        navigate('/login');
        return;
      }

      // Post data without username and email
      const postData = {
        title: values.title,
        description: values.description,
        picture: values.picture,
        downloadLinks: values.downloadLinks,
        genres: values.genres,
        category: values.category,
        userId: user.userId || user._id || ''
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // UPDATED: Add Authorization header
        }
      };

      const response = await axios.post('http://localhost:8080/createpost', postData, config);
      
      if (response.data && (response.data.success || response.data._id)) {
        setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      let errorMessage = 'An error occurred while creating the post. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action.';
      } else if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  }, [user, uploading, authToken, getToken, navigate]);

  // Memoized event handlers
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleCloseCropDialog = useCallback(() => {
    setCropDialogOpen(false);
    setOriginalImage(null);
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setCompletedCrop(null);
    setZoom(1);
    setRotation(0);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 1));
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation(prev => (prev - 90) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Optimized form handlers with debouncing for text inputs
  const handleGenreChange = useCallback((event) => {
    const { value } = event.target;
    formik.setFieldValue('genres', typeof value === 'string' ? value.split(',') : value);
  }, [formik]);

  const handleCategoryChange = useCallback((event) => {
    const { value } = event.target;
    formik.setFieldValue('category', value);
  }, [formik]);

  // Debounced input handler for text fields
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  }, [formik]);

  // Video loading and error handling
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  // Custom MenuProps for dropdown styling - RESPONSIVE
  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: 'rgba(40, 40, 60, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxHeight: isMobile ? 200 : 300,
        '& .MuiMenuItem-root': {
          color: 'white',
          fontSize: isMobile ? '14px' : '16px',
          '&:hover': {
            bgcolor: 'rgba(120, 115, 245, 0.3)',
          },
          '&.Mui-selected': {
            bgcolor: 'rgba(120, 115, 245, 0.5)',
          },
          '&.Mui-selected:hover': {
            bgcolor: 'rgba(120, 115, 245, 0.6)',
          },
        },
      },
    },
  };

  return (
    <Layout title="Create Anime Post">
      {/* Video Background */}
      <video
        ref={videoRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -2,
          filter: 'brightness(0.5) contrast(1.1)',
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleVideoLoad}
      >
        <source src={animeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(5, 2, 7, 0.8) 0%, rgba(49, 27, 146, 0.9) 100%)',
          zIndex: -1,
        }}
      />
      
      {/* Fallback Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #6a1b9a 0%, #311b92 100%)',
          zIndex: -3,
        }}
      />

      <Container sx={{ opacity: videoLoaded ? 1 : 0.8, transition: 'opacity 0.3s ease-in-out' }}>
        <form onSubmit={formik.handleSubmit}>
          <GlassCard>
            <SectionTitle variant="h5">Cover Image</SectionTitle>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)', fontSize: isMobile ? '12px' : '14px' }}>
              Maximum file size: 100KB. Supported formats: JPG, JPEG, PNG
            </Typography>
            
            {/* Display the cropped image or the uploaded image or default banner */}
            <Image src={displayImage} alt="banner" />
            
            <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: isMobile ? 36 : 48, color: '#7873f5', mb: 2 }} />
              {isDragActive ? (
                <Typography sx={{ color: 'white', fontSize: isMobile ? '14px' : '16px' }}>Drop the image here...</Typography>
              ) : (
                <Typography sx={{ color: 'white', fontSize: isMobile ? '14px' : '16px' }}>
                  Drag & drop an image here, or click to select
                </Typography>
              )}
              {file && (
                <Typography sx={{ color: 'white', fontSize: isMobile ? '12px' : '14px', mt: 1 }}>
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)}KB)
                </Typography>
              )}
              {uploading && (
                <Typography sx={{ color: 'white', fontSize: isMobile ? '12px' : '14px', mt: 1 }}>
                  Uploading... <CircularProgress size={isMobile ? 12 : 14} />
                </Typography>
              )}
            </DropzoneContainer>
            
            {formik.errors.picture && formik.touched.picture && (
              <ErrorText>{formik.errors.picture}</ErrorText>
            )}

            {/* Crop Dialog - RESPONSIVE */}
            <Dialog 
              open={cropDialogOpen} 
              onClose={handleCloseCropDialog} 
              maxWidth="lg" 
              fullWidth
              fullScreen={isMobile} // Fullscreen on mobile
              PaperProps={{
                sx: {
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  m: isMobile ? 0 : 2,
                  width: isMobile ? '100%' : 'auto',
                  height: isMobile ? '100%' : 'auto',
                }
              }}
            >
              <DialogTitle sx={{ 
                color: 'white', 
                background: 'rgba(255, 255, 255, 0.1)',
                fontSize: isMobile ? '1.2rem' : '1.5rem'
              }}>
                Crop Image
              </DialogTitle>
              <DialogContent sx={{ p: isMobile ? 1 : 2 }}>
                {originalImage && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <ReactCrop
                        crop={crop}
                        onChange={setCrop}
                        onComplete={setCompletedCrop}
                        aspect={16 / 9}
                      >
                        <img
                          ref={imgRef}
                          src={originalImage}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: isMobile ? '300px' : '400px',
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            borderRadius: '8px'
                          }}
                          onLoad={onImageLoad}
                          alt="Crop preview"
                        />
                      </ReactCrop>
                    </Box>
                    
                    <ControlsContainer>
                      <ControlRow>
                        <ControlLabel>Zoom:</ControlLabel>
                        <Slider
                          value={zoom}
                          onChange={(e, newValue) => setZoom(newValue)}
                          min={1}
                          max={3}
                          step={0.1}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                          sx={{ flex: 1, color: '#7873f5' }}
                          size={isMobile ? "small" : "medium"}
                        />
                        <IconButton onClick={handleZoomOut} size={isMobile ? "small" : "medium"} sx={{ color: 'white' }}>
                          <ZoomOut />
                        </IconButton>
                        <IconButton onClick={handleZoomIn} size={isMobile ? "small" : "medium"} sx={{ color: 'white' }}>
                          <ZoomIn />
                        </IconButton>
                      </ControlRow>

                      <ControlRow>
                        <ControlLabel>Rotation:</ControlLabel>
                        <Slider
                          value={rotation}
                          onChange={(e, newValue) => setRotation(newValue)}
                          min={-180}
                          max={180}
                          step={90}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}°`}
                          sx={{ flex: 1, color: '#7873f5' }}
                          size={isMobile ? "small" : "medium"}
                        />
                        <IconButton onClick={handleRotateLeft} size={isMobile ? "small" : "medium"} sx={{ color: 'white' }}>
                          <RotateLeft />
                        </IconButton>
                        <IconButton onClick={handleRotateRight} size={isMobile ? "small" : "medium"} sx={{ color: 'white' }}>
                          <RotateRight />
                        </IconButton>
                      </ControlRow>
                    </ControlsContainer>
                  </>
                )}
              </DialogContent>
              <DialogActions sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: isMobile ? 1 : 2,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0
              }}>
                <Button 
                  onClick={handleCloseCropDialog}
                  sx={{ color: 'white', width: isMobile ? '100%' : 'auto' }}
                  size={isMobile ? "small" : "medium"}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCropComplete} 
                  variant="contained" 
                  disabled={!completedCrop}
                  startIcon={<Crop />}
                  sx={{
                    background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
                    },
                    width: isMobile ? '100%' : 'auto'
                  }}
                  size={isMobile ? "small" : "medium"}
                >
                  Apply Crop
                </Button>
              </DialogActions>
            </Dialog>
          </GlassCard>

          <GlassCard>
            {/* Download Options Section */}
            <SectionTitle variant="h5">Download Options</SectionTitle>
            <Alert severity="info" sx={{ 
              mb: 2, 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: 'white',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              Please provide download links for the anime content
            </Alert>

            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                  Download Links
                </Typography>
                <StyledTextField
                  fullWidth
                  placeholder="Enter download links (MEGA, Google Drive, etc.) - separate multiple links with commas"
                  onChange={handleInputChange}
                  onBlur={formik.handleBlur}
                  name="downloadLinks"
                  value={formik.values.downloadLinks}
                  multiline
                  rows={isMobile ? 3 : 4}
                  error={formik.touched.downloadLinks && Boolean(formik.errors.downloadLinks)}
                  helperText={formik.touched.downloadLinks && formik.errors.downloadLinks 
                    ? formik.errors.downloadLinks 
                    : "Provide direct download links for the anime content"}
                />
              </Grid>
            </Grid>
          </GlassCard>

          <GlassCard>
            {/* Anime Information Section */}
            <SectionTitle variant="h5">Anime Information</SectionTitle>
            
            <StyledFormControl>
              <InputTextField 
                placeholder="Anime Name" 
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
                name="title" 
                value={formik.values.title}
                error={formik.touched.title && Boolean(formik.errors.title)}
              />
            </StyledFormControl>
            {formik.errors.title && formik.touched.title && (
              <ErrorText>{formik.errors.title}</ErrorText>
            )}

            <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  select
                  fullWidth
                  label="Category"
                  value={formik.values.category}
                  onChange={handleCategoryChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category 
                    ? formik.errors.category 
                    : "Select a category"}
                  displayEmpty
                  name="category"
                  MenuProps={menuProps}
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="">
                    <em style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? '14px' : '16px' }}>Select Category</em>
                  </MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledTextField
                  select
                  fullWidth
                  label="Genres"
                  value={formik.values.genres}
                  onChange={handleGenreChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.genres && Boolean(formik.errors.genres)}
                  helperText={formik.touched.genres && formik.errors.genres 
                    ? formik.errors.genres 
                    : "Select one or more genres"}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => {
                      if (selected.length === 0) {
                        return <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isMobile ? '14px' : '16px' }}>Select Genres</span>;
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={value} 
                              size="small" 
                              sx={{ 
                                background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                                color: 'white',
                                fontSize: isMobile ? '10px' : '12px',
                                height: isMobile ? 24 : 32
                              }}
                            />
                          ))}
                        </Box>
                      );
                    },
                  }}
                  name="genres"
                  MenuProps={menuProps}
                  size={isMobile ? "small" : "medium"}
                >
                  {GENRES.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>
            </Grid>
          </GlassCard>

          <GlassCard>
            {/* Anime Details Section */}
            <SectionTitle variant="h5">Anime Details</SectionTitle>
            <Textarea
              minRows={isMobile ? 4 : 5}
              placeholder="Enter anime description, plot summary, episode information, etc. (Minimum 150 characters)"
              onChange={handleInputChange}
              onBlur={formik.handleBlur}
              name="description"
              value={formik.values.description}
            />
            <CharacterCount count={formik.values.description.length}>
              {formik.values.description.length}/150 characters (minimum 150 required)
            </CharacterCount>
            {formik.errors.description && formik.touched.description && (
              <ErrorText>{formik.errors.description}</ErrorText>
            )}
          </GlassCard>

          {/* Publish button - RESPONSIVE */}
          <PublishButtonContainer>
            <Button 
              type="submit"
              variant="contained" 
              disabled={uploading || formik.isSubmitting || checkingAuth}
              size={isMobile ? "medium" : "large"}
              sx={{ 
                minWidth: isMobile ? '100px' : '120px',
                background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(120, 115, 245, 0.6)',
                },
                fontSize: isMobile ? '1rem' : '1.1rem',
                padding: isMobile ? '10px 24px' : '12px 30px',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {checkingAuth ? (
                <>
                  Checking Auth... 
                  <CircularProgress size={isMobile ? 14 : 16} sx={{ ml: 1 }} />
                </>
              ) : uploading || formik.isSubmitting ? (
                <>
                  {isMobile ? 'Uploading...' : 'Uploading...'} 
                  <CircularProgress size={isMobile ? 14 : 16} sx={{ ml: 1 }} />
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </PublishButtonContainer>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default CreatePost;