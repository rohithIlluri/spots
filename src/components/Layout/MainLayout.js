import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';

const MainLayout = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Spots
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <IconButton color="inherit" component={Link} to="/">
              <HomeIcon />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/map">
              <MapIcon />
            </IconButton>
            <IconButton color="inherit" component={Link} to="/profile">
              <PersonIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main">
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;