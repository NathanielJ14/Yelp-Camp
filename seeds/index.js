const mongoose = require('mongoose');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelper');
const cities = require('./cities');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

// Establishing a connection to the Database

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

// Adds randomly created instances inside of the database
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '656cb33d60b05dbc745bc244',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Similique iure, laborum laboriosam optio voluptates totam commodi rem officia possimus qui, deserunt neque, natus architecto unde ducimus sit impedit tempora eligendi.",
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});