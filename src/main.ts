import {Translator, TranslatorSource} from './translator'
import { IndicatorManager } from './indicator_manager';

let translator_source : Translator = new TranslatorSource()
let indicator_translator : IndicatorManager = new IndicatorManager($('#indicator_translator'))
translator_source.addIndicator(indicator_translator)



let input_source = $('#input_source')
let input_target = $('#input_target')
let input_back = $('#input_back')
let select_source = $('#language_select_source')
let select_target = $('#language_select_target')

input_source.on('input', function() {
    translator_source.translate_throttle()
})

input_target.on('input', function() {
    // translator_target.translate_throttle()
})

// $('#main_content').html('<span>hello</span>' + $('#main_content').html())