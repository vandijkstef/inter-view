export default class {
	Keyboard(e) {
		console.log(e);
		// Determine app state
		const interview = document.querySelector('form[name=interview]');
		if (interview) {
			switch (e.key) {
			case 'ArrowRight':
				console.log('next');
				break;
			case '1':
				console.log(1);
			}
		}
		// Act where applicable
	}
}