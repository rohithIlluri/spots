import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Place as PlaceIcon,
  DateRange as DateIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { getDirectionsUrl } from '../services/location';
import { getSpotById, addComment, visitSpot } from '../services/spots';
import { auth } from '../services/firebase';
import 'leaflet/dist/leaflet.css';

const SpotDetailPage = () => {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchSpot = async () => {
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Loading took too long. Please try again.');
      }
    }, 15000);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching spot details for ID: ${spotId}`);
      const spotData = await getSpotById(spotId);
      setSpot(spotData);
      
      // Record visit if user is logged in
      if (auth.currentUser) {
        visitSpot(spotId, auth.currentUser.uid).catch(err => {
          console.error('Failed to record visit:', err);
          // Non-critical error, don't show to user
        });
      }
      
      console.log('Spot details loaded successfully');
    } catch (err) {
      console.error('Error fetching spot:', err);
      setError(err.message || 'Could not load spot details. Please try again later.');
      setSpot(null);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSpot();
  }, [spotId]);

  const handleBackClick = () => {
    navigate(-1);
  };
  
  const handleShowOnMap = () => {
    navigate(`/map?spotId=${spotId}`);
  };
  
  const handleGetDirections = () => {
    if (spot) {
      const url = getDirectionsUrl(spot.location.lat, spot.location.lng);
      window.open(url, '_blank');
    }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    if (!auth.currentUser) {
      alert('Please sign in to comment');
      return;
    }
    
    try {
      setSubmitting(true);
      const newComment = await addComment(spotId, comment);
      
      // Update the local state to show the new comment immediately
      setSpot(prev => {
        if (!prev) return prev;
        
        const updatedComments = [...(prev.interactions.comments || []), newComment];
        return {
          ...prev,
          interactions: {
            ...prev.interactions,
            comments: updatedComments
          }
        };
      });
      
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading spot details...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert 
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchSpot}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (!spot) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" color="error">
            Spot not found
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton edge="start" onClick={handleBackClick} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Spot Details
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          {/* Main spot image */}
          <Box sx={{ mb: 3 }}>
            <img 
              src={spot.content.media[0]} 
              alt={spot.content.description}
              style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 8 }}
            />
          </Box>
          
          {/* Thumbnail images if there are more */}
          {spot.content.media.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 3, overflow: 'auto' }}>
              {spot.content.media.slice(1).map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Additional view ${index + 1}`}
                  style={{ height: 80, width: 120, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}
          
          <Typography variant="h5" gutterBottom>
            {spot.content.description}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
            <Chip 
              icon={<CategoryIcon />} 
              label={`Category: ${spot.metadata.category}`} 
              variant="outlined" 
            />
            <Chip 
              icon={<DateIcon />} 
              label={`Created: ${spot.metadata.createdAt.toLocaleDateString()}`} 
              variant="outlined" 
            />
            <Chip 
              icon={<VisibilityIcon />} 
              label={`Visits: ${spot.interactions.visitors.length}`} 
              variant="outlined" 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Created by: {spot.creatorName || 'Anonymous'}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Location
          </Typography>
          
          <Box sx={{ height: 250, mb: 2 }}>
            <MapContainer 
              center={[spot.location.lat, spot.location.lng]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[spot.location.lat, spot.location.lng]} />
            </MapContainer>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained"
              startIcon={<PlaceIcon />}
              onClick={handleGetDirections}
            >
              Get Directions
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleShowOnMap}
            >
              View on Map
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          
          {spot.interactions.comments && spot.interactions.comments.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              {spot.interactions.comments.map((comment, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2">
                    {comment.userName || 'Anonymous'}
                  </Typography>
                  <Typography variant="body1">
                    {comment.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.timestamp instanceof Date 
                      ? comment.timestamp.toLocaleString() 
                      : 'Just now'}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
          
          <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add a comment..."
              variant="outlined"
              size="small"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting || !auth.currentUser}
            />
            <IconButton 
              color="primary" 
              type="submit" 
              sx={{ ml: 1 }}
              disabled={!comment.trim() || submitting || !auth.currentUser}
            >
              <SendIcon />
            </IconButton>
          </Box>
          
          {!auth.currentUser && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Please sign in to leave a comment
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SpotDetailPage;