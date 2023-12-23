const mongoose = require('mongoose');
const axios = require('axios');
const Campground = require('../models/campground');

const apiKey = 'kkcP0vNRZQ8z3EYFiAFtjdEfyGlfImRnRTq3sipR';
const apiUrl = 'https://developer.nps.gov/api/v1/campgrounds';

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

// Function to make API call and retrieve campground details
const fetchCampgroundsDetails = async () => {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                api_key: apiKey,
                limit: 50,
            },
        });

        return response.data.data;
    } catch (error) {
        console.error('Error fetching campgrounds details:', error.message);
        throw error;
    }
};

// Function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


// Function to fetch a random photo from Unsplash
const fetchRandomUnsplashPhoto = async () => {
    try {
        const { default: fetch } = await import('node-fetch');

        const response = await fetch('https://api.unsplash.com/photos/random?query=campground&count=1&orientation=landscape', {
            headers: {
                'Authorization': 'Client-ID MlAgTjmC2czpAXL-6ZfCzkCh_-q8MmNHBgFzXcxfdZE',
            },
        });

        const photo = await response.json();
        return photo[0].urls.full;
    } catch (error) {
        console.error('Error fetching random Unsplash photo:', error.message);
        throw error;
    }
};

// Seed the database with campground instances from the API
const seedDB = async () => {
    try {
        await Campground.deleteMany({});

        // Fetch campground details from National Parks API
        const nationalParkCampgroundsDetails = await fetchCampgroundsDetails();

        // Shuffle the campground details array
        const shuffledCampgrounds = shuffleArray(nationalParkCampgroundsDetails);

        // Seed the database with National Parks campgrounds
        for (const campgroundDetails of shuffledCampgrounds) {

            // Extract relevant information
            const {
                name,
                addresses,
                description,
                latLong,
            } = campgroundDetails;

            // Parse latitude and longitude from latLong
            const match = latLong.match(/lat:([\d.-]+), lng:([\d.-]+)/);
            const latitude = match ? parseFloat(match[1]) : null;
            const longitude = match ? parseFloat(match[2]) : null;

            // Get random unsplash image
            const unsplashPhotoUrl = await fetchRandomUnsplashPhoto();

            // Extract city and state code from addresses
            const address = addresses.find(addr => addr.type === 'Physical');
            const city = address ? address.city : '';
            const stateCode = address ? address.stateCode : '';

            // Create a random price between 5 and 100
            let randomPrice = Math.floor(Math.random() * 36) + 5;

            // Extract price from the description if it contains a dollar sign
            const priceMatch = description.match(/\$(\d+(?:\.\d{1,2})?)/);
            if (priceMatch) {
                // Use the extracted price as the campground price
                randomPrice = parseFloat(priceMatch[1]);
            }

            // Replace the static image URLs with the Unsplash photo URL
            const images = [
                {
                    url: unsplashPhotoUrl,
                    filename: `Unsplash/${Date.now()}`,
                },
            ];


            // Construct the location
            const location = `${city}, ${stateCode}`;

            // Check if the location has more than 2 characters
            if (location.length > 2) {
                const camp = new Campground({
                    author: '656cb33d60b05dbc745bc244',
                    location: location,
                    title: name,
                    description: description,
                    price: randomPrice,
                    images: images,
                    geometry: {
                        type: 'Point',
                        coordinates: [longitude || 0, latitude || 0],
                    },
                });

                // Save the campground
                await camp.save();
            }
        }

        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
