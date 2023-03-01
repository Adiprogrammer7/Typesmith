const { Pool } = require('pg');
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'mydatabase',
	password: 'Hack1137@postgres',
	port: 5432,
});

class Avatar {
	constructor(userId, username, character) {
		this.userId = userId;
		this.username = username;
		this.character = character;
	}

	// Save the avatar to the database
	async save() {
		// Insert query to save the avatar to the database
		let client;
		try {
			client = await pool.connect();
			const result = await client.query(
				'INSERT INTO avatar (user_id, username, avatar_character) VALUES ($1, $2, $3) RETURNING avatar_id',
				[this.userId, this.username, this.character]
			);
			console.log(result.rows[0]);
		} 
		catch(e){
			console.log(e.message)
		}
		finally {
			client.release();
		}
	}

	static async alreadyExists(userId){
		let client;
		try {
			client = await pool.connect();
			const result = await client.query(
				'SELECT * FROM avatar WHERE user_id = $1',
				[userId]
			);
			return result.rows[0];
		} 
		catch(e){
			console.log(e.message)
		}
		finally {
			client.release();
		}
	}
}

module.exports = Avatar;
