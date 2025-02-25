import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActions, 
  Button, 
  Box, 
  Chip
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SpotCard = ({ spot, showOnMap }) => {
  const navigate = useNavigate();
  
  // Get the first image if available
  const coverImage = spot.content?.media && spot.content.media.length > 0 
    ? spot.content.media[0] 
    : 'https://via.placeholder.com/400x200?text=No+Image';

  const handleViewDetails = () => {
    navigate(`/spots/${spot.id}`);
  };
  
  const handleShowOnMap = () => {
    if (showOnMap) {
      showOnMap(spot);
    } else {
      navigate(`/map?spotId=${spot.id}`);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="160"
        image={coverImage}
        alt={spot.content?.description || 'Spot image'}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {spot.content?.description || 'Untitled Spot'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {spot.metadata?.category || 'General'}
          </Typography>
        </Box>
        
        {spot.metadata?.createdAt && (
          <Typography variant="caption" color="text.secondary" display="block">
            Created {spot.metadata.createdAt.toDate 
              ? spot.metadata.createdAt.toDate().toLocaleDateString() 
              : new Date(spot.metadata.createdAt).toLocaleDateString()}
          </Typography>
        )}
        
        <Box sx={{ mt: 1 }}>
          <Chip 
            size="small"
            icon={<VisibilityIcon fontSize="small" />}
            label={spot.interactions?.visitors?.length || 0} 
            variant="outlined"
          />
        </Box>
      </CardContent>
      
      <CardActions>
        <Button size="small" onClick={handleViewDetails}>View Details</Button>
        <Button size="small" onClick={handleShowOnMap}>Show on Map</Button>
      </CardActions>
    </Card>
  );
};

export default SpotCard;