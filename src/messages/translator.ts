import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { estimator } from './estimator'
import { IndicatorManager } from "../page/indicator_manager"
import { highlighter_source, highlighter_target } from '../page/highlighter'
import { logger } from '../study/logger'
import { paraphraser } from "./paraphraser"

export type ExtraTranslationInfo = any | undefined

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
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => {
                    if (text == '')
                        resolve(['', undefined])
                    $.ajax({
                        type: "POST",
                        url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                        headers: {
                            Accept: "application/json",
                        },
                        data: { src: lang1, tgt: lang2, input_text: text },
                    })
                        .done((data: Array<string>) => resolve([data.join(' ').replace(/\n$/, ''), undefined]))
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['cs', 'en', 'fr', 'de'], false),
            default: ['cs', 'en'],
            name: 'LINDAT Translation',
        },
        neurotolge: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => {
                    if (text == '')
                        resolve(['', undefined])
                    $.ajax({
                        type: "POST",
                        url: "https://api.neurotolge.ee/v1.1/translate",
                        headers: {
                            Accept: "application/json",
                        },
                        data: { auth: "public", conf: lang2, src: text },
                    })
                        .done((data: any) => resolve([data['tgt'], undefined]))
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['en', 'et'], false),
            default: ['en', 'et'],
            name: 'Neurotõlge',
        },
        questENET: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => {
                    if (text == '')
                        resolve(['', undefined])
                    $.ajax({
                        type: "GET",
                        url: `https://quest.ms.mff.cuni.cz/ptakopet-mt80/translate/${lang1}-${lang2}`,
                        data: { text: text },
                    })
                        .done((data: any) => resolve([data['text'], undefined]))
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['en', 'et'], false),
            default: ['en', 'et'],
            name: 'Quest EN-ET',
        },
        weakENCS: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => {
                    if (text == '')
                        resolve(['', undefined])
                    $.ajax({
                        type: "POST",
                        contentType: "application/x-www-form-urlencoded",
                        dataType: "json",
                        url: `https://quest.ms.mff.cuni.cz/ptakopet-mt280/api/v2/models/${lang1}-${lang2}_weak`,
                        data: { input_text: text },
                        crossDomain: true,
                        accepts: {
                            text: "application/json",
                        },
                    })
                        .done((result) => {
                            let text = result['data'].map((x: any) => x['sent']).join(' ')
                            resolve([text, result])
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['en', 'cs'], false),
            default: ['en', 'cs'],
            name: 'Weak EN-CS',
        },
        strongENCS: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => {
                    if (text == '')
                        resolve(['', undefined])
                    $.ajax({
                        type: "POST",
                        contentType: "application/x-www-form-urlencoded",
                        dataType: "json",
                        url: `https://quest.ms.mff.cuni.cz/ptakopet-mt280/api/v2/models/${lang1}-${lang2}`,
                        data: { input_text: text },
                        crossDomain: true,
                        accepts: {
                            text: "application/json",
                        },
                    })
                        .done((result) => {
                            let text = result['data'].map((x: any) => x['sent']).join(' ')
                            resolve([text, result])
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['en', 'cs'], false),
            default: ['en', 'cs'],
            name: 'Strong EN-CS',
        },
        avgENET: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => {
                    if (text == '')
                        resolve(['', undefined])
                    $.ajax({
                        type: "GET",
                        contentType: "application/x-www-form-urlencoded",
                        dataType: "json",
                        url: `https://quest.ms.mff.cuni.cz/ptakopet-mt380/translate/${lang1}-${lang2}`,
                        data: { text: text },
                        crossDomain: true,
                        accepts: {
                            text: "application/json",
                        },
                    })
                        .done((result) => {
                            let text = result['data'].map((x: any) => x['sent']).join(' ')
                            resolve([text, result])
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: Utils.generatePairsArray<LanguageCode>(['en', 'et'], false),
            default: ['en', 'et'],
            name: 'Avg EN-ET',
        },
        identity: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => resolve([text, undefined]))
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages, true),
            default: ['en', 'cs'],
            name: 'Identity',
        },
        none: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], text: string): Promise<[string, ExtraTranslationInfo]> {
                return new Promise<[string, ExtraTranslationInfo]>((resolve, reject) => resolve(['', undefined]))
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
    public curExtra: ExtraTranslationInfo = undefined

    public translate = () => {
        if (!this.running)
            return
        this.curSource = $(this.source).val() as string

        let request = Settings.backendTranslator.composeRequest(
            [Settings.language1, Settings.language2] as [LanguageCode, LanguageCode],
            this.curSource
        )

        request.then(([text, extra]: [string, ExtraTranslationInfo]) => {
            logger.log(logger.Action.TRANSLATE1, { text1: this.curSource, text2: text })
            this.curTranslation = text
            this.curExtra = extra

            // Clean the previous highlight
            highlighter_target.clean()

            $(this.target).val(text)
            translator_target.translate()
            estimator.estimate()
            paraphraser.paraphrase_throttle()
        })

        super.dispatch(request)
    }

    public clean = () => {
        this.curSource = ''
        this.curTranslation = ''
        $(this.source).val('')
        $(this.target).val('')
    }
}

/**
 * Class for translating target to source
 */
export class TranslatorTarget extends Translator {
    public curSource: string = ''
    public curTranslation: string = ''

    public translate = () => {
        if (!this.running) {
            return
        }
        this.curSource = $(this.source).val() as string

        let targetText = $(this.source).val() as string
        let request = Settings.backendTranslator.composeRequest(
            [Settings.language2, Settings.language1] as [LanguageCode, LanguageCode],
            this.curSource
        )
        request.then(([text, extra]: [string, ExtraTranslationInfo]) => {
            logger.log(logger.Action.TRANSLATE2, { text2: targetText, text3: text })
            this.curTranslation = text
            $(this.target).val(text)
        })

        super.dispatch(request)
    }

    public clean = () => {
        this.curSource = ''
        this.curTranslation = ''
        $(this.source).val('')
        $(this.target).val('')
    }
}

export interface TranslatorBackend {
    // Return a finished promise settings object, which can later be resolved
    composeRequest: ([lang1, lang2]: [LanguageCode, LanguageCode], text: string) => Promise<[string, ExtraTranslationInfo]>,

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