let tokenClient;
let accessToken;

// Step 1: Handle Google Sign-In and request access token
function handleSignIn() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '806605122824-u4ga126redvoaa8n22cam0vcn1d16f5r.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/earthengine.readonly',
        callback: (tokenResponse) => {
            console.log('Token response:', tokenResponse);
            accessToken = tokenResponse.access_token;
            document.getElementById('init-earth-engine').style.display = 'inline';
            console.log('Signed in successfully. Click to initialize Earth Engine.');
        }
    });
    tokenClient.requestAccessToken();
}

// Step 2: Initialize Earth Engine and fetch a map layer
function initializeEarthEngine() {
    if (!accessToken) {
        console.error('Access token not available. Please sign in first.');
        return;
    }

    console.log('Initializing Earth Engine with access token...');

    const imageId = 'projects/ee-theboygit/assets/Zambezi_RGB_1990';
    fetch(`https://earthengine.googleapis.com/v1alpha/${imageId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.text().then(text => {
                console.error('Error response from Earth Engine:', text);
                throw new Error('Failed to fetch Earth Engine map layer');
            });
        }
    })
    .then(data => {
        console.log('Earth Engine image data:', data);
        setupMap(data);  // Use the response data to display the image on the map
    })
    .catch(error => {
        console.error('Error fetching Earth Engine data:', error);
    });
}

// Step 3: Set up the map and display the layer
function setupMap(imageData) {
    console.log('Setting up map...');
    const map = L.map('map').setView([-17.5, 24.3], 10);

    // Try adding a CORS proxy temporarily for local testing, uncomment the line below if needed
    // const proxy = 'https://cors-anywhere.herokuapp.com/';
    const tileUrl = `https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/${imageData.name}/tiles/{z}/{x}/{y}?token=${accessToken}`;

    // Add the tile layer to the map
    const tileLayer = L.tileLayer(/* proxy + */ tileUrl, {
        attribution: '&copy; Google Earth Engine'
    });
    tileLayer.addTo(map);
}

// Attach the click events to buttons after page load
window.onload = () => {
    const signInButton = document.getElementById('sign-in');
    signInButton.onclick = handleSignIn;
    
    const initButton = document.getElementById('init-earth-engine');
    initButton.style.display = 'none'; // Hide init button by default
    initButton.onclick = initializeEarthEngine;
};
