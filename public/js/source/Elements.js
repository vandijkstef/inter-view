import UItools from './UItools/UItools.js';
import Audio from './Audio.js';

export default class {
	GetLogo() {
		return UItools.getImage('/img/logo.svg', 'Inter-view Logo');
	}
	
	GetIcon(icon, classes, id) {
		classes = UItools.forceArray(classes);
		classes.push('icon');
		return UItools.getImage(`/img/icons/svg/${icon}.svg`, 'TODO: Title from filename', classes, id);
	}

	GetIconSVG(icon, classes = [], id) { // TODO: GetIconSVG -> Get actual SVG data, don't wrap in image
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
		if (nav) {
			content.push(this.GetNav(nav));
		}
		content.push(this.GetMic(micEnabled, micConfigurable));
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
						this.GetRating(),
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
		// TODO: Improve time display
		return Math.floor((performance.now() - timer) / 1000);
	}

	TimerUpdater(element, timer) {
		element.innerText = this.GetTime(timer);
		setTimeout(() => {
			this.TimerUpdater(element, timer);
		}, 1000);
	}

	GetRating() {
		const stars = [];
		for (let i = 1; i < 6; i++) {
			const starIcon = UItools.addHandler(
				UItools.getInput(UItools.wrap(this.GetIconSVG('071-star'), '', '', 'label'), 'radio', 'rating', i, '', 'hide'),
				window.UI.handlers.SetRating
			);
			starIcon.dataset.value = i;
			stars.push(starIcon);
		}
		return UItools.wrap(
			stars,
			'rating'
		);
	}

	GetNav(nav) {
		return UItools.wrap(UItools.addHandler(UItools.getText(nav), window.UI.handlers.SwitchResults), ['small', 'transparent'], '', 'button');
	}

	GetMic(enabled, configurable = true) {
		const mic = this.GetIconSVG('021-microphone', 'mic');
		window.UI.micWrap = UItools.addHandler(UItools.wrap(mic, ['small', 'transparent'], '', 'button'), window.UI.AddAudioModal);
		window.UI.micWrap.mic = mic;
		window.UI.micWrap.audio = new Audio();
		window.UI.micWrap.audio.HasPermission((permission) => {
			window.UI.micWrap.permission = permission;
			if (!permission) {
				mic.classList.add('error');
			}
			if (!configurable) {
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
		console.log(respondent);
		return UItools.wrap(
			[
				this.GetResultEntry(respondent)
			],
			'entry'
		);
	}

	GetResultEntry(respondent) {
		// This should show individual answers
		return UItools.wrap(
			[
				UItools.getText(respondent.pseudo),
				UItools.getText(respondent.id)
			]
		);
	}
}