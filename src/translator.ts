import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode, Utils } from "./utils"
import { Settings } from './settings'


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
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    // Object of available backends and their implementations
    public static backends: { [index: string]: TranslatorBackend } = {
        ufalTransformer: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): JQuery.AjaxSettings {
                return {
                    type: "POST",
                    url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                    data: { src: sourceLang, tgt: targetLang, input_text: text },
                    async: true,
                }
            },
            sanitizeData(data: any): string {
                return data.replace(/\n$/, "")
            },
            languages: Utils.generatePairs<LanguageCode>(['cs', 'en', 'fr', 'hi'], true),
            default: ['cs', 'en'],
            name: 'ÚFAL Transformer',
        },

        identity: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): JQuery.AjaxSettings {
                return {
                    type: "identity",
                    data: text,
                }
            },
            sanitizeData(data: any): string {
                return data.replace(/\n$/, "")
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
        let request = Settings.backend.composeRequest(
            $(this.source).val() as string,
            Settings.language1 as LanguageCode,
            Settings.language2 as LanguageCode)
        super.dispatch(
            request,
            (data) => {
                let text = Settings.backend.sanitizeData(data)
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
        let request = Settings.backend.composeRequest(
            $(this.source).val() as string,
            Settings.language2 as LanguageCode,
            Settings.language1 as LanguageCode)
        super.dispatch(
            request,
            (data) => {
                let text = Settings.backend.sanitizeData(data)
                $(this.target).text(text)
            }
        )
    }
}

export interface TranslatorBackend {
    // Return a finished ajax settings object, which can later be used for proper request
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => JQuery.AjaxSettings,
    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,
    // Default language pair
    default: [LanguageCode, LanguageCode],
    // Sanitizes incomming request data
    sanitizeData(data: any): string,
    // Proper backend name (not key)
    name: string,
}

var translator_source: Translator = new TranslatorSource($('#input_source'), $('#input_target'))
var translator_target: Translator = new TranslatorTarget($('#input_target'), $('#input_back'))
export { translator_source, translator_target }