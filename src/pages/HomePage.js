import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, CircularProgress, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MapIcon from '@mui/icons-material/Map';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import SpotCard from '../components/Spots/SpotCard';
import { getAllSpots, getFeaturedSpot } from '../services/spots';

const HomePage = () => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredSpot, setFeaturedSpot] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all spots from Firebase
        const allSpots = await getAllSpots();
        setSpots(allSpots);
        
        // Get featured spot (most visited)
        const featured = await getFeaturedSpot();
        setFeaturedSpot(featured);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load spots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleShowOnMap = (spot) => {
    navigate(`/map?spotId=${spot.id}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Spots
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Discover and share amazing locations near you
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<MapIcon />}
            onClick={() => navigate('/map')}
          >
            Explore Map
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            startIcon={<AddLocationIcon />}
            onClick={() => navigate('/create')}
          >
            Create Spot
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ my: 4 }}>
            <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="h6">{error}</Typography>
            </Paper>
          </Box>
        ) : (
          <>
            {featuredSpot && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Featured Spot
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <img 
                        src={featuredSpot.content.media[0]} 
                        alt={featuredSpot.content.description}
                        style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h5" gutterBottom>
                        {featuredSpot.content.description}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Category: {featuredSpot.metadata.category}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        This popular spot has been visited {featuredSpot.interactions.visitors.length} times!
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="contained" 
                          color="secondary"
                          onClick={() => handleShowOnMap(featuredSpot)}
                        >
                          View on Map
                        </Button>
                        <Button 
                          variant="outlined" 
                          sx={{ ml: 2, color: 'white', borderColor: 'white' }}
                          onClick={() => navigate(`/spots/${featuredSpot.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}
          
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h4" gutterBottom>
              Recent Spots
            </Typography>
            
            {spots.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No spots found
                </Typography>
                <Typography variant="body1" paragraph>
                  Be the first to create a spot in your area!
                </Typography>
                <Button 
                  variant="contained"
                  onClick={() => navigate('/create')}
                >
                  Create Spot
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {spots.map(spot => (
                  <Grid item xs={12} sm={6} md={4} key={spot.id}>
                    <SpotCard spot={spot} showOnMap={handleShowOnMap} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;