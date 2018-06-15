const mysql = require('mysql');

class DB {
	constructor() {
		this.connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DB
		});
	}

	Select(table, where, callback) {
		this.connection.connect();
		// if (typeof columns === 'function') {
		// 	callback = columns;
		// 	columns = '*';
		// }
		let query = `SELECT * FROM ??`;
		if (where) {
			if (typeof where === 'function') {
				callback = where;
			} else {
				query += ` WHERE `;
				if (typeof where === 'object') {
					let string = '';
					let first = true;
					for (const col in where) {
						if (first) {
							first = false;
						} else {
							string += 'AND ';
						}
						const key = mysql.escapeId(col);
						const value = mysql.escape(where[col]);
						string += `${key}=${value}`;
						string += ' ';
					}
					where = string;
					query += string;
				}
			}
		}
		query = mysql.format(query, [table, where]);
		this.connection.query(query, (error, results) => {
			if (error) throw error;
			callback(results);
			this.connection.end();
		});  
	}

	Insert(table, data, callback) {
		if (this.connection.state === 'disconnected') {
			this.connection.connect();
		}

		let query = `INSERT INTO ?? `;
		
		let cols = '(';
		let values = '(';
		for (const col in data) {
			cols += mysql.escapeId(col) + ',';
			values += mysql.escape(data[col]) + ',';
		}
		cols += mysql.escapeId('lastSaved');
		values += 'NOW()';
		cols += ')';
		values += ')';
	
		query += `${cols} VALUES ${values}`;

		query = mysql.format(query, [table]);
		this.connection.query(query, (error, results) => {
			if (error) throw error;
			callback(results.insertId);
			this.connection.end();
		});  
	}

	Update(table, data, callback) {
		if (!data.id) {
			return callback(false);
		}

		if (this.connection.state === 'disconnected') {
			this.connection.connect();
		}

		let query = `UPDATE ?? SET `;
		
		for (const col in data) {
			if (col != 'id') {
				query += mysql.escapeId(col) + ' = ' + mysql.escape(data[col]) + ', ';
			}
		}
		query += mysql.escapeId('lastSaved') + ' = ' + 'NOW() ';
		query += 'WHERE id = ' + mysql.escape(data.id);

		query = mysql.format(query, [table]);
		this.connection.query(query, (error, results) => {
			if (error) throw error;
			callback(results);
			this.connection.end();
		});  
	}
}

module.exports = DB;