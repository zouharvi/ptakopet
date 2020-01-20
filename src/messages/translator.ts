import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { estimator } from './estimator'
import { IndicatorManager } from "../page/indicator_manager"
import { highlighter_source, highlighter_target } from '../page/highlighter'
import { logger } from '../study/logger'

/**
 * Template for forward and backward translators
 */
export abstract class Translator extends AsyncMessage {
    private throttler = new Throttler(500)

    /**
     * Make a translator request, which can be later interrupted. 
     */
    public translate_throttle() {
        this.throttler.throttle(this.translate)

        // Clean the previous highlight
        highlighter_source.clean()
        highlighter_target.clean()
    }

    /**
     * @param source Source textareat
     * @param target Target textarea
     */
    constructor(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>, indicator: IndicatorManager) {
        super(indicator)
        this.source = source
        this.target = target
    }

    public abstract translate(): void

    // Target HTML elements
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    protected running: boolean = true
    public on(running: boolean = true) {
        this.running = running
    }

    // Object of available backends and their implementations
    public static backends: { [index: string]: TranslatorBackend } = {
        ufalTransformer: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
                return new Promise<string>((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                        headers: {
                            Accept: "application/json",
                        },
                        data: { src: sourceLang, tgt: targetLang, input_text: text },
                        async: true,
                    })
                        .done((data: Array<string>) => resolve(data.join('').replace(/\n$/, '')))
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['cs', 'en', 'fr', 'de'], false),
            default: ['cs', 'en'],
            name: 'ÚFAL Transformer',
        },

        identity: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
                return new Promise<string>((resolve, reject) => resolve(text))
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages, true),
            default: ['en', 'cs'],
            name: 'Identity',
        },

        none: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
                return new Promise<string>((resolve, reject) => resolve(''))
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages, true),
            default: ['en', 'cs'],
            name: 'None/Manual',
        },
    }
}

/**
 * Class for translating source to target
 */
export class TranslatorSource extends Translator {
    public curSource: string = ''
    public curTranslation: string = ''
    public translate = () => {
        if (!this.running)
            return
        this.curSource = $(this.source).val() as string

        let request = Settings.backendTranslator.composeRequest(
            this.curSource,
            Settings.language1 as LanguageCode,
            Settings.language2 as LanguageCode)

        super.dispatch(
            request,
            (text: string) => {
                logger.log(logger.Action.TRANSLATE1, { text1: this.curSource, text2: text })
                this.curTranslation = text

                // Clean the previous highlight
                highlighter_target.clean()

                $(this.target).val(text)
                translator_target.translate()
                estimator.estimate()
            }
        )
    }
}

/**
 * Class for translating target to source
 */
export class TranslatorTarget extends Translator {
    public translate = () => {
        if (!this.running) {
            return
        }
        let targetText = $(this.source).val() as string
        let request = Settings.backendTranslator.composeRequest(
            $(this.source).val() as string,
            Settings.language2 as LanguageCode,
            Settings.language1 as LanguageCode)
        super.dispatch(
            request,
            (text) => {
                logger.log(logger.Action.TRANSLATE2, { text1: targetText, text2: text })
                $(this.target).val(text)
            }
        )
    }
}

export interface TranslatorBackend {
    // Return a finished promise settings object, which can later be resolved
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<string>,

    // Array of available languages to this backend
    languages: Set<[LanguageCode, LanguageCode]>,

    // Default language pair
    default: [LanguageCode, LanguageCode],

    // Proper backend name (not key)
    name: string,
}

let indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_translator'))
let translator_source: TranslatorSource = new TranslatorSource($('#input_source'), $('#input_target'), indicator_translator)
let translator_target: TranslatorTarget = new TranslatorTarget($('#input_target'), $('#input_back'), indicator_translator)

// export translation singletons
export { translator_source, translator_target, indicator_translator }