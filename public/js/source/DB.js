import API from './API.js';

export default class {
	constructor(dbname, dbuser, dbpass, dbport = 3306) {
		this.dbname = dbname;
		this.user = dbuser;
		this.pass = dbpass;
		this.port = dbport;
		this.api = new API('db');
	}
}