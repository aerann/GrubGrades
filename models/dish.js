const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

//not actually stored on database, so you don't have to store 2 different urls
ImageSchema.virtual('thumbnail').get(function() {
   return this.url.replace('/upload', '/upload/w_250')
})

const DishSchema = new Schema({
    title: String, 
    price: Number, 
    description: String,
    images: [ImageSchema],
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

//post lets you have access to the data of what was deleted
//deletes reviews when you delete a dish
DishSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews //delete all reviews where the id is in the reviews array
            }
        })
    }
})

module.exports = mongoose.model('Dish', DishSchema)