import { useState } from "react";
import { Typography, Box, styled, IconButton, TextField, Button, useMediaQuery, useTheme } from "@mui/material";
import { Delete, Edit, Check, Close } from '@mui/icons-material';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';

// API calls for comments
const API = {
  deleteComment: async (commentId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/comments/${commentId}`, {
        withCredentials: true
      });
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { isSuccess: false, error: error.message };
    }
  },
  updateComment: async (commentId, updatedComment) => {
    try {
      const response = await axios.put(`http://localhost:8080/comments/${commentId}`, {
        updatedComment: updatedComment
      }, {
        withCredentials: true
      });
      return { isSuccess: true, data: response.data };
    } catch (error) {
      console.error("Error updating comment:", error);
      return { isSuccess: false, error: error.message };
    }
  }
};

// Styled Components with responsive design
const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
  marginBottom: theme.spacing(1.5),
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    borderRadius: '16px',
    padding: theme.spacing(2.5),
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
    marginBottom: theme.spacing(2),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #ff6ec4, #7873f5, #4a90e2)',
    borderRadius: '12px 12px 0 0',
    [theme.breakpoints.up('sm')]: {
      height: '3px',
      borderRadius: '16px 16px 0 0',
    },
  },
}));

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  gap: theme.spacing(1),
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
}));

const Name = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '14px',
  background: 'linear-gradient(45deg, #ffffff, #e0e0ff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  lineHeight: 1.2,
  [theme.breakpoints.up('sm')]: {
    fontSize: '16px',
  },
}));

const StyledDate = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.2,
  [theme.breakpoints.up('sm')]: {
    fontSize: '14px',
    marginLeft: theme.spacing(2),
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  alignSelf: 'flex-end',
  marginTop: theme.spacing(-0.5),
  [theme.breakpoints.up('sm')]: {
    alignSelf: 'flex-start',
    marginTop: 0,
    marginLeft: 'auto',
    gap: theme.spacing(0.75),
  },
}));

const EditContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(1),
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    borderRadius: '12px',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  justifyContent: 'flex-end',
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    marginTop: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
}));

const CommentText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  lineHeight: 1.5,
  wordBreak: 'break-word',
  padding: theme.spacing(0.5, 0),
  fontSize: '14px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '16px',
    lineHeight: 1.6,
    padding: theme.spacing(1, 0),
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

const UserInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(1.5),
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(1),
  },
}));

// Helper function to get display name from comment
const getDisplayName = (comment) => {
  if (comment.name) return comment.name;
  if (comment.username) return comment.username;
  if (comment.email) return comment.email;
  return 'Unknown User';
};

const Comment = ({ comment, setToggle }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(comment.comments || '');
    const [isLoading, setIsLoading] = useState(false);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Updated authorization check - now based on userId comparison
    const isCommentAuthor = user && (
      (user.userId && comment.userId && user.userId === comment.userId) ||
      (user._id && comment.userId && user._id.toString() === comment.userId.toString()) ||
      (user.email && comment.email && user.email === comment.email) ||
      (user.username && comment.username && user.username === comment.username) ||
      (user.user_name && comment.username && user.user_name === comment.username)
    );

    const removeComment = async () => {
       try {
           const result = await API.deleteComment(comment._id || comment.commentId);
           if (result.isSuccess) {
               setToggle(prev => !prev);
           } else {
               alert('Failed to delete comment: ' + result.error);
           }
       } catch (error) {
           console.error("Failed to delete comment:", error);
           alert('Failed to delete comment. Please try again.');
       }
    }

    const updateComment = async () => {
        if (!editedComment.trim()) {
            alert('Comment cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            const result = await API.updateComment(comment._id || comment.commentId, editedComment);
            
            if (result.isSuccess) {
                setIsEditing(false);
                setToggle(prev => !prev);
                alert('Comment updated successfully!');
            } else {
                alert('Failed to update comment: ' + result.error);
            }
        } catch (error) {
            console.error("Failed to update comment:", error);
            alert('Failed to update comment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedComment(comment.comments || '');
    }

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedComment(comment.comments || '');
    }

    // Get the display name for the comment author
    const displayName = getDisplayName(comment);

    return (
        <GlassCard>
            <Container>
                <ContentContainer>
                    <HeaderContainer>
                        <UserInfoContainer>
                            <Name variant="body1">{displayName}</Name>
                            <StyledDate variant="body2">
                                {new Date(comment.date || comment.createdAt).toLocaleDateString()} at {' '}
                                {new Date(comment.date || comment.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}
                            </StyledDate>
                        </UserInfoContainer>
                        
                        {/* Show action buttons only if user is the comment author */}
                        {isCommentAuthor && !isEditing && (
                            <ActionButtons>
                                <IconButton 
                                    onClick={handleEditClick} 
                                    size={isMobile ? "small" : "medium"}
                                    sx={{ 
                                        color: 'rgba(120, 115, 245, 0.8)',
                                        background: 'rgba(120, 115, 245, 0.1)',
                                        padding: isMobile ? '4px' : '8px',
                                        '&:hover': {
                                            color: '#7873f5',
                                            background: 'rgba(120, 115, 245, 0.2)',
                                            transform: 'scale(1.1)',
                                        }
                                    }}
                                    title="Edit comment"
                                >
                                    <Edit fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                                <IconButton 
                                    onClick={removeComment} 
                                    size={isMobile ? "small" : "medium"}
                                    sx={{ 
                                        color: 'rgba(255, 107, 107, 0.8)',
                                        background: 'rgba(255, 107, 107, 0.1)',
                                        padding: isMobile ? '4px' : '8px',
                                        '&:hover': {
                                            color: '#ff6b6b',
                                            background: 'rgba(255, 107, 107, 0.2)',
                                            transform: 'scale(1.1)',
                                        }
                                    }}
                                    title="Delete comment"
                                >
                                    <Delete fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                            </ActionButtons>
                        )}
                    </HeaderContainer>
                    
                    {!isEditing ? (
                        <CommentText variant="body1">
                            {comment.comments}
                        </CommentText>
                    ) : (
                        <EditContainer>
                            <TextField
                                fullWidth
                                multiline
                                rows={isMobile ? 2 : 3}
                                variant="outlined"
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                disabled={isLoading}
                                placeholder="Edit your comment..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        fontSize: isMobile ? '14px' : '16px',
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
                                        fontSize: isMobile ? '14px' : '16px',
                                    },
                                }}
                            />
                            <ButtonContainer>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancelEdit}
                                    disabled={isLoading}
                                    startIcon={<Close />}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        fontSize: isMobile ? '12px' : '14px',
                                        padding: isMobile ? '4px 8px' : '6px 12px',
                                        minWidth: 'auto',
                                        '&:hover': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={updateComment}
                                    disabled={isLoading || !editedComment.trim()}
                                    startIcon={<Check />}
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
                                        fontSize: isMobile ? '12px' : '14px',
                                        padding: isMobile ? '4px 8px' : '6px 12px',
                                        minWidth: 'auto',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #ff7ece 0%, #8a85ff 100%)',
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    {isLoading ? 'Updating...' : 'Update'}
                                </Button>
                            </ButtonContainer>
                        </EditContainer>
                    )}
                </ContentContainer>
            </Container>
        </GlassCard>
    )
}

export default Comment;