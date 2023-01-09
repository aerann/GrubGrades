// Seeds Database (deletes everything in database first)
const mongoose = require('mongoose')
const cities = require('./cities')
const axios = require('axios')
const {foods, descriptors} =  require('./seedHelpers')
const Dish = require('../models/dish');
const { collection } = require('../models/dish');

mongoose.connect('mongodb://127.0.0.1:27017/grub-grades') //shopApp database
    .then(() => {
        console.log("mongo connection open")
    })
    .catch(err => {
        console.log("oh no")
        console.log(err)
    });

// returns a random element from array
const sample = array => array[Math.floor(Math.random() * array.length)]


// unsplash collections. 
const collectionOne = 'ikF35KnI5OM';           
const collectionTwo = 'y1tbQlwWCqk'; 
const collectionThree = ''; 

//call unsplash api and return small image
async function seedImg(collection){
    try{
        const resp = await
        axios.get('https://api.unsplash.com/photos/random', {
        params: {
        client_id: 'TfeDYhDsI8QFb852etWwfZpPEA2YrAdTHI0YPWGLT2g',
        collections: collection,
        count: 30 //max count allowed by unsplash API
      },
      headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' }
    })
    return resp.data.map((a) => a.urls.small);
  } catch (err) {
    console.error(err)
  }
}

//seed database with images
const seedDB = async() => {
    await Dish.deleteMany({}); 
    //make 3 API requests to unsplash, 30 images per request
    const imageSetOne = await seedImg(collectionOne);
    const imageSetTwo = await seedImg(collectionTwo);
    const imageSetThree = await seedImg(collectionThree);
    //spread into one array
    const imgs = [...imageSetOne, ...imageSetTwo, ...imageSetThree]; //90 random images

    //seeding data into dishes collection
    for(let i =0; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000); 
        const price = Math.floor(Math.random() * 10) + 9
        const imgsSeed = Math.floor(Math.random() * imgs.length);
        const dish = new Dish({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(foods)}`, //random name of dish
            image: `${imgs[imgsSeed]}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam eos sint consequuntur in sequi qui ducimus debitis animi hic facilis maiores neque quod nemo numquam nihil id, eligendi et officiis?',
            price //same as price:price
        })
        await dish.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})