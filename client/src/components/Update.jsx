import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Box,
  styled,
  FormControl,
  InputBase,
  Button,
  TextareaAutosize,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  CloudUpload,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  ArrowBack,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Layout from "./Layout.jsx";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Formik and Yup imports
import { useFormik } from "formik";
import * as Yup from "yup";

// Import the same local video file
import animeVideo from './video/animevideo.mp4';

// Styled Components with glass morphism design - OPTIMIZED FOR SAMSUNG GALAXY A26
const Container = styled(Box)`
  margin: 10px;
  padding: 8px;
  
  @media (min-width: 768px) {
    margin: 50px 100px;
    padding: 0;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    margin: 8px;
    padding: 5px;
  }
  
  @media (max-width: 390px) {
    margin: 5px;
    padding: 3px;
  }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  margin-bottom: 15px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2);
    border-radius: 12px 12px 0 0;
  }
  
  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    
    &::before {
      height: 4px;
      border-radius: 20px 20px 0 0;
    }
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    padding: 12px;
    border-radius: 10px;
    margin-bottom: 12px;
  }
`;

const Image = styled("img")`
  width: 100%;
  height: 25vh;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  @media (min-width: 768px) {
    height: 50vh;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    height: 22vh;
    border-radius: 5px;
  }
  
  @media (max-width: 390px) {
    height: 20vh;
  }
`;

const StyledFormControl = styled(FormControl)`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const InputTextField = styled(InputBase)`
  flex: 1;
  margin: 0;
  font-size: 16px;
  color: white;
  text-align: center;
  padding: 8px 12px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  @media (min-width: 768px) {
    margin: 0 30px;
    font-size: 25px;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    font-size: 14px;
    padding: 6px 10px;
  }
`;

const Textarea = styled(TextareaAutosize)`
  width: 100%;
  margin-top: 12px;
  font-size: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  min-height: 100px;
  
  &:focus-visible {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  @media (min-width: 768px) {
    font-size: 18px;
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
    min-height: 150px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    font-size: 13px;
    padding: 8px;
    min-height: 90px;
  }
`;

const DropzoneContainer = styled(Box)`
  border: 2px dashed rgba(120, 115, 245, 0.5);
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  margin-top: 12px;
  background-color: ${props => props.isDragActive ? 'rgba(120, 115, 245, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: rgba(120, 115, 245, 0.1);
    border-color: rgba(120, 115, 245, 0.8);
  }
  
  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 30px;
    margin-top: 20px;
    min-height: 120px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    padding: 12px;
    min-height: 70px;
    border-radius: 5px;
  }
`;

const SectionTitle = styled(Typography)`
  margin-top: 15px;
  margin-bottom: 12px;
  font-weight: 600;
  color: white;
  border-bottom: 2px solid rgba(120, 115, 245, 0.5);
  padding-bottom: 6px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  
  @media (min-width: 768px) {
    margin-top: 30px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    font-size: 0.9rem;
    margin-top: 12px;
    margin-bottom: 10px;
    padding-bottom: 5px;
  }
`;

const ErrorText = styled(Typography)`
  color: #ff6b6b;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 14px;
    margin-top: 8px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    font-size: 10px;
  }
`;

const CharacterCount = styled(Typography)`
  text-align: right;
  font-size: 11px;
  color: ${props => props.count > 150 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)'};
  margin-top: 4px;
  
  @media (min-width: 768px) {
    font-size: 14px;
    margin-top: 8px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    font-size: 10px;
  }
`;

const ButtonContainer = styled(Box)`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 40px;
    padding-top: 30px;
    gap: 15px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    margin-top: 15px;
    padding-top: 12px;
    gap: 10px;
  }
`;

const BackButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  font-size: 0.9rem;
  border-radius: 6px;
  backdrop-filter: blur(10px);
  min-width: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 12px 30px;
    font-size: 1.1rem;
    min-width: 200px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    padding: 8px 16px;
    font-size: 0.8rem;
    border-radius: 5px;
  }
`;

const TopButtonContainer = styled(Box)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
  
  @media (max-width: 480px) and (max-height: 900px) {
    margin-bottom: 12px;
  }
`;

const ControlsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  
  @media (min-width: 768px) {
    gap: 16px;
    margin-top: 16px;
    padding: 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    gap: 8px;
    padding: 10px;
    border-radius: 5px;
  }
`;

const ControlRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (min-width: 768px) {
    gap: 16px;
    flex-wrap: nowrap;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    gap: 8px;
  }
`;

const ControlLabel = styled(Typography)`
  min-width: 50px;
  font-weight: 500;
  color: white;
  font-size: 0.8rem;
  
  @media (min-width: 768px) {
    min-width: 80px;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) and (max-height: 900px) {
    min-width: 40px;
    font-size: 0.7rem;
  }
`;

// Anime genres and categories
const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Isekai", "Mecha", "Mystery", "Romance", "Sci-Fi", "Slice of Life",
  "Sports", "Supernatural", "Thriller"
];

const CATEGORIES = ["TV Series", "Movie", "OVA", "ONA", "Special", "Music"];

const MAX_FILE_SIZE = 100 * 1024; // 100KB in bytes

// Validation Schema using Yup
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Anime name is required")
    .min(3, "Anime name must be at least 3 characters"),
  description: Yup.string()
    .required("Anime details are required")
    .min(150, "Anime details must be at least 150 characters"),
  picture: Yup.string().required("Cover image is required"),
  downloadLinks: Yup.string()
    .required("Download links are required")
    .test("valid-links", "Please provide valid download links", (value) => {
      if (!value) return false;
      const links = value.split(",").map((link) => link.trim());
      return links.every((link) => link.length > 0);
    }),
  category: Yup.string().required("Category is required"),
  genres: Yup.array()
    .min(1, "At least one genre is required")
    .required("At least one genre is required"),
});

// Custom styled TextField for consistent theming - OPTIMIZED FOR MOBILE
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    fontSize: '14px',
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
    fontSize: '0.8rem',
    [theme.breakpoints.up('md')]: {
      fontSize: '1rem',
    },
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.7rem',
    '&.Mui-error': {
      color: '#ff6b6b',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '0.9rem',
    },
  },
  '& .MuiMenu-paper': {
    backgroundColor: 'rgba(40, 40, 60, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxHeight: '180px',
  },
  '& .MuiMenuItem-root': {
    color: 'white',
    fontSize: '0.8rem',
    minHeight: '35px',
    '&:hover': {
      backgroundColor: 'rgba(120, 115, 245, 0.3)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(120, 115, 245, 0.5)',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgba(120, 115, 245, 0.6)',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1rem',
      minHeight: '48px',
    },
  },
}));

const Update = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const { user, authToken } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Responsive hooks - Samsung Galaxy A26 has 1080x2340 resolution (~390-412px width)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallMobile = useMediaQuery('(max-width: 480px) and (max-height: 900px)');
  const isVerySmallMobile = useMediaQuery('(max-width: 390px)');

  // Video background state
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef(null);

  // Memoized formik instance
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      picture: "",
      downloadLinks: "",
      genres: [],
      category: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await updatePost(values);
    },
    enableReinitialize: true,
  });

  // Memoized display image URL
  const displayImage = useMemo(() => {
    return croppedImage || (formik.values.picture
      ? `http://localhost:8080/file/${formik.values.picture}`
      : "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9pJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80");
  }, [croppedImage, formik.values.picture]);

  // Memoized file validation function
  const validateImageFile = useCallback((fileToValidate) => {
    if (fileToValidate.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Image size must be less than 100KB. Your file is ${(
          fileToValidate.size / 1024
        ).toFixed(2)}KB.`,
      };
    }

    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validImageTypes.includes(fileToValidate.type)) {
      return {
        isValid: false,
        error: "Only JPG, JPEG, and PNG images are allowed.",
      };
    }

    return { isValid: true, error: null };
  }, []);

  // Fetch post data - UPDATED FOR JWT
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Prepare headers with JWT token
        const config = {};
        if (authToken) {
          config.headers = {
            'Authorization': `Bearer ${authToken}`
          };
        }

        const response = await axios.get(
          `http://localhost:8080/posts/${id}`,
          config
        );
        
        if (response.data) {
          formik.setValues({
            title: response.data.title || "",
            description: response.data.description || "",
            picture: response.data.picture || "",
            downloadLinks: response.data.downloadLinks || "",
            genres: response.data.genres || [],
            category: response.data.category || "",
          });
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        
        let errorMessage = "Error loading post data";
        if (error.response?.status === 401) {
          errorMessage = "Please login to view this post";
          navigate("/login");
        } else if (error.response?.status === 404) {
          errorMessage = "Post not found";
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, authToken, navigate]);

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

  // Optimized drop handler
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === "file-too-large") {
        setSnackbar({
          open: true,
          message: "File is too large. Maximum size is 100KB.",
          severity: "error",
        });
      } else if (error.code === "file-invalid-type") {
        setSnackbar({
          open: true,
          message: "Invalid file type. Only JPG, JPEG, and PNG images are allowed.",
          severity: "error",
        });
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      const validation = validateImageFile(selectedFile);
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          message: validation.error,
          severity: "error",
        });
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
        setCropDialogOpen(true);
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [validateImageFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  // Memoized image load handler
  const onImageLoad = useCallback((e) => {
    setCrop({
      unit: "%",
      width: 80,
      height: 80,
      x: 10,
      y: 10,
    });
  }, []);

  // Optimized crop function
  const getCroppedImg = useCallback((image, cropConfig, fileName) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = cropConfig.width;
    canvas.height = cropConfig.height;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          blob.name = fileName;
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
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
        "cropped.jpg"
      );
      
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setCroppedImage(croppedImageUrl);
      setCropDialogOpen(false);
      uploadFile(croppedImageBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
      setSnackbar({
        open: true,
        message: "Error cropping image",
        severity: "error",
      });
    }
  }, [completedCrop, getCroppedImg]);

  // Optimized file upload function
  const uploadFile = useCallback(async (fileToUpload) => {
    if (!fileToUpload) return;
    
    const validation = validateImageFile(fileToUpload);
    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: validation.error,
        severity: "error",
      });
      setFile(null);
      return;
    }
    
    setUploading(true);
    const data = new FormData();
    data.append("file", fileToUpload);
    
    try {
      const uploadResponse = await axios.post(
        "http://localhost:8080/file/upload",
        data
      );
      formik.setFieldValue("picture", uploadResponse.data.filename);
      formik.setFieldError("picture", "");
      setSnackbar({
        open: true,
        message: "Image uploaded successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setSnackbar({
        open: true,
        message: "Error uploading image",
        severity: "error",
      });
      formik.setFieldError("picture", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }, [validateImageFile, formik]);

  // Optimized update post function - UPDATED FOR JWT
  const updatePost = useCallback(async (values) => {
    // Check if user is authenticated using JWT token
    if (!authToken) {
      setSnackbar({
        open: true,
        message: "Please log in to update a post",
        severity: "error",
      });
      navigate("/login");
      return;
    }

    if (uploading) {
      setSnackbar({
        open: true,
        message: "Please wait for the image to finish uploading",
        severity: "warning",
      });
      return;
    }

    try {
      const postData = {
        title: values.title,
        description: values.description,
        picture: values.picture,
        downloadLinks: values.downloadLinks,
        genres: values.genres,
        category: values.category,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      };

      const response = await axios.put(
        `http://localhost:8080/posts/${id}`,
        postData,
        config
      );

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: "Post updated successfully!",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/my-animes");
        }, 1500);
      } else {
        throw new Error("Update failed - no success response");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      let errorMessage = "An error occurred while updating the post. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Please login to update a post.";
        navigate("/login");
      } else if (error.response?.status === 403) {
        errorMessage = "You are not authorized to update this post.";
      } else if (error.response?.status === 404) {
        errorMessage = "Post not found.";
      } else if (error.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  }, [authToken, uploading, navigate, id]);

  // Memoized event handlers
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleCloseCropDialog = useCallback(() => {
    setCropDialogOpen(false);
    setOriginalImage(null);
    setCrop({
      unit: "%",
      width: 80,
      height: 80,
      x: 10,
      y: 10,
    });
    setCompletedCrop(null);
    setZoom(1);
    setRotation(0);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => (prev - 90) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Back button handler
  const handleBack = useCallback(() => {
    navigate("/my-animes");
  }, [navigate]);

  // Optimized form handlers
  const handleGenreChange = useCallback((event) => {
    const { value } = event.target;
    formik.setFieldValue("genres", typeof value === "string" ? value.split(",") : value);
  }, [formik]);

  const handleCategoryChange = useCallback((event) => {
    const { value } = event.target;
    formik.setFieldValue("category", value);
  }, [formik]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
  }, [formik]);

  // Custom MenuProps for dropdown styling - OPTIMIZED FOR MOBILE
  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: 'rgba(40, 40, 60, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxHeight: isSmallMobile ? '150px' : '200px',
        '& .MuiMenuItem-root': {
          color: 'white',
          fontSize: isSmallMobile ? '0.7rem' : '0.8rem',
          minHeight: isSmallMobile ? '30px' : '35px',
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

  if (loading) {
    return (
      <Layout title="Update Anime Post">
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Update Anime Post">
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
        {/* Top Button Container with Back button on left */}
        <TopButtonContainer>
          <BackButton
            onClick={handleBack}
            startIcon={<ArrowBack />}
            size={isSmallMobile ? "small" : "medium"}
          >
            Back to My Animes
          </BackButton>
        </TopButtonContainer>

        <form onSubmit={formik.handleSubmit}>
          <GlassCard>
            <SectionTitle variant="h5">Cover Image</SectionTitle>
            <Typography variant="body2" sx={{ 
              mb: 2, 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: isSmallMobile ? '0.7rem' : '0.8rem' 
            }}>
              Maximum file size: 100KB. Supported formats: JPG, JPEG, PNG
            </Typography>
            
            {/* Display the cropped image or the uploaded image or default banner */}
            <Image src={displayImage} alt="banner" />
            
            <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
              <CloudUpload sx={{ 
                fontSize: isSmallMobile ? 24 : 32, 
                color: '#7873f5', 
                mb: 1 
              }} />
              {isDragActive ? (
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: isSmallMobile ? '0.8rem' : '0.9rem' 
                }}>
                  Drop the image here...
                </Typography>
              ) : (
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: isSmallMobile ? '0.8rem' : '0.9rem', 
                  textAlign: 'center' 
                }}>
                  Drag & drop an image here, or click to select
                </Typography>
              )}
              {file && (
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: isSmallMobile ? '0.7rem' : '0.8rem', 
                  mt: 1 
                }}>
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)}KB)
                </Typography>
              )}
              {uploading && (
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: isSmallMobile ? '0.7rem' : '0.8rem', 
                  mt: 1 
                }}>
                  Uploading... <CircularProgress size={isSmallMobile ? 10 : 12} />
                </Typography>
              )}
            </DropzoneContainer>
            
            {formik.errors.picture && formik.touched.picture && (
              <ErrorText>{formik.errors.picture}</ErrorText>
            )}

            {/* Crop Dialog */}
            <Dialog 
              open={cropDialogOpen} 
              onClose={handleCloseCropDialog} 
              maxWidth={isSmallMobile ? "xs" : "lg"} 
              fullWidth
              fullScreen={isSmallMobile}
              PaperProps={{
                sx: {
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  m: isSmallMobile ? 0 : 2,
                  ...(isSmallMobile && {
                    height: '100%',
                    borderRadius: 0,
                  }),
                }
              }}
            >
              <DialogTitle sx={{ 
                color: 'white', 
                background: 'rgba(255, 255, 255, 0.1)',
                fontSize: isSmallMobile ? '1rem' : '1.25rem',
                py: isSmallMobile ? 1.5 : 3
              }}>
                Crop Image
              </DialogTitle>
              <DialogContent sx={{ pt: isSmallMobile ? 1 : 3 }}>
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
                            maxHeight: isSmallMobile ? '250px' : '400px',
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            borderRadius: '6px'
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
                          sx={{ flex: 1, color: '#7873f5', minWidth: '100px' }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton onClick={handleZoomOut} size="small" sx={{ color: 'white' }}>
                            <ZoomOut fontSize={isSmallMobile ? "small" : "medium"} />
                          </IconButton>
                          <IconButton onClick={handleZoomIn} size="small" sx={{ color: 'white' }}>
                            <ZoomIn fontSize={isSmallMobile ? "small" : "medium"} />
                          </IconButton>
                        </Box>
                      </ControlRow>

                      <ControlRow>
                        <ControlLabel>Rotate:</ControlLabel>
                        <Slider
                          value={rotation}
                          onChange={(e, newValue) => setRotation(newValue)}
                          min={-180}
                          max={180}
                          step={90}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}°`}
                          sx={{ flex: 1, color: '#7873f5', minWidth: '100px' }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton onClick={handleRotateLeft} size="small" sx={{ color: 'white' }}>
                            <RotateLeft fontSize={isSmallMobile ? "small" : "medium"} />
                          </IconButton>
                          <IconButton onClick={handleRotateRight} size="small" sx={{ color: 'white' }}>
                            <RotateRight fontSize={isSmallMobile ? "small" : "medium"} />
                          </IconButton>
                        </Box>
                      </ControlRow>
                    </ControlsContainer>
                  </>
                )}
              </DialogContent>
              <DialogActions sx={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: isSmallMobile ? 1.5 : 3,
                flexDirection: isSmallMobile ? 'column' : 'row',
                gap: isSmallMobile ? 1 : 1
              }}>
                <Button 
                  onClick={handleCloseCropDialog}
                  sx={{ color: 'white', width: isSmallMobile ? '100%' : 'auto' }}
                  size={isSmallMobile ? 'small' : 'medium'}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCropComplete} 
                  variant="contained" 
                  disabled={!completedCrop}
                  startIcon={<Crop fontSize={isSmallMobile ? "small" : "medium"} />}
                  sx={{
                    background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
                    },
                    width: isSmallMobile ? '100%' : 'auto',
                    fontSize: isSmallMobile ? '0.8rem' : '0.9rem'
                  }}
                  size={isSmallMobile ? 'small' : 'medium'}
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
              '& .MuiAlert-icon': { color: '#7873f5' },
              fontSize: isSmallMobile ? '0.7rem' : '0.8rem'
            }}>
              Please provide download links for the anime content
            </Alert>

            <Grid container spacing={isSmallMobile ? 1 : 2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'white', 
                  fontSize: isSmallMobile ? '0.9rem' : '1rem' 
                }}>
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
                  rows={isSmallMobile ? 2 : 3}
                  error={formik.touched.downloadLinks && Boolean(formik.errors.downloadLinks)}
                  helperText={formik.touched.downloadLinks && formik.errors.downloadLinks 
                    ? formik.errors.downloadLinks 
                    : "Provide direct download links for the anime content"}
                  size={isSmallMobile ? "small" : "medium"}
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
                sx={{ textAlign: 'center' }}
              />
            </StyledFormControl>
            {formik.errors.title && formik.touched.title && (
              <ErrorText>{formik.errors.title}</ErrorText>
            )}

            <Grid container spacing={isSmallMobile ? 1 : 2} sx={{ mt: 1 }}>
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
                  size={isSmallMobile ? "small" : "medium"}
                >
                  <MenuItem value="">
                    <em style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: isSmallMobile ? '0.7rem' : '0.8rem' }}>
                      Select Category
                    </em>
                  </MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category} sx={{ fontSize: isSmallMobile ? '0.7rem' : '0.8rem' }}>
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
                        return <span style={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: isSmallMobile ? '0.7rem' : '0.8rem' 
                        }}>Select Genres</span>;
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={value} 
                              size="small" 
                              sx={{ 
                                background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                                color: 'white',
                                fontSize: isSmallMobile ? '0.6rem' : '0.7rem',
                                height: isSmallMobile ? 20 : 24,
                                '& .MuiChip-label': {
                                  padding: isSmallMobile ? '4px 8px' : '6px 10px'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      );
                    },
                  }}
                  name="genres"
                  MenuProps={menuProps}
                  size={isSmallMobile ? "small" : "medium"}
                >
                  {GENRES.map((genre) => (
                    <MenuItem key={genre} value={genre} sx={{ fontSize: isSmallMobile ? '0.7rem' : '0.8rem' }}>
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
              minRows={isSmallMobile ? 3 : 4}
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

          {/* Button Container with only Update button at bottom */}
          <ButtonContainer>
            <Button 
              type="submit"
              variant="contained" 
              disabled={uploading || formik.isSubmitting}
              size={isSmallMobile ? "small" : "large"}
              sx={{ 
                minWidth: isSmallMobile ? '100%' : '120px',
                background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(120, 115, 245, 0.6)',
                },
                fontSize: isSmallMobile ? '0.8rem' : '1rem',
                padding: isSmallMobile ? '10px 16px' : '12px 30px',
                borderRadius: isSmallMobile ? '6px' : '12px',
                width: isSmallMobile ? '100%' : 'auto'
              }}
            >
              {uploading || formik.isSubmitting ? (
                <>
                  <CircularProgress size={isSmallMobile ? 16 : 20} sx={{ mr: 1, color: 'white' }} />
                  {isSmallMobile ? 'Updating...' : 'Updating Post...'}
                </>
              ) : (
                'Update Post'
              )}
            </Button>
          </ButtonContainer>
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

export default Update;