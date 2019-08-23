// Force HTTPS using TS
// if (location.protocol == 'http:') {
//    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
// }
// This was replaced by server-side .htaccess file

import { translator_source, translator_target } from './messages/translator'
import { SettingsSelector } from './page/settings_selector'
import { estimator } from './messages/estimator'
import { Waiter } from './study/waiter'

let lang_selector: SettingsSelector = new SettingsSelector(
    $('#backend_translator'),
    $('#backend_estimator'),
    $('#backend_aligner'),
    $('#language_select_source'),
    $('#language_select_target'),
    $('#warning_estimator'),
    $('#warning_aligner'))

$('#input_source').on('input', function () {
    translator_source.translate_throttle()
})

$('#input_target').on('input', function () {
    translator_target.translate_throttle()
    estimator.estimate_throttle()
})

let waiter = new Waiter(
    $('#study_text'),
    $('#study_ok_button'),
    $('#study_skip_button'),
    $('#join_study_button'),
    $('#study_content_block'),
)
