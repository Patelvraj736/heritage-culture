document.getElementById('tripForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const place = document.getElementById('place').value;
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    // Convert input dates to Date objects
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    // Get today's date and set the time to the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Adjust start and end dates to exclude time component
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Validate dates
    if (startDate < today) {
        alert('Start date must be today or later.');
        return;
    }

    if (endDate < startDate) {
        alert('End date must be the same as or later than the start date.');
        return;
    }

    // Calculate the number of days between start and end dates
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    try {
        const response = await fetch('/api/plan-trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ place, startDate: startDateInput, endDate: endDateInput })
        });

        const data = await response.json();
        displayItinerary(data.roadmap, days);
    } catch (error) {
        console.error('Error:', error);
    }
});

function displayItinerary(roadmap, totalDays) {
    const itineraryDiv = document.getElementById('itinerary');
    itineraryDiv.innerHTML = '';

    // Handle one day itinerary
    if (totalDays === 1) {
        const day = roadmap[0];
        
        // Only display if there are places to show
        if (day.places.length > 0) {
            const dayDiv = document.createElement('div');
            dayDiv.innerHTML = `<h3>${day.day}</h3>`;
            day.places.forEach(place => {
                dayDiv.innerHTML += `<p>${place.visitTime} - ${place.title}</p>`;
            });
            itineraryDiv.appendChild(dayDiv);
        }
    } else {
        // Handle multi-day itinerary
        roadmap.forEach(day => {
            // Only create and append the div if there are places for that day
            if (day.places.length > 0) {
                const dayDiv = document.createElement('div');
                dayDiv.innerHTML = `<h3>${day.day}</h3>`;
                day.places.forEach(place => {
                    dayDiv.innerHTML += `<p>${place.visitTime} - ${place.title}</p>`;
                });
                itineraryDiv.appendChild(dayDiv);
            }
        });
    }
}
