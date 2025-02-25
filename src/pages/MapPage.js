import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Paper, Typography, CircularProgress, Fab, Chip, Alert, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getCurrentLocation } from '../services/location';
import { getAllSpots, getSpotById, getSpotsByCategory } from '../services/spots';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import redIcon from 'leaflet/dist/images/marker-icon.png'; // We'd use a real red icon in production

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Create a custom red icon for spots
let SpotIcon = L.icon({
  iconUrl: redIcon, // In a real app, use a different colored icon
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Default center
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

// Component to recenter map when user location changes
function SetViewOnLocation({ coords, spotToShow }) {
  const map = useMap();
  
  useEffect(() => {
    if (spotToShow) {
      map.setView([spotToShow.location.lat, spotToShow.location.lng], 16);
    } else if (coords) {
      map.setView([coords.lat, coords.lng], 14);
    }
  }, [coords, spotToShow, map]);
  
  return null;
}

const MapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [spots, setSpots] = useState([]);
  const [spotToShow, setSpotToShow] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [error, setError] = useState(null);

  // Parse spotId from URL query params
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const spotId = params.get('spotId');
        
        // Get user location
        const userLoc = await getCurrentLocation().catch(() => {
          setLocationError('Could not access your location. Using default location.');
          return defaultCenter;
        });
        
        setUserLocation(userLoc);
        
        // Fetch spots based on filter
        let spotsList = [];
        if (filter === 'all') {
          spotsList = await getAllSpots();
        } else {
          spotsList = await getSpotsByCategory(filter);
        }
        
        setSpots(spotsList);
        
        // If spotId is provided, fetch that specific spot
        if (spotId) {
          try {
            const spot = await getSpotById(spotId);
            setSpotToShow(spot);
            setSelectedSpot(spot);
          } catch (err) {
            console.error('Error fetching specific spot:', err);
          }
        }
      } catch (err) {
        console.error('Error in map data fetching:', err);
        setError('Failed to load map data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [location.search, filter]);

  const handleCreateSpot = () => {
    navigate('/create');
  };

  const filterSpots = async (category) => {
    setLoading(true);
    setFilter(category);
    try {
      let spotsList = [];
      if (category === 'all') {
        spotsList = await getAllSpots();
      } else {
        spotsList = await getSpotsByCategory(category);
      }
      setSpots(spotsList);
    } catch (err) {
      console.error('Error filtering spots:', err);
      setError('Failed to filter spots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: 'calc(100vh - 64px)' }}>
      {locationError && (
        <Box sx={{ position: 'absolute', top: 16, left: 0, right: 0, zIndex: 999, mx: 2 }}>
          <Alert severity="warning" onClose={() => setLocationError(null)}>
            {locationError}
          </Alert>
        </Box>
      )}

      <Box sx={{ position: 'absolute', top: locationError ? 70 : 16, left: 16, zIndex: 999 }}>
        <Paper sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="All" 
            onClick={() => filterSpots('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            icon={<FilterListIcon />}
          />
          <Chip 
            label="Food" 
            onClick={() => filterSpots('food')}
            color={filter === 'food' ? 'primary' : 'default'}
          />
          <Chip 
            label="Nature" 
            onClick={() => filterSpots('nature')}
            color={filter === 'nature' ? 'primary' : 'default'}
          />
          <Chip 
            label="Art" 
            onClick={() => filterSpots('art')}
            color={filter === 'art' ? 'primary' : 'default'}
          />
        </Paper>
      </Box>
      
      <MapContainer 
        center={userLocation || defaultCenter} 
        zoom={userLocation ? 14 : 12} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* This component will update the map view when user location changes */}
        <SetViewOnLocation coords={userLocation} spotToShow={spotToShow} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              You are here
            </Popup>
          </Marker>
        )}
        
        {/* Spot markers */}
        {spots.map(spot => (
          <Marker 
            key={spot.id}
            position={[spot.location.lat, spot.location.lng]}
            icon={SpotIcon}
            eventHandlers={{
              click: () => {
                setSelectedSpot(spot);
              },
            }}
          >
            <Popup>
              <Box sx={{ maxWidth: 200 }}>
                <img 
                  src={spot.content.media[0]} 
                  alt={spot.content.description}
                  style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                />
                <Typography variant="subtitle2">
                  {spot.content.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {spot.metadata.category}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate(`/spots/${spot.id}`)}
                >
                  View Details
                </Button>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 999 }}
        onClick={handleCreateSpot}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default MapPage;