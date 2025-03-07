document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    const map = L.map('map').setView([0, 0], 2);
    
    // Add tile layer - this gives us the actual map images
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // We'll use this to store our marker
    let marker;
    
    // Grab all the DOM elements we need
    const ipInput = document.getElementById('ip-input');
    const searchBtn = document.getElementById('search-btn');
    const myIpBtn = document.getElementById('my-ip-btn');
    const basicInfo = document.getElementById('basic-info');
    const locationInfo = document.getElementById('location-info');
    const connectionInfo = document.getElementById('connection-info');
    const additionalInfo = document.getElementById('additional-info');
    
    // Function to get geolocation data
    async function getGeolocation(ip) {
      try {
        const response = await fetch(`/api/geolocation/${ip}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch geolocation data');
        }
        return await response.json();
      } catch (error) {
        console.error('Error:', error);
        basicInfo.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        return null;
      }
    }
    
    // Function to update the UI with geolocation data
    function updateUI(data) {
      if (!data) return;
      
      // Update basic info
      basicInfo.innerHTML = `
        <p><strong>IP:</strong> ${data.ip}</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Continent:</strong> ${data.continent_name}</p>
        <p><strong>Country:</strong> ${data.country_name} ${data.location?.country_flag_emoji || ''}</p>
      `;
      
      // Update location info
      locationInfo.innerHTML = `
        <p><strong>Region:</strong> ${data.region_name || 'N/A'}</p>
        <p><strong>City:</strong> ${data.city || 'N/A'}</p>
        <p><strong>Zip Code:</strong> ${data.zip || 'N/A'}</p>
        <p><strong>Coordinates:</strong> ${data.latitude}, ${data.longitude}</p>
      `;
      
      // Update connection info
      connectionInfo.innerHTML = `
        <p><strong>ASN:</strong> ${data.connection?.asn || 'N/A'}</p>
        <p><strong>ISP:</strong> ${data.connection?.isp || 'N/A'}</p>
      `;
      
      // Update additional info
      additionalInfo.innerHTML = `
        <p><strong>Time Zone:</strong> ${data.time_zone?.id || 'N/A'}</p>
        <p><strong>Current Time:</strong> ${data.time_zone?.current_time || 'N/A'}</p>
        <p><strong>Currency:</strong> ${data.currency?.name || 'N/A'} (${data.currency?.symbol || 'N/A'})</p>
        <p><strong>Languages:</strong> ${data.location?.languages?.map(l => l.name).join(', ') || 'N/A'}</p>
      `;
      
      // Update map if coordinates are available
      if (data.latitude && data.longitude) {
        const latLng = [data.latitude, data.longitude];
        
        // Center the map on the coordinates
        map.setView(latLng, 10);
        
        // Add or update marker
        if (marker) {
          marker.setLatLng(latLng);
        } else {
          marker = L.marker(latLng).addTo(map);
        }
        
        // Add a popup with some location info
        marker.bindPopup(`
          <strong>${data.city || 'Unknown'}, ${data.region_name || ''}, ${data.country_name}</strong><br>
          IP: ${data.ip}<br>
          Coordinates: ${data.latitude}, ${data.longitude}
        `).openPopup();
      }
    }
    
    // Handle search button click
    searchBtn.addEventListener('click', async () => {
      const ip = ipInput.value.trim();
      if (!ip) {
        basicInfo.innerHTML = `<p class="error">Please enter an IP address</p>`;
        return;
      }
      
      const data = await getGeolocation(ip);
      updateUI(data);
    });
    
    // Handle "Use My IP" button click
    myIpBtn.addEventListener('click', async () => {
      try {
        // First get the client's IP
        const response = await fetch('/api/myip');
        const data = await response.json();
        
        // Then get geolocation data for that IP
        const geoData = await getGeolocation('myip'); // Using our special 'myip' endpoint
        updateUI(geoData);
        
        // Update the input field with the IP
        ipInput.value = data.ip;
      } catch (error) {
        console.error('Error getting client IP:', error);
        basicInfo.innerHTML = `<p class="error">Error getting your IP: ${error.message}</p>`;
      }
    });
    
    // Handle Enter key press in the input field
    ipInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  });
