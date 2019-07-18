import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { estimator, Estimator } from './estimator'
import { IndicatorManager } from "../page/indicator_manager";

/**
 * Template for forward and backward translators
 */
export abstract class Translator extends AsyncMessage {
    private throttler = new Throttler(500);

    /**
     * Make a translator request, which can be later interrupted. 
     */
    public translate_throttle() {
        this.throttler.throttle(this.translate)
    }

    /**
     * @param source Source textarea
     * @param target Target textarea
     */
    constructor(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>) {
        super()
        this.source = source
        this.target = target
    }

    public abstract translate(): void
    // Target HTML elements or something with `val` function
    public source: JQuery<HTMLElement> | { val(_: string): void }
    public target: JQuery<HTMLElement> | { val(_: string): void }

    // Object of available backends and their implementations
    public static backends: { [index: string]: TranslatorBackend } = {
        ufalTransformer: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
                return new Promise<string>((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                        data: { src: sourceLang, tgt: targetLang, input_text: text },
                        async: true,
                    })
                        .done((data: string) => resolve(data.replace(/\n$/, "")))
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairs<LanguageCode>(['cs', 'en', 'fr', 'hi'], true),
            default: ['cs', 'en'],
            name: 'ÚFAL Transformer',
        },

        identity: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
                return new Promise<string>((resolve, reject) => resolve(text))
            },
            languages: Utils.generatePairs<LanguageCode>(['cs', 'en', 'fr', 'hi', 'de', 'pl'], true),
            default: ['cs', 'en'],
            name: 'Identity',
        }
    }
}

/**
 * Class for translating source to target
 */
export class TranslatorSource extends Translator {
    public translate = () => {
        let request = Settings.backendTranslator.composeRequest(
            $(this.source).val() as string,
            Settings.language1 as LanguageCode,
            Settings.language2 as LanguageCode)
        super.dispatch(
            request,
            (text: string) => {
                $(this.target).text(text)
                translator_target.translate()
            }
        )
    }
}

/**
 * Class for translating target to source
 */
export class TranslatorTarget extends Translator {
    public translate = () => {
        let request = Settings.backendTranslator.composeRequest(
            $(this.source).val() as string,
            Settings.language2 as LanguageCode,
            Settings.language1 as LanguageCode)
        super.dispatch(
            request,
            (text) => {
                $(this.target).text(text)
                estimator.estimate()
            }
        )
    }
}

export interface TranslatorBackend {
    // Return a finished promise settings object, which can later be resolved
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<string>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Default language pair
    default: [LanguageCode, LanguageCode],

    // Proper backend name (not key)
    name: string,
}

let translator_source: Translator = new TranslatorSource($('#input_source'), $('#input_target'))
let translator_target: Translator = new TranslatorTarget($('#input_target'), $('#input_back'))

let indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_translator'))
translator_source.addIndicator(indicator_translator)
translator_target.addIndicator(indicator_translator)

export { translator_source, translator_target, indicator_translator }