
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search').addEventListener('input', filterPlaces);
});
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.place-card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = 'specific_place.html';
        });
    });

    document.getElementById('search').addEventListener('input', filterPlaces);
});

function filterPlaces() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const placeCards = document.querySelectorAll('.place-card');

    placeCards.forEach(card => {
        const placeName = card.querySelector('h2').textContent.toLowerCase();
        if (placeName.includes(searchInput)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

