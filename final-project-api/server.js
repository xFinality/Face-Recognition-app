const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password:'test',
		database:'final-project'
	}
});

const app = express();
app.use(bodyParser.json());
app.use(cors());
/*function getUser(id) {
	let found = false;
	database.users.forEach(user => {
		if(user.id === id) {
			found = true;
			return user;
		}
	})
	return 0;
}*/

const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'joahn@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '143',
			name: 'sally',
			email: 'sally@gmail.com',
			password: 'sally',
			entries: 0,
			joined: new Date()
		}
	],
	login: [
		{
			id:'987',
			hash: '',
			email: 'joahn@gmail.com'
		}
	]
}

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {

	db.select('email', 'hash').from('login')
		.where('email','=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
			if(isValid) {
				return db.select('*').from('users')
				.where('email','=',req.body.email)
				.then(user => {
					res.json(user[0])
				})
				.catch(err => res.status(400).json('unable to find'))
			} else {
				res.status(400).json('wrong credentials')
			}
		})
		.catch(err => res.status(400).json('wrong crednetials'));
})


app.post('/register', (req,res) => {
	const {email, name, password} = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {	
			return trx('users').returning('*').insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			}).then(user => {		//user is the response from the query
				res.json(user[0]);
			}).then(trx.commit)
			.catch(trx.rollback)
		}).catch(err => res.status(400).json('unable to register'))
	})
})

app.get('/profile/:id', (req,res) => {
	const {id} = req.params;
	db.select('*').from('users').where({
		id:id
	}).then(user => {
		if(user.length) {
			res.json('user found')	
		} else {
			res.status(400).json('not found')
		}
	}).catch(err => res.status(400).json('error getting user'))
/*	if(!found) {
		res.status(400).json('not found');
	}*/
})

app.put('/image', (req,res) => {
	const {id} = req.body;
	db('users').where('id','=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to get entries'))
})

/*bcrypt.hash("bacon", null, null, function(err, hash) {

});*/

app.listen(3000, () => {
	console.log('server runner on 3000');
});

/*
/ --> res = this is working
/signin --> POST success/fail
/register --> POST  user
/profile/:userId --> GET  user
/image -->  PUT  user
*/