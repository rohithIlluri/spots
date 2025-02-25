import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import CreateSpotPage from './pages/CreateSpotPage';
import SpotDetailPage from './pages/SpotDetailPage';
import MainLayout from './components/Layout/MainLayout';
import './App.css';
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="create" element={<CreateSpotPage />} />
            <Route path="spots/:spotId" element={<SpotDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;