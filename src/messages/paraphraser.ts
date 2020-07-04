import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings, RequestHashOne } from '../misc/settings'
import { highlighter_target } from '../page/highlighter'
import { IndicatorManager } from "../page/indicator_manager"
import { aligner } from "./aligner"
import { Throttler } from "./throttler"
import { logger } from '../study/logger'
import { tokenizer } from './tokenizer'
import { TextUtils } from "../misc/text_utils"

export type Paraphrase = { [key in LanguageCode]?: string }
export type ParaphraseResponse = { 'status': string, 'error'?: string } & Paraphrase

export class Paraphraser extends AsyncMessage {
    private throttler = new Throttler(2500)

    /**
     * Make a paraphraser request, which can be later interrupted. 
     */
    public paraphrase_throttle() {
        this.throttler.throttle(this.paraphrase)
    }

    public clean() {
        this.paraphraserElement.html('<div></div>')
        this.cancel()
    }

    /**
     * Make an paraphraser request
     */
    paraphrase = () => {
        if (!this.running) {
            return
        }

        let hash = new RequestHashOne(this)

        if (hash.text == '') {
            $(this.paraphraserElement).html("")
            return
        }

        // Check whether the backend supports this language pair
        if (!Settings.backendParaphraser.languages.has(Settings.language1 as LanguageCode)) {
            // The paraphraser does not support this language pair, skipping
            console.warn("The paraphraser does not support this language pair, skipping")
            return
        }

        let request = Settings.backendParaphraser.composeRequest(
            Settings.language1 as LanguageCode,
            hash.text)

        super.dispatch(request, async (paraphrase: Paraphrase) => {
            $(this.paraphraserElement).empty()
            let toDisplay: Array<string> = []

            // Skip if source is obsolete
            if (!hash.valid()) {
                return
            }

            for (let lang of Object.keys(paraphrase)) {
                let data: string = paraphrase[lang as LanguageCode] as string

                // skip if equal to the currently displayed source
                if (TextUtils.vagueEqual(data, hash.text)) {
                    continue;
                }

                let ok: boolean = true
                for (let other of toDisplay) {
                    if (TextUtils.vagueEqual(other, data)) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    toDisplay.push(data)
                }
            }
            logger.log(logger.Action.PARAPHRASE, { paraphrase: toDisplay.join('|') })

            for (let data of toDisplay) {
                $(this.paraphraserElement).append("<div>" + data + "</div>")
            }
            if (toDisplay.length == 0) {
                $(this.paraphraserElement).append("<div style='font-style: italic'>None available.</div>")
            }
        })
    }

    /**
     * @param source Source textarea
     * @param target Target textarea
     */
    constructor(
        public source: JQuery<HTMLElement>,
        private paraphraserElement: JQuery<HTMLElement>,
        indicator: IndicatorManager) {
        super(indicator)
    }

    private running: boolean = true
    public on(running: boolean = true) {
        this.running = running
    }

    // Object of available backends and their implementations
    public static backends: { [index: string]: ParaphraserBackend } = {
        mock: {
            composeRequest(lang: LanguageCode, text: string): Promise<Paraphrase> {
                return new Promise<Paraphrase>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/paraphrase/mock",
                        data: { lang: lang, text: text.replace(/\n/, " ") },
                        async: true,
                    })
                        .done((data: ParaphraseResponse) => {
                            if (data['status'] == 'OK') {
                                delete data['status']
                                resolve(data)
                            } else {
                                console.warn(data['error'])
                                reject(data['error'] as string)
                            }
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: new Set(['cs', 'en', 'de']),
            name: 'LINDAT Mock',
        },

        rainbow: {
            composeRequest(lang: LanguageCode, text: string): Promise<Paraphrase> {
                return new Promise<Paraphrase>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/paraf/translate",
                        data: { lang: lang, text: text.replace(/\n/, " ") },
                        async: true,
                    })
                        .done((data: ParaphraseResponse) => {
                            resolve(data)
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: new Set<LanguageCode>(['de', 'en', 'es', 'hu', 'lt', 'ru']),
            name: 'Rainbow',
        },
        none: {
            composeRequest(language: LanguageCode, text: string): Promise<Paraphrase> {
                return new Promise<Paraphrase>((resolve, reject) => {
                    resolve({})
                })
            },
            languages: Utils.Languages,
            name: 'None',
        },
    }
}

export interface ParaphraserBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (lang: LanguageCode, text: string) => Promise<Paraphrase>,

    // Array of available languages to this backend
    languages: Set<LanguageCode>,

    // Proper backend name (not key)
    name: string,
}

let indicator_paraphraser: IndicatorManager = new IndicatorManager($('#indicator_paraphraser'))
let paraphraser: Paraphraser = new Paraphraser($('#input_source'), $('#input_para'), indicator_paraphraser)

// export the paraphraser singleton
export { paraphraser }
