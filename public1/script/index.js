document.querySelectorAll('.places').forEach(function(element) {
    element.addEventListener('click', function() {
        window.location.href = 'city.html';
    });
});
function navigateToPage(url) {
    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', function() {
    const categories = document.querySelectorAll('.categories-lists .category1');
    const urls = [
        './photo-gallery.html', 
        './Quiz.html', 
        './Blog.html', 
        './culture.html', 
        '../public/index.html'
    ];

    categories.forEach((category, index) => {
        category.addEventListener('click', () => {
            navigateToPage(urls[index]);
        });
    });
});

    function navigateToMapPage() {
        window.location.href = 'map.html';
    }

    document.addEventListener('DOMContentLoaded', function() {
        const mapLogo = document.querySelector('.map-logo');
        const headings = document.querySelector('.map-text .headings');

        mapLogo.addEventListener('click', navigateToMapPage);
        headings.addEventListener('click', navigateToMapPage);
    });

