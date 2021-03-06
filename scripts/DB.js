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

	Select(table, where, callback, options) { // Only use server-side code in options
		this.connection.connect();
		let query = `SELECT `;
		if (options && options.SELECT) {
			query += options.SELECT;
		} else {
			query += '*';
		}
		query += ` FROM ??`;
		if (options && options.JOIN) {
			query += options.JOIN + ' ';
		}
		if (where) {
			if (typeof where === 'function') {
				callback = where;
			} else {
				query += this._Where(where);
			}
		}
		if (options && options.ORDER) {
			query += 'ORDER BY ' + options.ORDER;
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

	Remove(table, where, callback) {
		let query = `DELETE FROM ??`;
		query += this._Where(where);
		query = mysql.format(query, [table]);
		this.connection.query(query, (error) => {
			if (error) {
				if (error.errno === 1451) {
					callback(false);
				} else {
					throw error;
				}
			} else {
				callback(true);
			}
			this.connection.end();
		}); 
	}

	// TODO: Common query method - use by other methods
	Query(query, callback) {
		this.connection.connect();
		this.connection.query(query, (error, results) => {
			if (error) throw error;
			callback(results);
			this.connection.end();
		}); 
	}

	_Where(where) {
		let query = ` WHERE `;
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
		return query;
	}

}

module.exports = DB;