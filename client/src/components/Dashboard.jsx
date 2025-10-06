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

// Styled Components for Posts with glass morphism - UPDATED FOR MOBILE
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  position: 'relative',
  marginBottom: '15px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2)',
    borderRadius: '12px 12px 0 0',
  },
  [theme.breakpoints.up('sm')]: {
    borderRadius: '16px',
    padding: theme.spacing(2),
    marginBottom: '20px',
    '&::before': {
      height: '3px',
    },
  },
}));

const PostContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  height: '220px', // Smaller height for mobile
  width: '100%',
  maxWidth: '85px', // Smaller width for 4 columns
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  margin: '0 auto',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(120, 115, 245, 0.3)',
    borderColor: 'rgba(120, 115, 245, 0.5)',
    background: 'rgba(255, 255, 255, 0.15)',
  },
  [theme.breakpoints.up('sm')]: {
    height: '280px',
    maxWidth: '140px',
    borderRadius: '10px',
  },
  [theme.breakpoints.up('md')]: {
    height: '320px',
    maxWidth: '180px',
    borderRadius: '12px',
  },
  [theme.breakpoints.up('lg')]: {
    height: '360px',
    maxWidth: '220px',
  },
}));

const PostImage = styled('img')(({ theme }) => ({
  width: '100%',
  objectFit: 'cover',
  height: '80px', // Smaller image for mobile
  minHeight: '80px',
  flexShrink: 0,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  [theme.breakpoints.up('sm')]: {
    height: '100px',
    minHeight: '100px',
  },
  [theme.breakpoints.up('md')]: {
    height: '120px',
    minHeight: '120px',
  },
  [theme.breakpoints.up('lg')]: {
    height: '140px',
    minHeight: '140px',
  },
}));

const PostContent = styled(Box)(({ theme }) => ({
  padding: '6px',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  width: '100%',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: '8px',
  },
  [theme.breakpoints.up('md')]: {
    padding: '12px',
  },
}));

const PostText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '8px', // Smaller font for mobile
  marginBottom: '3px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  lineHeight: '1.1',
  [theme.breakpoints.up('sm')]: {
    fontSize: '9px',
    marginBottom: '4px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '10px',
    marginBottom: '5px',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '11px',
  },
}));

const PostHeading = styled(Typography)(({ theme }) => ({
  fontSize: '10px', // Smaller font for mobile
  fontWeight: '700',
  marginBottom: '4px',
  lineHeight: '1.1',
  color: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.up('sm')]: {
    fontSize: '12px',
    marginBottom: '5px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '14px',
    marginBottom: '6px',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '16px',
  },
}));

const PostDetails = styled(Typography)(({ theme }) => ({
  fontSize: '8px', // Smaller font for mobile
  lineHeight: '1.2',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: '6px',
  flexGrow: 1,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2, // Less lines on mobile
  WebkitBoxOrient: 'vertical',
  [theme.breakpoints.up('sm')]: {
    fontSize: '9px',
    marginBottom: '8px',
    WebkitLineClamp: 2,
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '11px',
    marginBottom: '10px',
    WebkitLineClamp: 3,
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '13px',
  },
}));

const GenreChip = styled(Chip)(({ theme }) => ({
  margin: '1px',
  fontSize: '7px', // Smaller chips for mobile
  height: '16px',
  backgroundColor: 'rgba(120, 115, 245, 0.2)',
  color: 'white',
  border: '1px solid rgba(120, 115, 245, 0.5)',
  '& .MuiChip-label': {
    padding: '0 4px',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '8px',
    height: '18px',
    margin: '2px',
    '& .MuiChip-label': {
      padding: '0 5px',
    },
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '9px',
    height: '20px',
  },
}));

// Search Bar Styled Component
const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto 20px auto',
  padding: '0 10px',
  [theme.breakpoints.up('sm')]: {
    margin: '0 auto 30px auto',
    padding: '0 15px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    fontSize: '14px',
    height: '44px',
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
    [theme.breakpoints.up('sm')]: {
      fontSize: '16px',
      height: '52px',
      borderRadius: '25px',
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

// Section Title Styled Component
const SectionTitle = styled(Typography)(({ theme }) => ({
  margin: '15px 0 10px 0',
  fontWeight: 600,
  color: 'white',
  borderBottom: '1px solid rgba(120, 115, 245, 0.5)',
  paddingBottom: '6px',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  fontSize: '1.2rem',
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
    margin: '20px 0 15px 0',
    paddingBottom: '8px',
    borderBottomWidth: '2px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.8rem',
    margin: '25px 0 18px 0',
  },
}));

// Loading and No Results Components
const LoadingText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
  padding: '20px',
  fontSize: '12px',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    fontSize: '14px',
    padding: '30px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '16px',
    padding: '40px',
  },
}));

const NoResultsText = styled(Box)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  textAlign: 'center',
  margin: '20px auto',
  fontSize: '12px',
  width: '100%',
  padding: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.up('sm')]: {
    fontSize: '14px',
    margin: '30px auto',
    padding: '15px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '16px',
    margin: '40px auto',
    padding: '20px',
  },
}));

// Individual Post Component
const Post = ({ post }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const url = post.picture ? `http://192.168.1.7:8080/file/${post.picture}` : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=752&q=80';
  
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
          {/* Category and Genres in one line */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 0.5,
            gap: 0.5
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
            {addEllipsis(post.title, isMobile ? 12 : 20)}
          </PostHeading>
          
          {/* Description */}
          <PostDetails>
            {addEllipsis(post.description, isMobile ? 30 : 70)}
          </PostDetails>
        </Box>
      </PostContent>
    </PostContainer>
  );
};

// Posts Component (integrated into Dashboard)
const Posts = ({ category, searchQuery, isMobile, isTablet }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => { 
      try {
        const response = await axios.get('http://192.168.1.7:8080/posts', {
          params: { category: category || '' }
        });
        
        if (response.data) {
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
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
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
            xs={3}        // ✅ 4 columns on mobile (12/3 = 4)
            sm={4}        // 3 columns on small tablets
            md={3}        // 4 columns on medium screens
            lg={2.4}      // 5 columns on large screens
            xl={2}        // 6 columns on extra large screens
            key={post.postId || post._id}
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              padding: isMobile ? '4px' : '8px' // Smaller padding for mobile
            }}
          >
            <Link 
              style={{
                textDecoration: 'none', 
                color: 'inherit', 
                width: '100%', 
                maxWidth: isMobile ? '85px' : '280px', // Smaller max width for mobile
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

// Main Dashboard Component - FIXED FOR 4 CARDS PER ROW ON MOBILE
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
      
      {/* Content with proper responsive padding */}
      <Box sx={{ 
        width: '100%', 
        padding: { xs: '8px', sm: '12px', md: '16px' }, // Smaller padding for mobile
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
                    fontSize: { xs: '18px', sm: '22px', md: '24px' }
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

        {/* Grid container with proper responsive spacing */}
        <Box sx={{ 
          width: '100%',
          padding: { xs: '0 2px', sm: '0 8px', md: '0 12px' } // Minimal padding for mobile
        }}>
          <Grid 
            container 
            spacing={{ xs: 0.5, sm: 1, md: 2 }} // Minimal spacing for mobile
            sx={{
              justifyContent: { xs: 'center', sm: 'flex-start' },
              margin: '0 auto',
              width: '100%'
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


