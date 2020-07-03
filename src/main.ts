// Force HTTPS using TS
// if (location.protocol == 'http:') {
//    location.href = 'https:' + window.location.href.substring(window.location.protocol.length)
// }
// This was replaced by server-side .htaccess file

import { translator_source, translator_target } from './messages/translator'
import { paraphraser } from './messages/paraphraser'
import { estimator } from './messages/estimator'
import { SettingsSelector } from './page/settings_selector'
import { SettingsProfiles } from './misc/settings_profiles'
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
    $('#backend_paraphraser'),
    $('#backend_aligner'),
    $('#backend_tokenizer'),
    $('#language_select_source'),
    $('#language_select_target'),
    $('#warning_estimator'),
    $('#warning_aligner'),
    $('#warning_paraphraser'),
)
SettingsProfiles.setSettingsTag('default')
export { settings_selector }


$('#input_source').on('input', function () {
    estimator.clear()
    translator_target.clear()
    translator_source.translate_throttle()
    paraphraser.paraphrase_throttle()
})

$('#input_target').on('input', function () {
    translator_target.translate_throttle()
    estimator.estimate_throttle()
})


let params = Utils.parseGETParams()

// Store response ID if applicable
if ('responseID' in params) {
    waiter.responseID = params['responseID']
}
// Store source ID if applicable
if ('source' in params) {
    waiter.sourceID = params['source']

    // Special statmt/Qualtrics handling
    if (params['source'] == 'statmt') {
        $('#read_instructions').show()
        $('#read_instructions_button_head').show()
        $('#read_instructions_close').click(() => $('#read_instructions').hide())
    }
}

if ('test' in params) {
    let action = params['test']
    if (action == 'workload') {
        Tester.workload()
    } else if (action == 'services') {
        Tester.services()
    }
}

// Log init
logger.log(logger.Action.START,
    {
        queue: 'public',
        agent: navigator.userAgent,
    }
)

// Try to do omnibox search on default settings
if ('q' in params) {
    $(translator_source.source).val(params['q'].split('+').join(' '))
    $(translator_source.source).trigger('input')
}

// Try to set the settings according to the parameter
if ('p' in params) {
    let profile = params['p']
    if (profile in SettingsProfiles.profiles) {
        SettingsProfiles.setSettingsTag(profile)
    }
}

// Apply userID if possible
if ('userID' in params) {
    let userID = params['userID']
    waiter.joinStudy(userID)
}

// Burger menu

$("body > *").not("body > #burger_main_side").click((event: JQuery.ClickEvent<HTMLElement, null, HTMLElement>) => {
    if (event.target.id == 'burger_show_arrow')
        return
    $('#burger_main_side').hide()
})

$('#burger_show_arrow').click(() => {
    $('#burger_main_side').show()
})

$('#burger_back_arrow').click(() => {
    $('#burger_main_side').hide()
})