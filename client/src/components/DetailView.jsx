import React, { useState, useEffect } from 'react';
import { 
  Box, styled, Typography, Chip, Divider, Alert, Link as MuiLink,
  Button, IconButton, useMediaQuery, useTheme, Container
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Category, Theaters, ArrowBack, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Comments from './comments/Comments.jsx';
import Layout from './Layout.jsx';

// API calls
const API = {
  getPostById: async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/posts/${id}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error fetching post:", error);
      return { isSuccess: false, error: error.message };
    }
  }
};

// Styled Components matching Layout's glass morphism design
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    borderRadius: '20px',
    padding: theme.spacing(3),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2)',
    borderRadius: '16px 16px 0 0',
    [theme.breakpoints.up('sm')]: {
      height: '4px',
      borderRadius: '20px 20px 0 0',
    },
  },
}));

const DetailContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Header Container with Back Button and Centered Title
const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  position: 'relative',
  minHeight: '60px',
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(4),
    minHeight: '70px',
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  fontSize: '0.875rem',
  fontWeight: 600,
  zIndex: 1,
  minWidth: 'auto',
  flexShrink: 0,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5, 3),
    borderRadius: '25px',
    fontSize: '1rem',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(120, 115, 245, 0.3)',
  },
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 200px)',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% - 140px)',
  },
}));

const DetailHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #ffffff, #e0e0ff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  lineHeight: 1.3,
  wordBreak: 'break-word',
  margin: 0,
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up('sm')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2.5rem',
  },
}));

const Author = styled(Box)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  margin: theme.spacing(2, 0),
  alignItems: 'flex-start',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    margin: theme.spacing(3, 0),
  },
}));

const PostMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  margin: theme.spacing(3, 0),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(3),
    alignItems: 'center',
  },
}));

const MetaItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  color: 'white',
  transition: 'all 0.3s ease',
  flexWrap: 'wrap',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2, 2.5),
    borderRadius: '25px',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
  },
}));

const GenreChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
  color: 'white',
  fontWeight: 600,
  border: 'none',
  fontSize: '0.75rem',
  height: '28px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.875rem',
    height: '32px',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
    transform: 'translateY(-1px)',
  },
}));

const DownloadSection = styled(GlassCard)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  borderLeft: '4px solid #7873f5',
}));

// Description component with ellipsis functionality
const DescriptionContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(3, 0),
}));

const DescriptionText = styled(Typography)(({ theme, expanded }) => ({
  fontSize: '1rem',
  lineHeight: 1.6,
  color: 'rgba(255, 255, 255, 0.9)',
  wordBreak: 'break-word',
  whiteSpace: 'pre-line',
  display: '-webkit-box',
  WebkitLineClamp: expanded ? 'unset' : '4',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  maxHeight: expanded ? 'none' : '6.4em',
  transition: 'max-height 0.3s ease',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.1rem',
    lineHeight: 1.7,
  },
}));

const SeeMoreButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  background: 'rgba(120, 115, 245, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(120, 115, 245, 0.4)',
  color: '#b8b5ff',
  padding: theme.spacing(1, 2),
  borderRadius: '16px',
  fontSize: '0.875rem',
  marginTop: theme.spacing(1),
  minWidth: 'auto',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(120, 115, 245, 0.3)',
    borderColor: 'rgba(120, 115, 245, 0.6)',
    color: '#d0ceff',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.up('sm')]: {
    borderRadius: '20px',
    fontSize: '1rem',
  },
}));

const CustomAlert = styled(Alert)(({ theme }) => ({
  background: 'rgba(2, 136, 209, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(2, 136, 209, 0.3)',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '0.875rem',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  '& .MuiAlert-icon': {
    color: '#4fc3f7',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '1rem',
    padding: theme.spacing(2),
  },
}));

const DownloadLink = styled(MuiLink)(({ theme }) => ({
  textDecoration: 'none',
  color: '#8a85ff',
  padding: theme.spacing(1.5, 2),
  background: 'rgba(138, 133, 255, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(138, 133, 255, 0.3)',
  transition: 'all 0.3s ease',
  fontSize: '0.875rem',
  textAlign: 'center',
  display: 'block',
  fontWeight: 500,
  '&:hover': { 
    background: 'rgba(138, 133, 255, 0.2)',
    color: '#a8a4ff',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(138, 133, 255, 0.2)'
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '1rem',
    padding: theme.spacing(2, 2.5),
  },
}));

// Helper functions
const getDisplayName = (post) => {
  if (post.userName) return post.userName;
  if (post.userUserName) return post.userUserName;
  if (post.username) return post.username;
  if (post.name) return post.name;
  if (post.email) return post.email;
  return 'Unknown User';
};

const needsTruncation = (text) => {
  if (!text) return false;
  const hasMultipleParagraphs = text.split('\n').length > 2;
  const isLongText = text.length > 200;
  return hasMultipleParagraphs || isLongText;
};

const formatDownloadLinks = (links) => {
  if (!links) return [];
  return links.split(',').map(link => link.trim()).filter(link => link);
};

// DetailView Component
const DetailView = () => {
  const [post, setPost] = useState({});
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      let response = await API.getPostById(id);
      if (response.isSuccess) {
        setPost(response.data);
      }
    }
    fetchData();
  }, [id, user]);

  const downloadLinks = formatDownloadLinks(post.downloadLinks);
  const shouldTruncate = needsTruncation(post.description);
  const displayName = getDisplayName(post);

  const handleBack = () => navigate(-1);
  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <Layout title={post.title || "Post Details"}>
      <DetailContainer maxWidth="lg">
        {/* Header with Back Button and Centered Title */}
        <HeaderContainer>
          <BackButton onClick={handleBack} startIcon={<ArrowBack />}>
            {isMobile ? 'Back' : 'Back to Previous'}
          </BackButton>
          
          <TitleContainer>
            <DetailHeading variant="h1">
              {post.title}
            </DetailHeading>
          </TitleContainer>
          
          {/* Spacer to balance the layout */}
          <Box sx={{ width: '80px', flexShrink: 0 }} />
        </HeaderContainer>

        <GlassCard>
          {/* Author and Date Information */}
          <Author>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: isMobile ? '0.875rem' : '1rem' 
            }}>
              Posted by: <span style={{fontWeight: 600, color: 'white'}}>
                {displayName}
              </span>
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: isMobile ? '0.875rem' : '1rem',
              marginLeft: isMobile ? '0' : 'auto'
            }}>
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
            </Typography>
          </Author>

          <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Post Metadata */}
          <PostMeta>
            {post.category && (
              <MetaItem>
                <Category fontSize={isMobile ? "small" : "medium"} />
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  Category: {post.category}
                </Typography>
              </MetaItem>
            )}
            
            {post.genres && post.genres.length > 0 && (
              <MetaItem sx={{ 
                flexDirection: isMobile ? 'column' : 'row', 
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Theaters fontSize={isMobile ? "small" : "medium"} />
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    Genres:
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.genres.map((genre, index) => (
                    <GenreChip key={index} label={genre} size="small" />
                  ))}
                </Box>
              </MetaItem>
            )}
          </PostMeta>

          {/* Description with See More functionality */}
          {post.description && (
            <DescriptionContainer>
              <DescriptionText expanded={expanded || !shouldTruncate}>
                {post.description}
              </DescriptionText>
              
              {shouldTruncate && (
                <SeeMoreButton 
                  onClick={toggleExpanded}
                  endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                >
                  {expanded ? 'See Less' : 'See More'}
                </SeeMoreButton>
              )}
            </DescriptionContainer>
          )}
        </GlassCard>

        {/* Download Links Section */}
        {downloadLinks.length > 0 && (
          <DownloadSection>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'white',
              fontWeight: 600,
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              mb: 2
            }}>
              <Download fontSize={isMobile ? "small" : "medium"} /> 
              {isMobile ? 'Downloads' : 'Download Links'}
            </Typography>
            
            <CustomAlert severity="info">
              {isMobile 
                ? 'Click links to download. Use antivirus protection.'
                : 'Click on the links below to download the anime content. Make sure to use proper antivirus protection.'
              }
            </CustomAlert>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {downloadLinks.map((link, index) => (
                <DownloadLink 
                  key={index}
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  📥 {isMobile ? `Link ${index + 1}` : `Download Link ${index + 1}`}
                </DownloadLink>
              ))}
            </Box>
          </DownloadSection>
        )}

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        {/* Comments Component */}
        <GlassCard>
          <Comments post={post} />
        </GlassCard>
      </DetailContainer>
    </Layout>
  );
};

export default DetailView;