// Force HTTPS
if (location.protocol == 'http:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

import { translator_source, translator_target } from './translator'
import { indicator_translator } from './indicator_manager'
import { SettingsSelector } from './settings_selector'

translator_source.addIndicator(indicator_translator)
let lang_selector: SettingsSelector = new SettingsSelector(
    translator_source,
    translator_target,
    $('#translator_backend'),
    $('#estimator_backend'),
    $('#language_select_source'),
    $('#language_select_target'))

$('#input_source').on('input', function () {
    translator_source.translate_throttle()
})

$('#input_target').on('input', function () {
    translator_target.translate_throttle()
})