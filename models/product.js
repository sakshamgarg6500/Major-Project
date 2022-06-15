const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//no need to define constructor as in case of mongodb driver only, instead we declare schemas
const productSchema = new Schema({ //description of how a product should look like in the application
    title: String,
    image: String,
    price: Number,
    author: String,
    user: { //relation setup
        type: Schema.Types.ObjectId,
        ref: 'users' //reference to which collection
    } 
});

module.exports = mongoose.model('products', productSchema);