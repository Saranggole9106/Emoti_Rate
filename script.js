// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const ratingModal = document.getElementById('ratingModal');
const notification = document.getElementById('notification');

// State Management
let currentProduct = null;
let products = [
    {
        id: 1,
        name: "Premium Headphones",
        price: 14999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        ratings: []
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 22499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        ratings: []
    },
    {
        id: 3,
        name: "Wireless Earbuds",
        price: 11249,
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500",
        ratings: []
    },
    {
        id: 4,
        name: "Bluetooth Speaker",
        price: 6749,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        ratings: []
    },
    {
        id: 5,
        name: "Gaming Mouse",
        price: 5999,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500",
        ratings: []
    },
    {
        id: 6,
        name: "Mechanical Keyboard",
        price: 9749,
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500",
        ratings: []
    }
];

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Navigation
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Product Management
function displayProducts(productsToShow = products) {
    productsGrid.innerHTML = '';
    productsToShow.forEach(product => {
        const card = createProductCard(product);
        productsGrid.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const averageRating = calculateAverageRating(product.ratings);
    const ratingCount = product.ratings.length;

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
            <div class="product-rating">
                <div class="rating-stars">
                    ${generateStarRating(averageRating)}
                </div>
                <span class="rating-count">(${averageRating.toFixed(1)})</span>
            </div>
            <div class="product-actions">
                <button class="btn" onclick="openRatingModal(${product.id})">
                    <i class="fas fa-star"></i>
                    Rate Product
                </button>
                <button class="btn btn-outline" onclick="openReviewsModal(${product.id})">
                    <i class="fas fa-comments"></i>
                    View Reviews
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

// Rating Management
function openRatingModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    const modal = document.getElementById('ratingModal');
    modal.style.display = 'block';
    modal.classList.add('show');
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    currentProduct = null;
}

function submitRating() {
    if (!currentProduct) return;

    const mood = document.querySelector('.emoji-btn.selected')?.getAttribute('data-mood');
    const rating = parseInt(document.getElementById('rating').value);
    const comment = document.getElementById('comment').value;
    const username = document.getElementById('username').value;

    if (!mood || !rating || !comment || !username) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Check if username already exists in ratings
    if (currentProduct.ratings.some(r => r.username === username)) {
        showNotification('You have already rated this product', 'error');
        return;
    }

    const newRating = {
        id: Date.now(),
        username,
        mood,
        rating,
        comment,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    currentProduct.ratings.push(newRating);
    saveToLocalStorage();
    displayProducts();
    updateDashboard();
    closeRatingModal();
    showNotification('Rating submitted successfully!', 'success');
}

function openReviewsModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.createElement('div');
    modal.className = 'modal reviews-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${product.name} - Reviews</h2>
            <div class="reviews-container">
                ${product.ratings.length === 0 ? 
                    '<p class="no-reviews">No reviews yet</p>' :
                    product.ratings.map(rating => `
                        <div class="review-card">
                            <div class="review-header">
                                <span class="review-username">${rating.username}</span>
                                <span class="review-date">${rating.date}</span>
                            </div>
                            <div class="review-mood">
                                <span class="emoji">${getMoodEmoji(rating.mood)}</span>
                                <span class="mood-text">${rating.mood}</span>
                            </div>
                            <div class="review-rating">
                                ${generateStarRating(rating.rating)}
                                <span class="rating-value">${rating.rating.toFixed(1)}</span>
                            </div>
                            <p class="review-comment">${rating.comment}</p>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';
    modal.classList.add('show');

    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };
}

function getMoodEmoji(mood) {
    const emojis = {
        happy: '😊',
        neutral: '😐',
        sad: '😢',
        angry: '😠',
        excited: '🤩'
    };
    return emojis[mood] || '😐';
}

// Utility Functions
function calculateAverageRating(ratings) {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / ratings.length;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
}

// Search Functionality
function filterProducts(query) {
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
    );
    displayProducts(filtered);
}

// Dashboard Updates
function updateDashboard() {
    const totalRatings = products.reduce((acc, curr) => acc + curr.ratings.length, 0);
    const averageRating = products.reduce((acc, curr) => {
        return acc + calculateAverageRating(curr.ratings);
    }, 0) / products.length;

    const moodCounts = {};
    products.forEach(product => {
        product.ratings.forEach(rating => {
            moodCounts[rating.mood] = (moodCounts[rating.mood] || 0) + 1;
        });
    });

    const mostCommonMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    document.getElementById('totalRatings').textContent = totalRatings;
    document.getElementById('averageRating').textContent = averageRating.toFixed(1);
    document.getElementById('mostCommonMood').textContent = mostCommonMood;

    updateCharts();
}

function updateCharts() {
    // Rating Distribution Chart
    const ratingCtx = document.getElementById('ratingChart').getContext('2d');
    const ratingData = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    products.forEach(product => {
        product.ratings.forEach(rating => {
            ratingData[rating.rating]++;
        });
    });

    new Chart(ratingCtx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Ratings',
                data: Object.values(ratingData),
                backgroundColor: [
                    '#ff6b6b',
                    '#ffd93d',
                    '#6c5ce7',
                    '#a8e6cf',
                    '#4a90e2'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Mood Distribution Chart
    const moodCtx = document.getElementById('moodChart').getContext('2d');
    const moodData = {
        happy: 0,
        neutral: 0,
        sad: 0,
        angry: 0,
        excited: 0
    };

    products.forEach(product => {
        product.ratings.forEach(rating => {
            moodData[rating.mood]++;
        });
    });

    new Chart(moodCtx, {
        type: 'doughnut',
        data: {
            labels: ['Happy', 'Neutral', 'Sad', 'Angry', 'Excited'],
            datasets: [{
                data: Object.values(moodData),
                backgroundColor: [
                    '#4cd137',
                    '#fbc531',
                    '#e84118',
                    '#273c75',
                    '#9c88ff'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadFromLocalStorage();
    displayProducts();
    updateDashboard();

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        filterProducts(e.target.value);
    });

    // Rating Modal
    document.querySelector('.close').addEventListener('click', closeRatingModal);
    document.getElementById('submitRating').addEventListener('click', submitRating);

    // Emoji Selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Reset All Ratings
    document.getElementById('resetAllRatings').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all ratings? This action cannot be undone.')) {
            products.forEach(product => {
                product.ratings = [];
            });
            saveToLocalStorage();
            displayProducts();
            updateDashboard();
            showNotification('All ratings have been reset', 'success');
        }
    });
});
