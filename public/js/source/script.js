import UI from './UItools/UItools.js';
import API from './API.js';

{
	const api = new API('api');

	UI.renderText('Inter-view', document.body, '', '', 'h1');
	UI.render(UI.addHandler(UI.getForm('login', [
		UI.getInput('Username', 'text', 'username'),
		UI.getInput('Password', 'password', 'password')
	], '/', 'Login'), LoginHandler), document.body);

	function LoginHandler(e) {
		e.preventDefault();
		api.call({hello: 'world'}, (data) => {
			console.log(data);
		});
		console.log('login');
	}
	
}