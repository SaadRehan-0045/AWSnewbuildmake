import { useState, useEffect } from 'react';
import { Box, TextField, Button, styled, Typography, Avatar, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

//components
import Comment from './Comment';

// API calls for comments
const API = {
  getAllComments: async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8080/comments/${postId}`);
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  newComment: async (commentData) => {
    try {
      const response = await axios.post('http://localhost:8080/comments', commentData, {
        withCredentials: true
      });
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error creating comment:", error);
      return { isSuccess: false, error: error.message };
    }
  }
};

// Styled Components with responsive design
const CommentsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(5),
  },
}));

const CommentInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    borderRadius: '16px',
    padding: theme.spacing(2),
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: '40px',
  height: '40px',
  border: '2px solid rgba(120, 115, 245, 0.5)',
  background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
  fontSize: '16px',
  fontWeight: 600,
  [theme.breakpoints.up('sm')]: {
    width: '50px',
    height: '50px',
    fontSize: '18px',
  },
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing(2),
  },
}));

const CommentInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  
  '& .MuiOutlinedInput-root': {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    fontSize: '14px',
    
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(120, 115, 245, 0.8)',
    },
  },
  
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
  },
  
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '14px',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '14px',
    },
  },
  
  [theme.breakpoints.up('sm')]: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      fontSize: '16px',
    },
    
    '& .MuiInputLabel-root': {
      fontSize: '16px',
    },
    
    '& .MuiInputBase-input': {
      fontSize: '16px',
      '&::placeholder': {
        fontSize: '16px',
      },
    },
  },
}));

const PostButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
  color: 'white',
  padding: theme.spacing(1, 2),
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  height: '40px',
  fontSize: '14px',
  minWidth: '80px',
  transition: 'all 0.3s ease',
  alignSelf: 'flex-end',
  
  '&:hover': {
    background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(120, 115, 245, 0.4)',
  },
  
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    transform: 'none',
    boxShadow: 'none',
  },
  
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.25, 3),
    borderRadius: '25px',
    fontSize: '16px',
    minWidth: '100px',
    height: '48px',
    alignSelf: 'auto',
  },
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center',
  padding: theme.spacing(2),
  fontSize: '14px',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    fontSize: '16px',
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.6)',
  padding: theme.spacing(3, 2),
  fontStyle: 'italic',
  fontSize: '14px',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5, 3),
    fontSize: '16px',
  },
}));

const CommentsTitle = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(45deg, #ffffff, #e0e0ff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontSize: '1.25rem',
  textAlign: 'center',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(3),
    textAlign: 'left',
  },
}));

const AvatarInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(2),
  },
}));

const initialValue = {
    postId: '',
    comments: '',
    userId: ''
}

const Comments = ({ post }) => {
    const [comment, setComment] = useState(initialValue);
    const [comments, setComments] = useState([]);
    const [toggle, setToggle] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            const response = await API.getAllComments(post.postId || post._id);
            if (response.isSuccess) {
                setComments(response.data);
            }
            setLoading(false);
        }
        getData();
    }, [toggle, post]);

    const handleChange = (e) => {
        setComment({
            ...comment,
            userId: user?.userId || user?._id || '',
            postId: post.postId || post._id,
            comments: e.target.value
        });
    }

    const addComment = async() => {
        if (!comment.comments.trim()) return;
        
        try {
            await API.newComment(comment);
            setComment(initialValue);
            setToggle(prev => !prev);
        } catch (error) {
            console.error("Failed to add comment:", error);
            alert('Failed to add comment. Please try again.');
        }
    }

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Handle Enter key press for comment submission
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addComment();
        }
    }
    
    return (
        <CommentsContainer>
            <CommentsTitle variant="h5">
                Comments ({comments.length})
            </CommentsTitle>
            
            {/* Comment Input Section */}
            <CommentInputContainer>
                <AvatarInputWrapper>
                    <UserAvatar>
                        {getInitials(user?.username || user?.name || user?.email)}
                    </UserAvatar>
                    <InputWrapper>
                        <CommentInput
                            multiline
                            rows={isMobile ? 2 : 3}
                            placeholder="Share your thoughts about this anime..."
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            value={comment.comments}
                            variant="outlined"
                            fullWidth
                        />
                        <PostButton 
                            onClick={addComment}
                            disabled={!comment.comments.trim()}
                            size={isMobile ? "small" : "medium"}
                        >
                            {isMobile ? 'Post' : 'Post Comment'}
                        </PostButton>
                    </InputWrapper>
                </AvatarInputWrapper>
            </CommentInputContainer>
            
            {/* Comments List */}
            {loading && (
                <LoadingText variant="body1">
                    Loading comments...
                </LoadingText>
            )}
            
            <Box>
                {comments && comments.length > 0 ? (
                    comments.map(comment => (
                        <Comment key={comment._id || comment.commentId} comment={comment} setToggle={setToggle} />
                    ))
                ) : (
                    !loading && (
                        <EmptyState>
                            <Typography variant="body1" sx={{ fontSize: 'inherit' }}>
                                No comments yet. Be the first to share your thoughts!
                            </Typography>
                        </EmptyState>
                    )
                )}
            </Box>
        </CommentsContainer>
    )
}

export default Comments;