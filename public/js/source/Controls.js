export default class {
	Keyboard(e) {
		// console.log(e.key);
		// Determine app state
		const interview = document.querySelector('form[name=interview]');
		if (interview) {
			switch (e.key) {
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
				window.UI.handlers.SetRating(null, null, e.key);
				document.querySelectorAll('input[type=radio]')[e.key - 1].checked = true;
				break;
			case 'ArrowRight':
				interview.querySelector('button').click();
				break;
			}
		} else {
			switch (e.key) {
			case 'Enter':
				document.activeElement.click();
				break;
			}
		}
		// Act where applicable
	}
}