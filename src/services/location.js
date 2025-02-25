// Function to get the user's current location
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };
  
  // Get directions to a spot
  export const getDirectionsUrl = (destLat, destLng) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  };