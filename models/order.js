const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            product: Object,
            quantity: Number
        }
    ],
    user: {
        email: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User' //which collection the ID will refer to
        }
    }
});

module.exports = mongoose.model('orders', orderSchema);