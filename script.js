let map;
const mockServices = [
  { name: "Cleaner A", type: "cleaning", lat: 37.7749, lng: -122.4194, id: 1 },
  { name: "Plumber B", type: "plumbing", lat: 37.7849, lng: -122.4094, id: 2 },
  { name: "Electrician C", type: "electrical", lat: 37.7649, lng: -122.4294, id: 3 },
  { name: "Painter D", type: "painting", lat: 37.7549, lng: -122.4394, id: 4 }
];

let trackingIntervals = {};
let serviceMarkers = {};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 13,
  });
}

function startTracking(providerId) {
  const btn = document.querySelector(`[data-provider="${providerId}"] .track-btn`);
  const status = document.querySelector(`[data-provider="${providerId}"] .status`);
  
  if (trackingIntervals[providerId]) {
    // Stop tracking
    clearInterval(trackingIntervals[providerId]);
    delete trackingIntervals[providerId];
    btn.textContent = "Track Live";
    btn.style.background = "#10b981";
    status.textContent = "Online";
    status.className = "status online";
    if (serviceMarkers[providerId]) {
      serviceMarkers[providerId].setMap(null);
      delete serviceMarkers[providerId];
    }
    return;
  }

  // Start tracking
  btn.textContent = "Stop Tracking";
  btn.style.background = "#ef4444";
  status.textContent = "Tracking";
  status.className = "status tracking";

  const provider = mockServices.find(s => s.id === providerId);
  serviceMarkers[providerId] = new google.maps.Marker({
    position: { lat: provider.lat, lng: provider.lng },
    map: map,
    title: `${provider.name} (Live)`,
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/tracking.png",
      scaledSize: new google.maps.Size(32, 32)
    }
  });

  trackingIntervals[providerId] = setInterval(() => {
    // Simulate realistic movement within bounds
    provider.lat += (Math.random() - 0.5) * 0.002;
    provider.lng += (Math.random() - 0.5) * 0.002;
    
    // Keep within reasonable bounds (San Francisco area)
    provider.lat = Math.max(37.7, Math.min(37.85, provider.lat));
    provider.lng = Math.max(-122.5, Math.min(-122.35, provider.lng));
    
    serviceMarkers[providerId].setPosition({ lat: provider.lat, lng: provider.lng });
    map.setCenter({ lat: provider.lat, lng: provider.lng });
    map.setZoom(16);
  }, 5000);
}

const form = document.getElementById('serviceForm');
const results = document.getElementById('results');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const location = document.getElementById('location').value;
  const serviceType = document.getElementById('serviceType').value;
  
  if (location && serviceType) {
    // Clear all previous tracking and markers
    Object.values(trackingIntervals).forEach(clearInterval);
    Object.values(serviceMarkers).forEach(marker => marker.setMap(null));
    trackingIntervals = {};
    serviceMarkers = {};
    
    // Reset map
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 13,
    });
    
    const filteredServices = mockServices.filter(service => service.type === serviceType);
    let listHTML = `<h3>Available ${serviceType} services near ${location}</h3><ul class="provider-list">`;
    
    filteredServices.forEach(service => {
      listHTML += `
        <li class="provider" data-provider="${service.id}">
          <div class="avatar">${service.name[0]}</div>
          <div class="meta">
            <div class="name">${service.name}</div>
            <div class="meta-sub">${location} area - Ready to serve</div>
          </div>
          <div class="status online">Online</div>
          <button class="track-btn" onclick="startTracking(${service.id})">Track Live</button>
        </li>
      `;
    });
    listHTML += '</ul>';
    results.innerHTML = listHTML;
  } else {
    results.innerHTML = '<p>Please enter location and select a service.</p>';
  }
});
