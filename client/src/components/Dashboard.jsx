// components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  styled,
  useTheme,
  useMediaQuery,
  Chip,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Search } from '@mui/icons-material';
import axios from 'axios';
import DashboardCarousel from './DashboardCarousel.jsx';
import Layout from './Layout.jsx';

// Styled Components for Posts with glass morphism - UPDATED TO MATCH MYANIMES
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  marginBottom: '20px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2)',
    borderRadius: '16px 16px 0 0',
  },
  [theme.breakpoints.up('md')]: {
    borderRadius: '20px',
    padding: theme.spacing(3),
    marginBottom: '30px',
    '&::before': {
      height: '4px',
      borderRadius: '20px 20px 0 0',
    },
  },
}));

const PostContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  height: '340px',
  width: '100%',
  maxWidth: '280px',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  margin: '0 auto',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 35px rgba(120, 115, 245, 0.3)',
    borderColor: 'rgba(120, 115, 245, 0.5)',
    background: 'rgba(255, 255, 255, 0.15)',
  },
  [theme.breakpoints.down('sm')]: {
    height: '320px',
    maxWidth: '160px',
  },
  [theme.breakpoints.up('md')]: {
    height: '360px',
    maxWidth: '240px',
  },
  [theme.breakpoints.up('lg')]: {
    height: '380px',
    maxWidth: '280px',
  },
}));

const PostImage = styled('img')(({ theme }) => ({
  width: '100%',
  objectFit: 'cover',
  height: '140px',
  minHeight: '140px',
  flexShrink: 0,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  [theme.breakpoints.down('sm')]: {
    height: '100px',
  },
}));

const PostContent = styled(Box)(({ theme }) => ({
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  width: '100%',
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    padding: '16px',
  },
}));

const PostText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '11px',
  marginBottom: '6px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  lineHeight: '1.2',
  [theme.breakpoints.down('sm')]: {
    fontSize: '10px',
    marginBottom: '4px',
  },
}));

const PostHeading = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: '700',
  marginBottom: '8px',
  lineHeight: '1.2',
  color: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
    marginBottom: '6px',
  },
}));

const PostDetails = styled(Typography)(({ theme }) => ({
  fontSize: '13px',
  lineHeight: '1.4',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '12px',
  flexGrow: 1,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  [theme.breakpoints.down('sm')]: {
    fontSize: '11px',
    marginBottom: '8px',
    WebkitLineClamp: 2,
  },
}));

const GenreChip = styled(Chip)(({ theme }) => ({
  margin: '2px',
  fontSize: '10px',
  height: '20px',
  backgroundColor: 'rgba(120, 115, 245, 0.2)',
  color: 'white',
  border: '1px solid rgba(120, 115, 245, 0.5)',
  '& .MuiChip-label': {
    padding: '0 6px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '9px',
    height: '18px',
    margin: '1px',
    '& .MuiChip-label': {
      padding: '0 4px',
    },
  },
}));

// Search Bar Styled Component - UPDATED TO MATCH MYANIMES
const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto 30px auto',
  padding: '0 15px',
  [theme.breakpoints.down('sm')]: {
    margin: '0 auto 20px auto',
    padding: '0 10px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '25px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '16px',
    height: '52px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(120, 115, 245, 0.8)',
      borderWidth: '2px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      height: '48px',
      borderRadius: '20px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)',
      opacity: 1,
    },
  },
}));

// Section Title Styled Component - UPDATED
const SectionTitle = styled(Typography)(({ theme }) => ({
  margin: { xs: '20px 0 15px 0', sm: '25px 0 18px 0', md: '30px 0 20px 0' },
  fontWeight: 600,
  color: 'white',
  borderBottom: '2px solid rgba(120, 115, 245, 0.5)',
  paddingBottom: { xs: '8px', sm: '9px', md: '10px' },
  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
  textAlign: 'center',
  width: '100%',
}));

// Loading and No Results Components - UPDATED
const LoadingText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
  padding: { xs: '30px 20px', sm: '40px' },
  fontSize: { xs: '14px', sm: '16px' },
  width: '100%',
}));

const NoResultsText = styled(Box)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
  margin: { xs: '30px auto', sm: '40px auto' },
  fontSize: { xs: '14px', sm: '16px' },
  width: '100%',
  padding: { xs: '15px', sm: '20px' },
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '10px',
  backdropFilter: 'blur(10px)',
}));

// Individual Post Component - UPDATED TO MATCH MYANIMES STYLING
const Post = ({ post }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const url = post.picture ? `http://localhost:8080/file/${post.picture}` : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80';
  
  const addEllipsis = (str, limit) => {
    return str && str.length > limit ? str.substring(0, limit) + '...' : str;
  };

  return (
    <PostContainer>
      <PostImage 
        src={url} 
        alt="post" 
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80';
        }}
      />
      
      <PostContent>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          {/* Category and Genres in one line - MATCHING MYANIMES LAYOUT */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1,
            gap: 1
          }}>
            <PostText>{post.category || 'Anime'}</PostText>
            {post.genres && post.genres.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'flex-end',
                flex: 1,
                minWidth: 0
              }}>
                <GenreChip 
                  label={post.genres[0]} 
                  size="small"
                  variant="outlined"
                />
                {post.genres.length > 1 && (
                  <GenreChip 
                    label={`+${post.genres.length - 1}`} 
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Box>
          
          {/* Title */}
          <PostHeading title={post.title}>
            {addEllipsis(post.title, isMobile ? 20 : 25)}
          </PostHeading>
          
          {/* Description */}
          <PostDetails>
            {addEllipsis(post.description, isMobile ? 70 : 90)}
          </PostDetails>
        </Box>
      </PostContent>
    </PostContainer>
  );
};

// Posts Component (integrated into Dashboard) - UPDATED
const Posts = ({ category, searchQuery, isMobile, isTablet }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => { 
      try {
        const response = await axios.get('http://localhost:8080/posts', {
          params: { category: category || '' }
        });
        
        if (response.data) {
          // Ensure posts have the proper structure
          const formattedPosts = response.data.map(post => ({
            ...post,
            category: post.category || 'Anime',
            genres: post.genres || []
          }));
          setPosts(formattedPosts);
          setFilteredPosts(formattedPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [category]);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  if (loading) {
    return (
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Grid>
    );
  }

  return (
    <>
      {filteredPosts && filteredPosts.length ? (
        filteredPosts.map(post => (
          <Grid 
            item 
            xs={6} // 2 columns on mobile
            sm={4} // 3 columns on tablet
            md={3} // 4 columns on desktop
            lg={2.4} // 5 columns on large screens
            key={post.postId || post._id}
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              padding: isMobile ? '8px' : '12px'
            }}
          >
            <Link 
              style={{
                textDecoration: 'none', 
                color: 'inherit', 
                width: '100%', 
                maxWidth: isMobile ? '160px' : '280px',
                display: 'flex',
                justifyContent: 'center'
              }} 
              to={`/details/${post.postId || post._id}`}
            >
              <Post post={post} />
            </Link>
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <NoResultsText>
            {searchQuery ? `No anime found for "${searchQuery}"` : 'No anime posts available'}
          </NoResultsText>
        </Grid>
      )}
    </>
  );
};

// Main Dashboard Component - UPDATED FOR MOBILE RESPONSIVENESS
const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const category = '';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Layout title="Dashboard">
      {/* Carousel outside the Container to span full width */}
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <DashboardCarousel />
      </Box>
      
      {/* Content with full width - UPDATED PADDING */}
      <Box sx={{ 
        width: '100%', 
        padding: isMobile ? '10px' : '20px',
        maxWidth: '1800px',
        margin: '0 auto',
        boxSizing: 'border-box',
        minHeight: '100vh'
      }}>
        {/* Search Bar */}
        <SearchContainer>
          <StyledTextField
            fullWidth
            variant="outlined"
            placeholder="Search anime by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: isMobile ? '20px' : '24px'
                  }} />
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>

        {/* Section Title */}
        <SectionTitle variant="h4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Anime'}
        </SectionTitle>

        {/* Full width grid container - UPDATED SPACING */}
        <Box sx={{ 
          width: '100%',
          padding: isMobile ? '0 5px' : '0 10px'
        }}>
          <Grid 
            container 
            spacing={isMobile ? 1 : 2}
            sx={{
              justifyContent: { xs: 'center', sm: 'flex-start' },
              margin: '0 auto'
            }}
          >
            <Posts 
              category={category} 
              searchQuery={searchQuery} 
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
};

export default Dashboard;