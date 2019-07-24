// Force HTTPS
if (location.protocol == 'http:') {
   location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

import { translator_source, translator_target } from './messages/translator'
import { highlighter_source } from './page/highlighter'
import { SettingsSelector } from './page/settings_selector'

let lang_selector: SettingsSelector = new SettingsSelector(
    $('#backend_translator'),
    $('#backend_estimator'),
    $('#backend_aligner'),
    $('#language_select_source'),
    $('#language_select_target'))

$('#input_source').on('input', function () {
    translator_source.translate_throttle()
    // Clean the previous highlight
    highlighter_source.highlight([])
})

$('#input_target').on('input', function () {
    translator_target.translate_throttle()
})
