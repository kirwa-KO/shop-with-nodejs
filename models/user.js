// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const User = sequelize.define('user', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   name: Sequelize.STRING,
//   email: Sequelize.STRING
// });

// module.exports = User;

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');

// class User {
// 	constructor(username, email, id, cart) {
// 		this.username = username;
// 		this.email = email;
// 		this._id = id ? new mongodb.ObjectId(id) : null;
// 		this.cart = cart;
// 	}
// 	save() {
// 		const db = getDb();
// 		return db.collection('users').insertOne(this);
// 	}

// 	static findById(userId) {
// 		const db = getDb();
// 		return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
// 	}

// 	addToCart(product) {
// 		const cartProductIndex = this.cart.items.findIndex(cp => {
// 			return cp.productId.toString() === product._id.toString();
// 		})
// 		let newQuantity = 1;
// 		const updateCartItems = [...this.cart.items];
// 		if (cartProductIndex >= 0) {
// 			newQuantity = this.cart.items[cartProductIndex].quantity + 1;
// 			updateCartItems[cartProductIndex].quantity = newQuantity;
// 		}
// 		else {
// 			updateCartItems.push({
// 				productId: new mongodb.ObjectId(product._id),
// 				quantity: newQuantity
// 			});
// 		}
// 		const updateCart = { items: updateCartItems };
// 		const db = getDb();
// 		return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updateCart } });
// 	}

// 	getCart() {
// 		const db = getDb();
// 		const productsIds = this.cart.items.map(i => i.productId);
// 		return db.collection('products').find({ _id: { $in: productsIds } }).toArray()
// 			.then(products => {
// 				return products.map(p => {
// 					return {
// 						...p,
// 						quantity: this.cart.items.find(i => {
// 							return i.productId.toString() === p._id.toString();
// 						}).quantity
// 					};
// 				})
// 			})
// 	}

// 	deleteCartItem(productId) {
// 		const updateCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
// 		const db = getDb();
// 		return db.collection('users')
// 			.updateOne(
// 				{ _id: new mongodb.ObjectId(this._id) },
// 				{ $set: { cart: { items: updateCartItems } } }
// 			);
// 	}

// 	addOrder() {
// 		const db = getDb();
// 		// return db.collection('orders')
// 		// 	.insertOne(this.cart)
// 		// 	.then(result => {
// 		// 		this.cart = { items: [] };
// 		// 		return db.collection('users')
// 		// 			.updateOne(
// 		// 				{ _id: new mongodb.ObjectId(this._id) },
// 		// 				{ $set: { cart: { items: [] } } });
// 		// 	})
// 		// 	.catch(err => console.log(err));
// 		return this.getCart()
// 			.then(products => {
// 				const order = {
// 					items: products,
// 					user: {
// 						_id: new mongodb.ObjectId(this._id),
// 						name: this.username
// 					}
// 				};
// 				db.collection('orders').insertOne(order);
// 			})
// 			.then(result => {
// 				this.cart = { items: [] };
// 				return db.collection('users')
// 					.updateOne(
// 						{ _id: new mongodb.ObjectId(this._id) },
// 						{ $set: { cart: { items: [] } } }
// 						);
// 			})
// 	}

// 	getOrders ()
// 	{
// 		const db = getDb();
// 		return db.collection('orders')
// 				.find({'user._id' : new mongodb.ObjectId(this._id)})
// 				.toArray();
// 	}

// }

// module.exports = User;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	cart: {
		items: [
			{
				productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
				quantity: { type: Number, required: true }
			}
		]
	}
});

UserSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.cart.items.findIndex(cp => {
		return cp.productId.toString() === product._id.toString();
	})
	let newQuantity = 1;
	const updateCartItems = [...this.cart.items];
	if (cartProductIndex >= 0) {
		newQuantity = this.cart.items[cartProductIndex].quantity + 1;
		updateCartItems[cartProductIndex].quantity = newQuantity;
	}
	else {
		updateCartItems.push({
			productId: product._id,
			quantity: newQuantity
		});
	}
	const updateCart = { items: updateCartItems };
	// const db = getDb();
	this.cart = updateCart;
	return this.save();
}

UserSchema.methods.removeFromCart = function (productId) {
	const updateCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
	this.cart.items = updateCartItems;
	return this.save();
}

UserSchema.methods.clearCart = function () {
	this.cart = { items: [] };
	return this.save();
}

module.exports = mongoose.model('User', UserSchema);