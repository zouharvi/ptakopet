// Force HTTPS
if (location.protocol == 'http:') {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

import { translator_source, translator_target } from './messages/translator'
import { IndicatorManager } from './page/indicator_manager'
import { SettingsSelector } from './page/settings_selector'

var indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_translator'))
translator_source.addIndicator(indicator_translator)

var lang_selector: SettingsSelector = new SettingsSelector(
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