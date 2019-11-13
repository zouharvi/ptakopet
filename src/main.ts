// Force HTTPS using TS
// if (location.protocol == 'http:') {
//    location.href = 'https:' + window.location.href.substring(window.location.protocol.length)
// }
// This was replaced by server-side .htaccess file

import { translator_source, translator_target } from './messages/translator'
import { SettingsSelector } from './page/settings_selector'
import { estimator } from './messages/estimator'
import { waiter } from './study/waiter'
import { logger } from './study/logger'
import { Utils } from './misc/utils'
import { Tester } from './misc/tester'

// Force files to execute
translator_source
translator_target
estimator
waiter
logger

let settings_selector: SettingsSelector = new SettingsSelector(
    $('#backend_translator'),
    $('#backend_estimator'),
    $('#backend_aligner'),
    $('#backend_tokenizer'),
    $('#language_select_source'),
    $('#language_select_target'),
    $('#warning_estimator'),
    $('#warning_aligner')
)
export { settings_selector }

$('#input_source').on('input', function () {
    translator_source.translate_throttle()
})

$('#input_target').on('input', function () {
    translator_target.translate_throttle()
    estimator.estimate_throttle()
})

// Try to do omnibox search
let params = Utils.parseGETParams()
if ('q' in params) {
    $(translator_source.source).val(params['q'].split('+').join(' '))
    $(translator_source.source).trigger('input')
}