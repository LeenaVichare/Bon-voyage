// Tourist Safety System JavaScript
// Simulates AI monitoring, geo-fencing, panic button, and real-time features

let currentScreen = 'dashboard';
let safetyScore = 82;
let alerts = [];
let tracking = true;
let panicMode = false;

// Map variables
let map = null;
let mapLayers = {
  tourist: null,
  police: null,
  geofence: null,
  incidents: null
};
let mapMarkers = {
  tourists: [],
  police: [],
  incidents: [],
  user: null
};
let geoFences = [];
let userLocation = [25.5788, 91.8933]; // Shillong, Meghalaya coordinates
let currentMapView = 'local';
let worldTourists = [];
let locationSearchTimeout = null;

// Sample tourist data and locations
const touristData = {
  name: 'Sandra Glam',
  location: 'Shillong, Meghalaya',
  digitalId: 'TD-2024-11-001',
  safetyScore: 82,
  emergencyContacts: ['+91-98765-43210', '+91-87654-32109', 'police@meghalaya.gov.in']
};

// Sample itinerary/trip plan for today
const todayItinerary = [
  { time: '08:00', place: 'Ward\'s Lake', status: 'current' },
  { time: '12:00', place: 'Elephant Falls', status: 'next' },
  { time: '15:30', place: 'Don Bosco Museum', status: 'planned' },
  { time: '18:00', place: 'Police Bazaar', status: 'planned' },
  { time: '20:30', place: 'Hotel Return', status: 'planned' }
];

// Geo-fence zones with risk levels
const geoFenceZones = [
  { name: 'Ward\'s Lake Area', risk: 'low', message: 'Safe tourist zone' },
  { name: 'Elephant Falls Trail', risk: 'medium', message: 'Caution: Slippery paths' },
  { name: 'Restricted Military Area', risk: 'high', message: 'Entry prohibited' },
  { name: 'Late Night Commercial Areas', risk: 'medium', message: 'Enhanced patrol recommended' }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  startAIMonitoring();
  updateUI();
  
  // Initialize map when on map screen
  setTimeout(() => {
    if (currentScreen === 'map') {
      initializeMap();
    }
  }, 1000);
});

function initializeApp() {
  populateItinerary();
  updateTime();
  setInterval(updateTime, 30000); // Update time every 30 seconds
  setInterval(aiHealthCheck, 45000); // AI monitoring every 45 seconds
  
  // Initialize location inputs
  initializeLocationInputs();
}

function setupEventListeners() {
  // Panic button
  document.getElementById('panicBtn').addEventListener('click', triggerPanic);
  
  // Share live location
  document.getElementById('shareLiveBtn').addEventListener('click', shareLiveLocation);
  
  // Call police
  document.getElementById('callPoliceBtn').addEventListener('click', callPolice);
  
  // Add swipe/touch gestures for mobile (simplified)
  let startX = 0;
  document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  });
  
  document.addEventListener('touchend', function(e) {
    let endX = e.changedTouches[0].clientX;
    let diff = startX - endX;
    
    if (Math.abs(diff) > 100) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next screen
        navigateScreens('next');
      } else {
        // Swipe right - previous screen
        navigateScreens('prev');
      }
    }
  });
}

function switchScreen(screenName) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(screenName + 'Screen');
  if (targetScreen) {
    targetScreen.classList.add('active');
    currentScreen = screenName;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[data-target="${screenName}"]`);
    if (activeNav) {
      activeNav.classList.add('active');
    }
    
    // Screen-specific actions
    if (screenName === 'alerts') {
      populateAlerts();
    } else if (screenName === 'profile') {
      updateProfileData();
    } else if (screenName === 'map') {
      // Initialize map if not already done
      if (!map) {
        setTimeout(() => initializeMap(), 100);
      } else {
        // Refresh map data
        setTimeout(() => {
          map.invalidateSize();
          updateMapData();
        }, 100);
      }
    }
  }
}

function navigateScreens(direction) {
  const screens = ['dashboard', 'map', 'alerts', 'profile'];
  const currentIndex = screens.indexOf(currentScreen);
  
  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % screens.length;
  } else {
    nextIndex = (currentIndex - 1 + screens.length) % screens.length;
  }
  
  switchScreen(screens[nextIndex]);
}

function populateItinerary() {
  const itineraryBar = document.getElementById('itineraryBar');
  itineraryBar.innerHTML = '';
  
  todayItinerary.forEach(item => {
    const itineraryItem = document.createElement('div');
    itineraryItem.className = `calendar-day ${item.status === 'current' ? 'active' : ''}`;
    itineraryItem.innerHTML = `
      <span class="day-name">${item.time}</span>
      <span class="day-number" style="font-size:10px">${item.place.split(' ')[0]}</span>
    `;
    itineraryBar.appendChild(itineraryItem);
  });
}

function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  document.querySelector('.time').textContent = timeStr.slice(0, 5); // Remove seconds
}

// AI Monitoring System
function startAIMonitoring() {
  console.log('🤖 AI Tourist Safety Monitoring started');
  addAlert('system', 'AI Monitoring activated for your safety', 'info');
  
  // Simulate AI behavior patterns detection
  setTimeout(() => {
    const scenarios = [
      { type: 'geofence', message: 'Entering medium-risk zone: Elephant Falls area' },
      { type: 'weather', message: 'Weather alert: Light rain expected at 14:00' },
      { type: 'crowd', message: 'High tourist density detected at Ward\'s Lake' },
      { type: 'safety', message: 'Police patrol unit nearby - enhanced safety' }
    ];
    
    // Pick random scenario every few minutes for demo
    setInterval(() => {
      if (!panicMode && Math.random() > 0.7) { // 30% chance every cycle
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        addAlert(scenario.type, scenario.message, 'warning');
        updateSafetyScore();
      }
    }, 60000); // Every minute for demo
  }, 10000); // Start scenarios after 10 seconds
}

function aiHealthCheck() {
  // Simulate AI health monitoring
  const riskFactors = Math.floor(Math.random() * 4);
  let newScore = safetyScore + (Math.random() > 0.5 ? 1 : -1) * riskFactors;
  newScore = Math.max(20, Math.min(100, newScore)); // Keep between 20-100
  
  if (Math.abs(newScore - safetyScore) >= 5) {
    safetyScore = newScore;
    updateSafetyScore();
    
    if (newScore < 60) {
      addAlert('ai', `Safety score dropped to ${newScore}. Enhanced monitoring activated.`, 'danger');
    } else if (newScore > 85) {
      updateSafetySummary('AI monitoring active • Very safe environment');
    }
  }
}

function updateSafetyScore() {
  document.getElementById('safetyScore').textContent = safetyScore;
  
  let summary = '';
  let cardStyle = '';
  
  if (safetyScore >= 80) {
    summary = 'AI monitoring active • Low risk';
    cardStyle = 'background: linear-gradient(135deg,#0ea5e9 0%,#60a5fa 100%);';
  } else if (safetyScore >= 60) {
    summary = 'AI monitoring active • Medium risk';
    cardStyle = 'background: linear-gradient(135deg,#f59e0b 0%,#f97316 100%);';
  } else {
    summary = 'AI monitoring active • High risk detected';
    cardStyle = 'background: linear-gradient(135deg,#ef4444 0%,#dc2626 100%);';
  }
  
  updateSafetySummary(summary);
  // Update challenge card style
  const challengeCard = document.querySelector('.challenge-card');
  challengeCard.setAttribute('style', cardStyle);
}

function updateSafetySummary(text) {
  document.getElementById('safetySummary').textContent = text;
}

// Panic and Emergency Functions
function triggerPanic() {
  panicMode = !panicMode;
  const panicBtn = document.getElementById('panicBtn');
  
  if (panicMode) {
    panicBtn.innerHTML = '<i class="fas fa-times"></i>';
    panicBtn.style.backgroundColor = '#dc2626';
    panicBtn.style.animation = 'pulse 1s infinite';
    
    // Trigger emergency protocol
    addAlert('emergency', '🚨 PANIC BUTTON ACTIVATED - Emergency services notified', 'danger');
    addAlert('emergency', '📍 Live location shared with authorities and emergency contacts', 'danger');
    addAlert('emergency', '📞 Auto-calling nearest police station...', 'danger');
    
    // Simulate emergency response
    setTimeout(() => {
      addAlert('response', '🚔 Police unit dispatched to your location (ETA: 8 minutes)', 'info');
    }, 3000);
    
    setTimeout(() => {
      addAlert('response', '📱 Emergency contact John notified via SMS', 'info');
    }, 5000);
    
    // Auto-update E-FIR
    setTimeout(() => {
      document.getElementById('efirStatus').textContent = 'Filed';
      addAlert('system', '📋 E-FIR automatically generated (Reference: FIR2024001123)', 'info');
    }, 8000);
    
    console.log('🚨 EMERGENCY: Panic button activated');
    
  } else {
    panicBtn.innerHTML = '<i class="fas fa-siren-on"></i>';
    panicBtn.style.backgroundColor = '';
    panicBtn.style.animation = '';
    
    addAlert('system', 'Panic mode deactivated', 'info');
    console.log('✅ Panic mode deactivated');
  }
}

function shareLiveLocation() {
  addAlert('location', '📍 Live location shared with family and authorities', 'info');
  updateLastLocation();
  
  // Simulate location sharing
  const locations = ['Ward\'s Lake', 'Elephant Falls', 'Police Bazaar', 'Don Bosco Museum'];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  setTimeout(() => {
    addAlert('location', `📍 Current location: ${randomLocation} (Lat: 25.5788, Long: 91.8933)`, 'info');
  }, 2000);
}

function callPolice() {
  addAlert('emergency', '📞 Calling Meghalaya Police Emergency: 100', 'info');
  
  // Simulate call connection
  setTimeout(() => {
    addAlert('emergency', '✅ Connected to Police Control Room', 'info');
    addAlert('emergency', '🗣️ "Tourist Sandra at Ward\'s Lake requires assistance"', 'info');
  }, 3000);
}

// Alert System
function addAlert(type, message, severity = 'info') {
  const alert = {
    id: Date.now() + Math.random(),
    type: type,
    message: message,
    severity: severity,
    timestamp: new Date().toLocaleTimeString(),
    read: false
  };
  
  alerts.unshift(alert); // Add to beginning
  
  // Limit to 20 alerts
  if (alerts.length > 20) {
    alerts = alerts.slice(0, 20);
  }
  
  updateActiveAlertsCount();
  
  // Show notification if not on alerts screen
  if (currentScreen !== 'alerts') {
    showNotificationBadge();
  }
}

function populateAlerts() {
  const alertsList = document.getElementById('alertsList');
  alertsList.innerHTML = '';
  
  if (alerts.length === 0) {
    alertsList.innerHTML = `
      <div class="menu-item">
        <div class="menu-icon"><i class="fas fa-check-circle" style="color: #10b981;"></i></div>
        <div class="menu-content">
          <div class="menu-title">No alerts</div>
          <div class="menu-subtitle">All systems normal</div>
        </div>
      </div>
    `;
    return;
  }
  
  alerts.forEach(alert => {
    const alertElement = document.createElement('div');
    alertElement.className = `menu-item ${alert.read ? '' : 'unread-alert'}`;
    
    let iconClass = 'fas fa-info-circle';
    let iconColor = '#6b7280';
    
    switch (alert.severity) {
      case 'danger':
        iconClass = 'fas fa-exclamation-triangle';
        iconColor = '#ef4444';
        break;
      case 'warning':
        iconClass = 'fas fa-exclamation-circle';
        iconColor = '#f59e0b';
        break;
      case 'info':
        iconClass = 'fas fa-info-circle';
        iconColor = '#3b82f6';
        break;
    }
    
    alertElement.innerHTML = `
      <div class="menu-icon">
        <i class="${iconClass}" style="color: ${iconColor};"></i>
      </div>
      <div class="menu-content">
        <div class="menu-title">${alert.message}</div>
        <div class="menu-subtitle">${alert.timestamp} • ${alert.type}</div>
      </div>
    `;
    
    alertElement.addEventListener('click', () => {
      alert.read = true;
      alertElement.classList.remove('unread-alert');
      updateActiveAlertsCount();
    });
    
    alertsList.appendChild(alertElement);
  });
}

function clearAlerts() {
  alerts = [];
  updateActiveAlertsCount();
  populateAlerts();
  addAlert('system', 'All alerts cleared', 'info');
}

function updateActiveAlertsCount() {
  const unreadCount = alerts.filter(alert => !alert.read).length;
  document.getElementById('activeAlerts').textContent = unreadCount;
}

function showNotificationBadge() {
  const bellIcon = document.querySelector('.search-btn i');
  bellIcon.style.animation = 'pulse 2s infinite';
  
  setTimeout(() => {
    bellIcon.style.animation = '';
  }, 5000);
}

function openAlerts() {
  switchScreen('alerts');
}

// Geo-fencing Functions
function toggleTracking() {
  tracking = !tracking;
  const geoStatus = document.getElementById('geoStatus');
  const trackingBtn = document.querySelector('.settings-btn i');
  
  if (tracking) {
    geoStatus.textContent = 'Geo-fencing: enabled • No alerts';
    trackingBtn.className = 'fas fa-satellite-dish';
    addAlert('system', 'Real-time tracking enabled', 'info');
  } else {
    geoStatus.textContent = 'Geo-fencing: disabled';
    trackingBtn.className = 'fas fa-satellite-dish-off';
    addAlert('system', 'Real-time tracking disabled', 'warning');
  }
}

// Profile and Data Updates
function updateProfileData() {
  // Update any dynamic profile data
  const lastLocationEl = document.getElementById('lastLocation');
  updateLastLocation();
}

function updateLastLocation() {
  const locations = ['Ward\'s Lake', 'Elephant Falls', 'Police Bazaar', 'Hotel Pine Borough'];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  setTimeout(() => {
    document.getElementById('lastLocation').textContent = randomLocation;
  }, 1000);
}

function updateUI() {
  // Update any UI elements that need regular refresh
  updateActiveAlertsCount();
  updateTime();
}

// Utility Functions
function showToast(message, type = 'info') {
  // Simple toast notification (you could enhance this)
  console.log(`${type.toUpperCase()}: ${message}`);
}

// Language switching (placeholder)
function switchLanguage(lang) {
  console.log(`Language switched to: ${lang}`);
  addAlert('system', `Language changed to ${lang}`, 'info');
}

// Add CSS for unread alerts
const style = document.createElement('style');
style.textContent = `
  .unread-alert {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%) !important;
    border-left: 4px solid #3b82f6 !important;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;
document.head.appendChild(style);

// Map Functions
function initializeMap() {
  if (map) return; // Already initialized
  
  // Show loading
  const mapContainer = document.getElementById('map');
  const loadingSpinner = document.getElementById('mapLoading');
  
  if (!mapContainer) return;
  
  if (loadingSpinner) loadingSpinner.style.display = 'block';
  
  try {
    // Initialize Leaflet map centered on Shillong, Meghalaya
    map = L.map('map').setView(userLocation, 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Create layer groups
    mapLayers.tourist = L.layerGroup().addTo(map);
    mapLayers.police = L.layerGroup().addTo(map);
    mapLayers.geofence = L.layerGroup().addTo(map);
    mapLayers.incidents = L.layerGroup();
    
    // Add sample data
    addSampleMapData();
    
    // Hide loading
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    addAlert('system', '🗺️ Interactive map loaded with real-time tracking', 'info');
    
  } catch (error) {
    console.error('Map initialization error:', error);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    addAlert('system', 'Map loading failed. Please check connection.', 'error');
  }
}

function addSampleMapData() {
  // Add user location marker
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: '<div style="background:#667eea;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
  
  mapMarkers.user = L.marker(userLocation, {icon: userIcon})
    .addTo(mapLayers.tourist)
    .bindPopup(`<b>Your Location</b><br>Sandra Glam<br>Safety Score: ${safetyScore}`);
  
  // Add other tourists
  const touristLocations = [
    {lat: 25.5790, lng: 91.8930, name: 'Tourist A', score: 85},
    {lat: 25.5785, lng: 91.8940, name: 'Tourist B', score: 78},
    {lat: 25.5795, lng: 91.8925, name: 'Tourist C', score: 92}
  ];
  
  touristLocations.forEach(tourist => {
    const icon = L.divIcon({
      className: 'tourist-marker',
      html: '<div style="background:#10b981;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.2);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const marker = L.marker([tourist.lat, tourist.lng], {icon: icon})
      .addTo(mapLayers.tourist)
      .bindPopup(`<b>${tourist.name}</b><br>Safety Score: ${tourist.score}`);
    
    mapMarkers.tourists.push(marker);
  });
  
  // Add police stations
  const policeStations = [
    {lat: 25.5800, lng: 91.8920, name: 'Shillong Police Station', unit: 'PS-001'},
    {lat: 25.5770, lng: 91.8950, name: 'Laitumkhrah Police Station', unit: 'PS-002'}
  ];
  
  policeStations.forEach(station => {
    const icon = L.divIcon({
      className: 'police-marker',
      html: '<div style="background:#dc2626;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(220,38,38,0.4);"><i class="fas fa-shield-alt" style="color:white;font-size:8px;margin-top:1px;margin-left:1px;"></i></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    
    const marker = L.marker([station.lat, station.lng], {icon: icon})
      .addTo(mapLayers.police)
      .bindPopup(`<b>${station.name}</b><br>Unit: ${station.unit}<br>Status: Active`);
    
    mapMarkers.police.push(marker);
  });
  
  // Add geo-fence zones
  const geoFenceData = [
    {
      center: [25.5788, 91.8933],
      radius: 500,
      name: 'Ward\'s Lake Safe Zone',
      risk: 'low',
      color: '#10b981',
      fillColor: '#10b981'
    },
    {
      center: [25.5820, 91.8960],
      radius: 300,
      name: 'Elephant Falls Caution Zone',
      risk: 'medium',
      color: '#f59e0b',
      fillColor: '#f59e0b'
    },
    {
      center: [25.5750, 91.8900],
      radius: 200,
      name: 'Restricted Military Area',
      risk: 'high',
      color: '#ef4444',
      fillColor: '#ef4444'
    }
  ];
  
  geoFenceData.forEach(zone => {
    const circle = L.circle(zone.center, {
      color: zone.color,
      fillColor: zone.fillColor,
      fillOpacity: 0.2,
      radius: zone.radius,
      weight: 2
    }).addTo(mapLayers.geofence)
      .bindPopup(`<b>${zone.name}</b><br>Risk Level: ${zone.risk}<br>Radius: ${zone.radius}m`);
    
    geoFences.push({circle: circle, data: zone});
  });
  
  // Add sample incidents
  const incidents = [
    {lat: 25.5805, lng: 91.8945, type: 'Minor Injury', time: '2 hours ago', status: 'resolved'},
    {lat: 25.5765, lng: 91.8915, type: 'Lost Tourist', time: '30 minutes ago', status: 'investigating'}
  ];
  
  incidents.forEach(incident => {
    const color = incident.status === 'resolved' ? '#6b7280' : '#f59e0b';
    const icon = L.divIcon({
      className: 'incident-marker',
      html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.3);"><i class="fas fa-exclamation" style="color:white;font-size:6px;margin-top:1px;margin-left:1px;"></i></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const marker = L.marker([incident.lat, incident.lng], {icon: icon})
      .addTo(mapLayers.incidents)
      .bindPopup(`<b>${incident.type}</b><br>Time: ${incident.time}<br>Status: ${incident.status}`);
    
    mapMarkers.incidents.push(marker);
  });
  
  updateMapLastUpdate();
}

function toggleLayer(layerName) {
  const button = document.querySelector(`[onclick="toggleLayer('${layerName}')"]`);
  
  if (!map || !mapLayers[layerName] || !button) return;
  
  if (button.classList.contains('active')) {
    map.removeLayer(mapLayers[layerName]);
    button.classList.remove('active');
  } else {
    map.addLayer(mapLayers[layerName]);
    button.classList.add('active');
  }
}

function centerOnUser() {
  if (!map || !mapMarkers.user) return;
  
  map.setView(userLocation, 15);
  mapMarkers.user.openPopup();
  addAlert('location', '📍 Map centered on your current location', 'info');
}

function updateMapData() {
  if (!map) return;
  
  // Simulate real-time updates
  const rand = Math.random() * 0.002;
  userLocation[0] += (Math.random() - 0.5) * rand;
  userLocation[1] += (Math.random() - 0.5) * rand;
  
  if (mapMarkers.user) {
    mapMarkers.user.setLatLng(userLocation);
  }
  
  updateMapLastUpdate();
}

function updateMapLastUpdate() {
  const element = document.getElementById('mapLastUpdate');
  if (element) {
    element.textContent = 'just now';
  }
}

// Start real-time map updates
setInterval(() => {
  if (map && currentScreen === 'map') {
    updateMapData();
  }
}, 30000); // Update every 30 seconds

// Location Setting Functions
function initializeLocationInputs() {
  // Set current coordinates in inputs
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  
  if (latInput && lngInput) {
    latInput.value = userLocation[0].toFixed(6);
    lngInput.value = userLocation[1].toFixed(6);
  }
  
  // Add search input listener
  const searchInput = document.getElementById('locationSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleLocationSearch);
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchLocation();
      }
    });
  }
}

function handleLocationSearch() {
  const query = document.getElementById('locationSearch').value.trim();
  
  if (locationSearchTimeout) {
    clearTimeout(locationSearchTimeout);
  }
  
  if (query.length < 3) return;
  
  locationSearchTimeout = setTimeout(() => {
    // Show suggestions (simplified)
    console.log(`Searching for: ${query}`);
  }, 300);
}

async function searchLocation() {
  const query = document.getElementById('locationSearch').value.trim();
  
  if (!query) {
    addAlert('location', 'Please enter a location to search', 'warning');
    return;
  }
  
  try {
    // Show loading
    const searchBtn = document.querySelector('button[onclick="searchLocation()"]');
    const originalHtml = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    searchBtn.disabled = true;
    
    // Use Nominatim (OpenStreetMap) geocoding API
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const results = await response.json();
    
    if (results && results.length > 0) {
      const location = results[0];
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lon);
      
      // Update location
      updateUserLocation(lat, lng, location.display_name);
      addAlert('location', `Location set to: ${location.display_name}`, 'success');
      
      // Clear search input
      document.getElementById('locationSearch').value = '';
    } else {
      addAlert('location', 'Location not found. Please try a different search.', 'warning');
    }
    
    // Restore button
    searchBtn.innerHTML = originalHtml;
    searchBtn.disabled = false;
    
  } catch (error) {
    console.error('Location search error:', error);
    addAlert('location', 'Search failed. Please check your connection.', 'error');
    
    // Restore button
    const searchBtn = document.querySelector('button[onclick="searchLocation()"]');
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    searchBtn.disabled = false;
  }
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    addAlert('location', 'Geolocation is not supported by this browser', 'warning');
    return;
  }
  
  const gpsBtn = document.querySelector('button[onclick="getCurrentLocation()"]');
  const originalHtml = gpsBtn.innerHTML;
  gpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  gpsBtn.disabled = true;
  
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      updateUserLocation(lat, lng, 'Your GPS Location');
      addAlert('location', `GPS location acquired: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 'success');
      
      // Restore button
      gpsBtn.innerHTML = originalHtml;
      gpsBtn.disabled = false;
    },
    function(error) {
      let errorMessage = 'Failed to get location';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      addAlert('location', errorMessage, 'warning');
      
      // Restore button
      gpsBtn.innerHTML = originalHtml;
      gpsBtn.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

function setManualLocation() {
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);
  
  if (isNaN(lat) || isNaN(lng)) {
    addAlert('location', 'Please enter valid latitude and longitude values', 'warning');
    return;
  }
  
  if (lat < -90 || lat > 90) {
    addAlert('location', 'Latitude must be between -90 and 90', 'warning');
    return;
  }
  
  if (lng < -180 || lng > 180) {
    addAlert('location', 'Longitude must be between -180 and 180', 'warning');
    return;
  }
  
  updateUserLocation(lat, lng, 'Manual Location');
  addAlert('location', `Location set manually: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 'success');
}

function updateUserLocation(lat, lng, displayName = null) {
  userLocation = [lat, lng];
  
  // Update input fields
  const latInput = document.getElementById('latInput');
  const lngInput = document.getElementById('lngInput');
  
  if (latInput) latInput.value = lat.toFixed(6);
  if (lngInput) lngInput.value = lng.toFixed(6);
  
  // Update map if initialized
  if (map && mapMarkers.user) {
    mapMarkers.user.setLatLng([lat, lng]);
    
    if (displayName) {
      mapMarkers.user.setPopupContent(`<b>${displayName}</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br>Safety Score: ${safetyScore}`);
    }
    
    // Center map on new location
    map.setView([lat, lng], currentMapView === 'world' ? 8 : 13);
  }
  
  // Update location display in UI
  updateLocationDisplay(lat, lng, displayName);
}

async function updateLocationDisplay(lat, lng, displayName = null) {
  if (!displayName) {
    try {
      // Reverse geocoding to get location name
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data && data.display_name) {
        displayName = data.display_name.split(',').slice(0, 3).join(', ');
      } else {
        displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (error) {
      displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
  
  // Update header location
  const locationElement = document.getElementById('userLocation');
  if (locationElement) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    locationElement.textContent = `${displayName} • ${dateStr}`;
  }
}

// Map View Functions
function switchMapView(viewType) {
  if (!map) return;
  
  currentMapView = viewType;
  
  // Update button states
  document.querySelectorAll('.map-view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[onclick="switchMapView('${viewType}')"]`).classList.add('active');
  
  if (viewType === 'world') {
    // Switch to world view
    map.setView([20, 0], 2); // World view centered
    addWorldTouristData();
    addAlert('map', '🌍 Switched to world view - showing global tourists', 'info');
  } else {
    // Switch to local view
    map.setView(userLocation, 13);
    clearWorldTouristData();
    addAlert('map', '🗺️ Switched to local view - showing nearby data', 'info');
  }
}

function addWorldTouristData() {
  // Add tourists from different countries
  const worldTouristData = [
    {lat: 40.7128, lng: -74.0060, name: 'Tourist NYC', country: 'USA', score: 88},
    {lat: 51.5074, lng: -0.1278, name: 'Tourist London', country: 'UK', score: 92},
    {lat: 35.6762, lng: 139.6503, name: 'Tourist Tokyo', country: 'Japan', score: 85},
    {lat: -33.8688, lng: 151.2093, name: 'Tourist Sydney', country: 'Australia', score: 90},
    {lat: 48.8566, lng: 2.3522, name: 'Tourist Paris', country: 'France', score: 86},
    {lat: 55.7558, lng: 37.6173, name: 'Tourist Moscow', country: 'Russia', score: 78},
    {lat: 39.9042, lng: 116.4074, name: 'Tourist Beijing', country: 'China', score: 82},
    {lat: -23.5505, lng: -46.6333, name: 'Tourist São Paulo', country: 'Brazil', score: 79},
    {lat: 19.4326, lng: -99.1332, name: 'Tourist Mexico City', country: 'Mexico', score: 75},
    {lat: 30.0444, lng: 31.2357, name: 'Tourist Cairo', country: 'Egypt', score: 73}
  ];
  
  worldTouristData.forEach(tourist => {
    const icon = L.divIcon({
      className: 'world-tourist-marker',
      html: `<div style="background:#3b82f6;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    const marker = L.marker([tourist.lat, tourist.lng], {icon: icon})
      .addTo(mapLayers.tourist)
      .bindPopup(`<b>${tourist.name}</b><br>Country: ${tourist.country}<br>Safety Score: ${tourist.score}`);
    
    worldTourists.push(marker);
  });
}

function clearWorldTouristData() {
  worldTourists.forEach(marker => {
    mapLayers.tourist.removeLayer(marker);
  });
  worldTourists = [];
}

// Popular Location Selection
function setPopularLocation(lat, lng, name) {
  updateUserLocation(lat, lng, name);
  
  // Switch to appropriate view based on location
  if (currentMapView === 'world') {
    map.setView([lat, lng], 8);
  } else {
    switchMapView('local');
  }
  
  addAlert('location', `📍 Location set to ${name}`, 'success');
}

// Export functions for global access
window.switchScreen = switchScreen;
window.triggerPanic = triggerPanic;
window.shareLiveLocation = shareLiveLocation;
window.callPolice = callPolice;
window.openAlerts = openAlerts;
window.clearAlerts = clearAlerts;
window.toggleTracking = toggleTracking;
window.toggleLayer = toggleLayer;
window.centerOnUser = centerOnUser;
window.searchLocation = searchLocation;
window.getCurrentLocation = getCurrentLocation;
window.setManualLocation = setManualLocation;
window.switchMapView = switchMapView;
window.setPopularLocation = setPopularLocation;

console.log('🌟 Smart Tourist Safety System loaded successfully!');
