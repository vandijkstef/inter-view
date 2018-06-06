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

	Select(table, where, columns = '*', callback) {
		this.connection.connect();
		if (typeof columns === 'function') {
			callback = columns;
			columns = '*';
		}
		let query = `SELECT ? FROM ??`;
		if (where) {
			if (typeof where === 'function') {
				callback = where;
			} else {
				query += ` WHERE ??`;
				// TODO: Expand where object into a safe queryString
			}
		}
		query = mysql.format(query, [columns, table, where]);
		console.log(query);
		this.connection.query(query, (error, results) => { // TODO: Formatting of SQL string
			if (error) throw error;
			callback(results);
			this.connection.end();
		});  
	}
}

module.exports = DB;