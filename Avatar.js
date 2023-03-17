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

	static async save_typing_session(wpm, accuracy, avatar_id){
		let client;
		try {
			client = await pool.connect();
			const result = await client.query(
				'INSERT INTO typing_session (wpm, accuracy, avatar_id) VALUES ($1, $2, $3) RETURNING session_id',
				[wpm, accuracy, avatar_id]
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

	// to update avg_wpm and avg_accuracy in avatar after each typing session
	static async update_avg_stats(avatar_id){
		let client;
		try {
			client = await pool.connect();
			const result = await client.query(
				"UPDATE avatar SET avg_wpm = (SELECT AVG(wpm) FROM typing_session WHERE avatar_id = $1), avg_accuracy = (SELECT AVG(accuracy) FROM typing_session WHERE avatar_id = $1) WHERE avatar_id = $1",
				[avatar_id]
			);
			return result.rows;
		} 
		catch(e){
			console.log(e.message)
		}
		finally {
			client.release();
		}
	}

	// to plot wpm and accuracy
	static async plot_stats(avatar_id){
		let client;
		try {
			client = await pool.connect();
			const result = await client.query(
				"SELECT wpm, accuracy, session_date FROM typing_session WHERE avatar_id = $1 ORDER BY session_date",
				[avatar_id]
			);
			// return result.rows;
			const wpmData = {
				x: result.rows.map(row => row.session_date),
				y: result.rows.map(row => row.wpm),
				type: 'scatter',
				name: 'WPM'
			};

			const accuracyData = {
				x: result.rows.map(row => row.session_date),
				y: result.rows.map(row => row.accuracy),
				type: 'scatter',
				name: 'Accuracy'
			};

			const layout = {
				title: `Typing Session for Avatar ${avatar_id}`,
				xaxis: {
					title: 'Session Date'
				},
				yaxis: {
					title: 'Value'
				}
			};
			console.log(wpmData);
			console.log(accuracyData);
			const plotData = [wpmData, accuracyData];
			console.log(plotData);
			console.log(layout);
			return {plotData, layout};
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
