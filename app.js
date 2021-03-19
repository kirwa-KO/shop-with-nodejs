const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById('6054ad0d6d87e63e97d2406b')
		.then(user => {
			req.user = user;
			next();
		})
		.catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// mongoConnect(() => {
// 	app.listen(3000, _ => console.log('Running in port 3000..!!!'));
// });

mongoose.connect('mongodb+srv://proton:kirwa-KO@cluster0.buffm.mongodb.net/shop?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true })
	.then(_ => {
		User.findOne()
			.then(user => {
				if (!user) {
					const user = new User({
						username: 'kirwa-KO',
						email: 'kirwa@gmail.com',
						cart: {
							items: []
						}
					});
					user.save();
				}
			});
			app.listen(3000, _ => console.log('Running in port 3000..!!!'));
	})
	.catch(err => console.log(err));
