export default class {
	constructor(API = 'api') {
		this.server = window.location.href + API;
	}

	call(data, callback) {
		const API = new XMLHttpRequest();
		API.open('POST', this.server); 
		API.setRequestHeader('Content-Type', 'application/json');
		API.onload = function() {
			if (API.status === 200) {
				let json;
				try {
					json = JSON.parse(API.responseText);
				} catch (err) {
					return callback({err: 'No JSON', data: API.responseText});
				}
				return callback(json);
			} else {
				console.warn('API error: ' + API.status);
			}
		};
		API.send(JSON.stringify(data));
	}
}