let map;
let currentLayer;
let accessToken;

// Initialize the Google API client and load Earth Engine
function loadClient() {
    gapi.load('client:auth2', initClient);
}

// Initialize the Google client
function initClient() {
    gapi.client.init({
        clientId: 'YOUR_CLIENT_ID_HERE',
        scope: 'https://www.googleapis.com/auth/earthengine.readonly',
    }).then(() => {
        console.log("Google API client initialized");
    }).catch(error => {
        console.error("Error initializing Google API client:", error);
    });
}

// Event listener for sign-in button
document.getElementById('signInButton').addEventListener('click', () => {
    gapi.auth2.getAuthInstance().signIn().then(user => {
        console.log("Signed in successfully");
        accessToken = user.getAuthResponse().access_token;
        initializeEarthEngine();
    }).catch(error => {
        console.error("Error during sign-in", error);
    });
});

// Initialize Earth Engine with access token
function initializeEarthEngine() {
    console.log("Initializing Earth Engine with access token...");
    fetchEarthEngineData();
}

// Fetch Earth Engine data based on the selected year
function fetchEarthEngineData(year = 1990) {
    const assetId = `projects/ee-theboygit/assets/Zambezi_RGB_${year}`;
    console.log(`Loading image: ${assetId}`);
    
    fetch(`https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/assets/${assetId}?access_token=${accessToken}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Earth Engine image data:", data);
            displayMap(data, year);
        })
        .catch(error => {
            console.error("Error fetching Earth Engine data:", error);
        });
}

// Display map and update layer
function displayMap(data, year) {
    if (!map) {
        map = L.map('map').setView([-17.5, 24.3], 12); // Coordinates of Katima Mulilo
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
        }).addTo(map);
    }

    if (currentLayer) {
        map.removeLayer(currentLayer);
    }

    const imageUrl = `https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/${data.name}/tiles/{z}/{x}/{y}?access_token=${accessToken}`;
    currentLayer = L.tileLayer(imageUrl, {
        attribution: '&copy; Google Earth Engine'
    }).addTo(map);

    document.getElementById('yearLabel').textContent = year;
}

// Event listener for slider to change the year
document.getElementById('yearSlider').addEventListener('input', (event) => {
    const year = event.target.value;
    fetchEarthEngineData(year);
});

// Load the Google API client
loadClient();
