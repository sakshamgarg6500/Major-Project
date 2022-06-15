const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    password: String,
    cart: {
        items: [
                {
                    productId: { type: Schema.Types.ObjectId, ref: 'products'}, 
                    quantity: Number
                }
        ]   
    }
});

//allows us to add our own methods to the Schema
userSchema.methods.addToCart = function(product) 
{
    const cartProductIndex = this.cart.items.findIndex(cp =>{ //finding index if already product exists
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if(cartProductIndex >= 0) //if products's index is found, it will be greatre than or equal to 0
    {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else
    {
        updatedCartItems.push({productId: product._id, quantity: newQuantity});
    }

    const updatedCart = {
        items: updatedCartItems
    };

    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(productId)
{
    const updatedCartItems = this.cart.items.filter(item => { //filter method will return a new array for all the [items] that pass the condition
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function()
{
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('users', userSchema);