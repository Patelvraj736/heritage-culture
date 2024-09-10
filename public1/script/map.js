
const map = L.map('map').setView([20.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

const culturalPlacesIndia = [
    { name: "Taj Mahal", lat: 27.1751, lon: 78.0421 },
    { name: "Red Fort", lat: 28.6562, lon: 77.2410 },
    { name: "Qutub Minar", lat: 28.5244, lon: 77.1855 },
    { name: "Gateway of India", lat: 18.9217, lon: 72.8347 },
    { name: "Hawa Mahal", lat: 26.9196, lon: 75.7873 },
    { name: "Humayun's Tomb", lat: 28.5934, lon: 77.2090 },
    { name: "Mysore Palace", lat: 12.3051, lon: 76.6556 },
    { name: "Meenakshi Temple", lat: 9.9194, lon: 78.1198 },
    { name: "Rani ki Vav", lat: 23.5924, lon: 71.5618 },
    { name: "Ellora Caves", lat: 20.0216, lon: 75.2924 },
    { name: "Ajanta Caves", lat: 20.5486, lon: 75.7041 },
    { name: "Konark Sun Temple", lat: 19.8882, lon: 86.0946 },
    { name: "Sanchi Stupa", lat: 23.4878, lon: 78.7658 },
    { name: "Khajuraho Temples", lat: 24.8314, lon: 79.9195 },
    { name: "Mahabalipuram", lat: 12.6200, lon: 80.2057 },
    { name: "Hampi", lat: 15.3355, lon: 76.4600 },
    { name: "Rathambore Fort", lat: 26.0373, lon: 76.6743 },
    { name: "Amber Fort", lat: 26.9855, lon: 75.8495 },
    { name: "Brihadeeswarar Temple", lat: 10.7905, lon: 79.1398 },
    { name: "Chittorgarh Fort", lat: 24.8880, lon: 74.6269 },
    { name: "Fatehpur Sikri", lat: 27.0978, lon: 77.6619 },
    { name: "Rani Durgavati Palace", lat: 23.1790, lon: 79.9815 },
    { name: "Madhurai Meenakshi Temple", lat: 9.9194, lon: 78.1198 },
    { name: "Raghurajpur", lat: 19.7376, lon: 85.8271 },
    { name: "Bodh Gaya", lat: 24.6960, lon: 84.9915 },
    { name: "Tirupati Temple", lat: 13.6288, lon: 79.4192 },
    { name: "Jagannath Temple", lat: 19.7969, lon: 85.8318 },
    { name: "Elephanta Caves", lat: 18.9913, lon: 72.8552 },
    { name: "Ajmer Sharif Dargah", lat: 26.4573, lon: 74.6281 },
    { name: "Tiruchirappalli Rock Fort", lat: 10.8056, lon: 78.6854 },
    { name: "Sri Aurobindo Ashram", lat: 11.9331, lon: 79.8310 },
    { name: "Nalanda University", lat: 25.0842, lon: 85.4510 },
    { name: "Kumarakom", lat: 9.6240, lon: 76.3968 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { name: "Rishikesh", lat: 30.0869, lon: 78.2676 },
    { name: "Gulmarg", lat: 34.0590, lon: 73.4783 },
    { name: "Shimla", lat: 31.1048, lon: 77.1734 },
    { name: "Darjeeling", lat: 27.0385, lon: 88.2622 },
    { name: "Munnar", lat: 10.0889, lon: 77.1062 },
    { name: "Udaipur", lat: 24.5797, lon: 73.6671 },
    { name: "Mount Abu", lat: 24.5921, lon: 72.2385 },
    { name: "Srinagar", lat: 34.0836, lon: 74.7973 },
    { name: "Agra Fort", lat: 27.1767, lon: 78.0081 },
    { name: "Jaisalmer Fort", lat: 26.9157, lon: 70.9172 },
    { name: "Jodhpur Fort", lat: 26.2945, lon: 73.0296 },
    { name: "Mehrangarh Fort", lat: 26.2945, lon: 73.0296 },
    { name: "Srirangapatna", lat: 12.4217, lon: 76.6584 },
    { name: "Sri Ranganathaswamy Temple", lat: 10.9261, lon: 79.5260 },
    { name: "Kailasa Temple", lat: 20.0216, lon: 75.2924 },
    { name: "Chola Temples", lat: 10.7905, lon: 79.1398 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Kerala Backwaters", lat: 9.5936, lon: 76.5226 },
    { name: "Nashik", lat: 20.0118, lon: 73.7904 }

];

let markers = [];
let routingControl = null;
let userMarker = null;
let currentLocation = null;

const userIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

function searchLocation(query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=IN`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const place = data[0];
                const coords = [place.lat, place.lon];

                markers.forEach(marker => {
                    if (marker !== userMarker) {
                        map.removeLayer(marker);
                    }
                });
                markers = [userMarker]; 


                const marker = L.marker(coords).addTo(map)
                    .bindPopup(`<b>${place.display_name}</b>`)
                    .openPopup()
                    .bindTooltip(place.display_name, { permanent: false, direction: 'top' });

                markers.push(marker);

                map.setView(coords, 13);

                getCurrentLocation(() => {
                    if (currentLocation) {
                        if (routingControl) {
                            map.removeControl(routingControl); 
                        }

                        routingControl = L.Routing.control({
                            waypoints: [
                                L.latLng(currentLocation),
                                L.latLng(coords)
                            ],
                            routeWhileDragging: true,
                            lineOptions: {
                                styles: [{ color: 'blue', weight: 6 }]
                            }
                        }).addTo(map);

                        document.getElementById('directions').innerHTML = '';
                    }
                });
            } else {
                alert("No results found.");
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert("An error occurred while searching for the location.");
        });
}

function handleSearch() {
    const searchQuery = document.getElementById('search').value;
    if (searchQuery.length > 2) {
        if (userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
        }
        searchLocation(searchQuery);
    } else {
        alert("Please enter at least 5 characters to search.");
    }
}


document.getElementById('search-btn').addEventListener('click', handleSearch);
document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});

function addCulturalMarkers() {
    culturalPlacesIndia.forEach(place => {
        const marker = L.marker([place.lat, place.lon]).addTo(map)
            .bindPopup(`<b>${place.name}</b>`)
            .bindTooltip(place.name, { permanent: false, direction: 'top' })
            .on('click', () => {
                getCurrentLocation(() => {
                    if (currentLocation) {
                        if (routingControl) {
                            map.removeControl(routingControl); // Remove existing route
                        }

                        markers.forEach(marker => {
                            if (marker !== userMarker) {
                                map.removeLayer(marker);
                            }
                        });
                        markers = [userMarker]; // Keep user marker

                        routingControl = L.Routing.control({
                            waypoints: [
                                L.latLng(currentLocation),
                                L.latLng(place.lat, place.lon)
                            ],
                            routeWhileDragging: true,
                            lineOptions: {
                                styles: [{ color: 'blue', weight: 6 }]
                            }
                        }).addTo(map);

                        // Clear directions display
                        document.getElementById('directions').innerHTML = '';
                    }
                });
            });

        markers.push(marker);
    });
}

// Function to get current location and initialize user marker
function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            currentLocation = [position.coords.latitude, position.coords.longitude];
            if (userMarker) {
                userMarker.setLatLng(currentLocation);
            } else {
                userMarker = L.marker(currentLocation, { icon: userIcon, draggable: true }).addTo(map)
                    .bindPopup("You are here")
                    .openPopup();
            }
            callback(currentLocation);
        }, () => {
            alert("Geolocation access denied or unavailable.");
            callback(null);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
        callback(null);
    }
}

// Initialize markers and get current location on map load
addCulturalMarkers();
