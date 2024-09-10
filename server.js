const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

app.use(express.static(path.join(__dirname, 'public1')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public1', 'index.html'));
});
app.get('/public', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/api/plan-trip', async (req, res) => {
    const { place, startDate, endDate } = req.body;

    try {

        const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: place,
                format: 'json',
                limit: 1
            }
        });

        if (nominatimResponse.data.length === 0) {
            return res.status(404).json({ message: 'Place not found' });
        }

        const { lat, lon } = nominatimResponse.data[0];

    
        const wikiResponse = await axios.get(`https://en.wikipedia.org/w/api.php`, {
            params: {
                action: 'query',
                list: 'geosearch',
                gscoord: `${lat}|${lon}`,
                gsradius: 10000, 
                gslimit: 50,    
                format: 'json'
            }
        });

        const places = wikiResponse.data.query.geosearch;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const roadmap = [];
        for (let i = 0; i < days; i++) {
            const dayPlaces = places.slice(i * 5, (i + 1) * 5);
            const daySchedule = [];
            let currentTime = new Date(start);
            currentTime.setHours(9, 0, 0);

            for (let j = 0; j < dayPlaces.length; j++) {
                if (j > 0) {

                    const prevPlace = dayPlaces[j - 1];
                    const distance = calculateDistance(
                        prevPlace.lat, prevPlace.lon,
                        dayPlaces[j].lat, dayPlaces[j].lon
                    );
                    const travelTime = distance / 60;
                    currentTime = new Date(currentTime.getTime() + travelTime * 60 * 60 * 1000);
                }

                daySchedule.push({
                    title: dayPlaces[j].title,
                    visitTime: currentTime.toTimeString().slice(0, 5)
                });

                currentTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
            }

            roadmap.push({
                day: `Day ${i + 1}`,
                places: daySchedule
            });
        }

        res.json({ roadmap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data from APIs' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
