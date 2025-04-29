import { UIColor, UINumber, UIPanel, UIRow, UISelect, UISpan, UIText } from './libs/ui.js';

import { SidebarSettingsShortcuts } from './Sidebar.Settings.Shortcuts.js';
import { SidebarSettingsHistory } from './Sidebar.Settings.History.js';
import { UITexture } from './libs/ui.three.js';

function SidebarSettings(editor) {

	const config = editor.config;
	const strings = editor.strings;
	const scene = editor.scene;
	const signals = editor.signals;

	const container = new UISpan();

	const settings = new UIPanel();
	settings.setBorderTop('0');
	settings.setPaddingTop('20px');
	container.add(settings);

	// language

	const options = Object.fromEntries(['it','en', 'fr', 'zh', 'ja', 'ko', 'fa'].map(locale => {

		return [locale, new Intl.DisplayNames(locale, { type: 'language' }).of(locale)];

	}));

	const languageRow = new UIRow();
	const language = new UISelect().setWidth('150px');
	language.setOptions(options);

	if (config.getKey('language') !== undefined) {

		language.setValue(config.getKey('language'));

	}

	language.onChange(function () {

		const value = this.getValue();

		editor.config.setKey('language', value);

	});

	languageRow.add(new UIText(strings.getKey('sidebar/settings/language')).setClass('Label'));
	languageRow.add(language);

	settings.add(languageRow);

	// background

	const backgroundRow = new UIRow();

	const backgroundType = new UISelect().setOptions({
		'None': '',
		'Color': 'Color',
		'Texture': 'Texture',
		'Equirectangular': 'Equirect'

	}).setWidth('150px');

	backgroundType.onChange(function () {
		onBackgroundChanged();
		refreshBackgroundUI();
	});

	backgroundRow.add(new UIText(strings.getKey('sidebar/scene/background')).setClass('Label'));
	backgroundRow.add(backgroundType);

	const backgroundColor = new UIColor().setValue('#000000').setMarginLeft('8px').setHeight('revert').onInput(onBackgroundChanged);
	backgroundRow.add(backgroundColor);

	const backgroundTexture = new UITexture(editor).setMarginLeft('8px').onChange(onBackgroundChanged);
	backgroundTexture.setDisplay('none');
	backgroundRow.add(backgroundTexture);

	const backgroundEquirectangularTexture = new UITexture(editor).setMarginLeft('8px').onChange(onBackgroundChanged);
	backgroundEquirectangularTexture.setDisplay('none');
	backgroundRow.add(backgroundEquirectangularTexture);

	const backgroundColorSpaceRow = new UIRow();
	backgroundColorSpaceRow.setDisplay('none');
	backgroundColorSpaceRow.setMarginLeft('120px');

	const backgroundColorSpace = new UISelect().setOptions({

		[THREE.NoColorSpace]: 'No Color Space',
		[THREE.LinearSRGBColorSpace]: 'srgb-linear',
		[THREE.SRGBColorSpace]: 'srgb',

	}).setWidth('150px');
	backgroundColorSpace.setValue(THREE.NoColorSpace);
	backgroundColorSpace.onChange(onBackgroundChanged);
	backgroundColorSpaceRow.add(backgroundColorSpace);
	settings.add(backgroundRow);

	//container.add(backgroundRow);
	container.add(backgroundColorSpaceRow);

	const backgroundEquirectRow = new UIRow();
	backgroundEquirectRow.setDisplay('none');
	backgroundEquirectRow.setMarginLeft('120px');

	const backgroundBlurriness = new UINumber(0).setWidth('40px').setRange(0, 1).onChange(onBackgroundChanged);
	backgroundEquirectRow.add(backgroundBlurriness);

	const backgroundIntensity = new UINumber(1).setWidth('40px').setRange(0, Infinity).onChange(onBackgroundChanged);
	backgroundEquirectRow.add(backgroundIntensity);

	const backgroundRotation = new UINumber(0).setWidth('40px').setRange(- 180, 180).setStep(10).setNudge(0.1).setUnit('°').onChange(onBackgroundChanged);
	backgroundEquirectRow.add(backgroundRotation);

	container.add(backgroundEquirectRow);

	function onBackgroundChanged() {
		console.log("BackGound changed");

		const type = backgroundType.getValue();

		signals.sceneBackgroundChanged.dispatch(
			type,
			backgroundColor.getHexValue(),
			backgroundTexture.getValue(),
			backgroundEquirectangularTexture.getValue(),
			backgroundColorSpace.getValue(),
			backgroundBlurriness.getValue(),
			backgroundIntensity.getValue(),
			backgroundRotation.getValue()
		);

		
		// Applica direttamente i cambiamenti alla scena
		if (type === 'Color') {
			scene.background = new THREE.Color(backgroundColor.getHexValue());
		} else if (type === 'Texture') {
			scene.background = backgroundTexture.getValue();
			if (scene.background) {
				scene.background.colorSpace = backgroundColorSpace.getValue();
			}
		} else if (type === 'Equirectangular') {
			scene.background = backgroundEquirectangularTexture.getValue();
			if (scene.background) {
				scene.background.mapping = THREE.EquirectangularReflectionMapping;
				scene.background.colorSpace = backgroundColorSpace.getValue();
				scene.backgroundBlurriness = backgroundBlurriness.getValue();
				scene.backgroundIntensity = backgroundIntensity.getValue();
			}
		} else {
			scene.background = null;
		}

		signals.sceneGraphChanged.dispatch();
		refreshUI();
	}

	function refreshBackgroundUI() {

		const type = backgroundType.getValue();

		backgroundType.setWidth(type === 'None' ? '150px' : '110px');
		backgroundColor.setDisplay(type === 'Color' ? '' : 'none');
		backgroundTexture.setDisplay(type === 'Texture' ? '' : 'none');
		backgroundEquirectangularTexture.setDisplay(type === 'Equirectangular' ? '' : 'none');
		backgroundEquirectRow.setDisplay(type === 'Equirectangular' ? '' : 'none');

		if (type === 'Texture' || type === 'Equirectangular') {

			backgroundColorSpaceRow.setDisplay('');

		} else {

			backgroundColorSpaceRow.setDisplay('none');

		}
	}

	function refreshUI() {

		if (scene.background) {

			if (scene.background.isColor) {

				backgroundType.setValue('Color');
				backgroundColor.setHexValue(scene.background.getHex());

			} else if (scene.background.isTexture) {

				if (scene.background.mapping === THREE.EquirectangularReflectionMapping) {

					backgroundType.setValue('Equirectangular');
					backgroundEquirectangularTexture.setValue(scene.background);
					backgroundBlurriness.setValue(scene.backgroundBlurriness);
					backgroundIntensity.setValue(scene.backgroundIntensity);

				} else {

					backgroundType.setValue('Texture');
					backgroundTexture.setValue(scene.background);

				}

				backgroundColorSpace.setValue(scene.background.colorSpace);

			}

		} else {

			backgroundType.setValue('None');
			backgroundTexture.setValue(null);
			backgroundEquirectangularTexture.setValue(null);
			backgroundColorSpace.setValue(THREE.NoColorSpace);

		}
	}

	container.add(new SidebarSettingsShortcuts(editor));
	container.add(new SidebarSettingsHistory(editor));

	refreshUI();

	signals.sceneGraphChanged.add(refreshUI);

	return container;



}




export { SidebarSettings };
