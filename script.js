const API_KEY = 'zd0KWpTeAu53is28npOGZtlmbQ8bnEgmfoJ0dZgfxbC9c7BCmZhGLlui'; 
const VIDEO_URL = 'https://api.pexels.com/videos/popular';
const BASE_URL = 'https://api.pexels.com/v1/search';
const CURATED_URL = 'https://api.pexels.com/v1/curated';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const gallery = document.getElementById('imageGallery');

// Show random popular photos and videos on page load
window.addEventListener('DOMContentLoaded', () => {
  showLoading();
  Promise.all([fetchPopularImages(), fetchVideos()])
    .finally(hideLoading);
});

// Fetch and display popular videos (like Pinterest)
function fetchVideos() {
  const videoGallery = document.getElementById('videoGallery');
  if (!videoGallery) return;
  videoGallery.innerHTML = '';
  // Randomize page for new results each time
  const maxPages = 50; // Pexels allows up to 1000 videos, 20 per page
  const randomPage = Math.floor(Math.random() * maxPages) + 1;
  return fetch(`${VIDEO_URL}?per_page=9&page=${randomPage}`, {
    headers: {
      Authorization: API_KEY
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (!data.videos || data.videos.length === 0) {
        videoGallery.innerHTML = '<p>No videos found.</p>';
        return;
      }
      data.videos.forEach(video => {
        const videoEl = document.createElement('video');
        videoEl.src = video.video_files[0].link;
        videoEl.controls = true;
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.autoplay = true;
        videoEl.style.width = '100%';
        videoEl.style.borderRadius = '12px';
        videoEl.style.marginBottom = '10px';
        videoGallery.appendChild(videoEl);
      });
      videoGallery.style.display = 'grid';
      videoGallery.style.gridTemplateColumns = 'repeat(3, 1fr)';
      videoGallery.style.gap = '12px';
    })
    .catch(error => {
      videoGallery.innerHTML = '<p>Oops! Something went wrong loading videos.</p>';
      console.error('Error fetching videos:', error);
    });
}

function fetchPopularImages() {
  // Pexels curated endpoint supports pagination, so pick a random page for variety
  const maxPages = 50; // Pexels allows up to 1000 curated photos, 12 per page
  const randomPage = Math.floor(Math.random() * maxPages) + 1;
  return fetch(`${CURATED_URL}?per_page=12&page=${randomPage}`, {
    headers: {
      Authorization: API_KEY
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      displayImages(data.photos);
    })
    .catch(error => {
      console.error('Error fetching curated images:', error);
      gallery.innerHTML = '<p>Oops! Something went wrong loading popular images.</p>';
    });
}

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query !== '') {
    showLoading();
    fetchImages(query);
  }
});

function fetchImages(query) {
  fetch(`${BASE_URL}?query=${encodeURIComponent(query)}&per_page=12`, {
    headers: {
      Authorization: API_KEY
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`); // error handling
      }
      return res.json();
    })
    .then(data => {
      displayImages(data.photos);
    })
    .catch(error => {
      console.error('Error fetching data from Pexels API:', error); // error handling
      gallery.innerHTML = '<p>Oops! Something went wrong. Please try again later.</p>';
    })
    .finally(() => {
      hideLoading();
    });
}

// Show/hide loading screen helpers
function showLoading() {
  document.getElementById('loadingScreen').style.display = 'flex';
}
function hideLoading() {
  document.getElementById('loadingScreen').style.display = 'none';
}

function displayImages(photos) {
  gallery.innerHTML = ''; // Clear previous images
  if (!photos || photos.length === 0) {
    gallery.innerHTML = '<p>No images found. Try a different keyword!</p>';
    return;
  }
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.src.medium;
    img.alt = photo.alt;
    img.title = `Photo by ${photo.photographer}`;
    gallery.appendChild(img);
  });
}
