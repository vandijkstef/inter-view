import UItools from './UItools/UItools.js';
import Audio from './Audio.js';

export default class {
	GetLogo() {
		return UItools.getImage('/img/logo.svg', 'Inter-view Logo');
	}
	
	// GetIcon(icon, classes, id) {
	// 	classes = UItools.forceArray(classes);
	// 	classes.push('icon');
	// 	const title = icon.split('-')[1];
	// 	return UItools.getImage(`/img/icons/svg/${icon}.svg`, title, classes, id);
	// }

	GetIconSVG(icon, classes = [], id) {
		classes = UItools.forceArray(classes);
		classes.push('icon');
		const title = icon.split('-')[1];
		classes.push(title);
		return UItools.getSVG(`/img/icons/svg/${icon}.svg`, title, classes, id);
	}

	GetHeader(title, nav, micEnabled, micConfigurable) {
		window.UI.SetTitle(title);
		const content = [];
		content.push(this.GetLogo());
		content.push(UItools.getText(title, '', '', 'h1'));
		if (nav && !window.offline) {
			content.push(this.GetNav(nav));
		}
		if (micConfigurable !== 'disabled') {
			content.push(this.GetMic(micEnabled, micConfigurable));
		}
		return UItools.wrap(
			content,
			'', '', 'header' 
		);
	}

	GetInterviewHeader() {
		const progress = UItools.createElement('progress', '', 'progress');
		progress.setAttribute('max', 100);
		progress.value = (window.UI.script.currentQuestion / window.UI.script.questions.length) * 100;
		const questionTimer = UItools.getText(this.GetTime(window.timers.question));
		const scriptTimer = UItools.getText(this.GetTime(window.timers.script));
		this.TimerUpdater(questionTimer, window.timers.question);
		this.TimerUpdater(scriptTimer, window.timers.script);
		return UItools.wrap(
			[
				progress,
				UItools.wrap(
					[
						this.GetLogo(),
						UItools.wrap(
							[
								UItools.wrap(
									[
										questionTimer,
										scriptTimer
									]
								),
								this.GetMic(true, false)
							]
						)
					]
				)
			],
			'interview', '', 'header'
		);
	}

	GetTime(timer) {
		const time = Math.floor((performance.now() - timer) / 1000);

		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time - (hours * 3600)) / 60);
		let seconds = time - (hours * 3600) - (minutes * 60);
		seconds = Math.round(seconds * 100) / 100;

		let result = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds  < 10 ? '0' + seconds : seconds);

		return result;
	}

	TimerUpdater(element, timer) {
		element.innerText = this.GetTime(timer);
		setTimeout(() => {
			this.TimerUpdater(element, timer);
		}, 1000);
	}

	GetRating(questionID, value, nonInteractable) {
		const stars = [];
		if (value === undefined) {
			value = false;
		}
		for (let i = 1; i < 6; i++) {

			let starIcon = UItools.getInput(UItools.wrap(this.GetIconSVG('071-star'), '', '', 'label'), 'radio', 'rating_' + questionID, i, '', 'hide');
			if (nonInteractable) {
				starIcon.querySelector('input').disabled = true;
				starIcon.classList.add('disabled');
			} else {
				starIcon = UItools.addHandler(
					starIcon,
					window.UI.handlers.SetRating
				);
			}
			starIcon.dataset.value = i;
			if (i === parseInt(value)) {
				starIcon.querySelector('input').checked = true;
			}
			stars.push(starIcon);
		}
		
		window.UI.handlers.SetRating(null, stars, value);
		return UItools.wrap(
			stars,
			'rating'
		);
	}

	GetNav(nav) {
		return UItools.getButton(nav, ['small', 'transparent'], '', window.UI.handlers.SwitchResults);
	}

	GetMic(enabled, configurable = true) {
		let mic;
		if (configurable) {
			mic = this.GetIconSVG('040-settings-1', 'mic');
		} else {
			mic = this.GetIconSVG('021-microphone', 'mic');
		}
		window.UI.micWrap = UItools.addHandler(UItools.wrap(mic, ['small', 'transparent'], '', 'button'), window.UI.AddAudioModal);
		window.UI.micWrap.mic = mic;
		window.UI.micWrap.audio = new Audio();
		window.UI.micWrap.audio.HasPermission((permission) => {
			window.UI.micWrap.permission = permission;
			if (!permission) {
				mic.classList.add('error');
			}
			if (!configurable) {
				window.UI.micWrap.disabled = true;
				mic.classList.add('disabled');
			}
		});
		return window.UI.micWrap;
	}
	
	GetScrollWindow(content, id) {
		return UItools.wrap(content, 'scrollwindow', id);
	}

	GetLoader() {
		return UItools.createElement('loading');
	}

	GetResult(respondent) {
		// This should show an interview/respondent
		return UItools.wrap(
			[
				this.GetResultEntry(respondent)
			],
			['entry', 'animated', 'fadeIn']
		);
	}

	GetResultEntry(respondent) {
		// This should show individual answers
		const content = [
			UItools.getText(respondent.pseudo, '', '', 'h2')
		];
		if (respondent.notes) {
			content.push(UItools.getText('Notes: ' + respondent.notes));
		}
		return UItools.wrap(
			content
		);
	}

	GetPostInterviewAnswer(answer, i) {
		return UItools.wrap(
			[
				UItools.getText(i + 1, 'number'),
				UItools.getText(answer.question, 'question'),
				this.GetRating(answer.id, answer.rating),
				UItools.getInput('', 'hidden', 'questionID', answer.id),
				UItools.getInput(UItools.getLabel('Notes'), 'textarea', 'notes')
			],
			['postentry', 'answer']
		);
	}

	GetSummary() {
		return UItools.wrap(
			[
				UItools.getInput(UItools.getLabel('Summary'), 'textarea', 'summary', '', 'General notes on this interview')
			],
			['postentry', 'summary']
		);
	}

	EntryControls(isMeta, meta, dontHide) {
		const content = [];
		if (isMeta) {
			const select = UItools.getSelect('type', [
				{
					value: 'text',
					label: 'Text'
				},
				{
					value: 'email',
					label: 'E-mail'
				},
				{
					value: 'phone',
					label: 'Phone number'
				},
				{
					value: 'checkbox',
					label: 'Yes/No'
				}
			]);
			select.value = meta.type;
			select.dataset.id = meta.id;
			UItools.addHandler(select, window.UI.handlers.MetaTypeUpdate, 'change');
			content.push(select);
		}
		content.push(UItools.getButton(this.GetIconSVG('008-back'), ['small', 'transparent'], '', window.UI.OrderDown));
		content.push(UItools.getButton(this.GetIconSVG('014-next'), ['small', 'transparent'], '', window.UI.OrderUp));
		content.push(UItools.getButton(this.GetIconSVG('031-trash'), ['small', 'transparent'], '', window.UI.RemoveEntry));
		const classes = ['flex', 'controls', 'animated', 'fadeIn'];
		if (!dontHide) {
			classes.push('hidden')
		}
		return UItools.wrap( 
			content,
			classes
		);
	}
}