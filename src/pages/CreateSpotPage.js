import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { getCurrentLocation } from '../services/location';
import { createSpot } from '../services/spots';
import { auth } from '../services/firebase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Location Picker Component
function LocationPicker({ position, setPosition }) {
  const map = useMapEvents({
    click: (e) => {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });

  return position ? 
    <Marker position={[position.lat, position.lng]} /> : null;
}

const CreateSpotPage = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [spotLocation, setSpotLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationFetching, setLocationFetching] = useState(true);
  const navigate = useNavigate();

  // Get user's location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        // Initially set spot location to user location
        setSpotLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
        setError('Could not access your location. Please manually select a location on the map.');
      } finally {
        setLocationFetching(false);
      }
    };

    fetchLocation();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...filesArray].slice(0, 4)); // Limit to 4 images
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!description.trim()) {
      setError('Please add a description');
      return;
    }

    if (!spotLocation) {
      setError('Please select a location for your spot');
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one image');
      return;
    }

    try {
      setLoading(true);
      
      // Format spot data for Firebase
      const spotData = {
        description,
        category,
        location: spotLocation,
        userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        visibility: 'public'
      };
      
      // Extract image files from the images array
      const imageFiles = images.map(img => img.file);
      
      // Create spot in Firebase
      const createdSpot = await createSpot(spotData, imageFiles);
      
      // Navigate to the new spot's detail page
      navigate(`/spots/${createdSpot.id}`);
    } catch (err) {
      console.error('Error creating spot:', err);
      setError('Failed to create spot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create a New Spot
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spot Details
            </Typography>
            
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's special about this spot?"
              required
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="nature">Nature</MenuItem>
                <MenuItem value="art">Art</MenuItem>
              </Select>
            </FormControl>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Click on the map to set the spot location
            </Typography>
            
            <Box sx={{ height: 300, width: '100%', mb: 2 }}>
              {locationFetching ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : userLocation && (
                <MapContainer 
                  center={[userLocation.lat, userLocation.lng]} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={spotLocation} setPosition={setSpotLocation} />
                </MapContainer>
              )}
            </Box>
            
            {spotLocation && (
              <Typography variant="body2" color="text.secondary">
                Selected location: {spotLocation.lat.toFixed(6)}, {spotLocation.lng.toFixed(6)}
              </Typography>
            )}
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photos
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                id="upload-spot-image"
                type="file"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="upload-spot-image">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoIcon />}
                  disabled={images.length >= 4}
                >
                  Add Photos
                </Button>
              </label>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {images.length}/4 photos (tap to add, limit 4)
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {images.map((image, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={image.preview} 
                      alt={`Preview ${index}`} 
                      style={{ 
                        width: '100%', 
                        height: 120, 
                        objectFit: 'cover', 
                        borderRadius: 1 
                      }} 
                    />
                    <IconButton 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)',
                        }
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/map')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Creating...' : 'Create Spot'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default CreateSpotPage;