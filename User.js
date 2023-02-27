const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'mydatabase',
	password: 'Hack1137@postgres',
	port: 5432,
});

class User {
	constructor(email, password, id=null) {
		this.email = email;
		this.password = password;
		this.id = id;
	}

	async save() {
		const hashedPassword = await bcrypt.hash(this.password, 10);
		console.log(hashedPassword);
		console.log(hashedPassword.length);
		const client = await pool.connect();
		try {
			const result = await client.query(
				'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
				[this.email, hashedPassword]
			);
			this.id = result.rows[0].id;
		} 
		catch(e){
			console.log(e.message)
		}
		finally {
			client.release();
		}
	}

	static async findByEmail(email) {
		const client = await pool.connect();
		try {
			const result = await client.query('SELECT * FROM users WHERE email=$1', [email]);
			if(result.rows[0]){
				const user = new User(result.rows[0].email, result.rows[0].password, result.rows[0].id);
				return user;
			}
			else{
				console.log("no email found!");
			}
		} finally {
			client.release();
		}
	}

	async comparePassword(password) {
		return await bcrypt.compare(password, this.password);
	}
}

module.exports = User;
