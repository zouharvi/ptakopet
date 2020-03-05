import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
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
    }

    /**
     * Make an paraphraser request
     */
    paraphrase = () => {
        if (!this.running) {
            return
        }
        let srcText: string = $(this.source).val() as string
        // Check whether the backend supports this language pair
        if (Settings.backendParaphraser.languages.has(Settings.language1 as LanguageCode)) {
            let request = Settings.backendParaphraser.composeRequest(
                Settings.language1 as LanguageCode,
                srcText)

            request.then(async (paraphrase: Paraphrase) => {
                $(this.paraphraserElement).empty()
                let toDisplay: Array<string> = []

                if (srcText != $(this.source).val()) {
                    // skip if source is obsolete
                    return
                }

                for (let lang of Object.keys(paraphrase)) {
                    // disregard other information, such as status
                    if (Utils.Languages.has(lang as LanguageCode)) {
                        let data: string = paraphrase[lang as LanguageCode] as string

                        // skip if equal to the currently displayed source
                        if (TextUtils.vagueEqual(data, srcText)) {
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
                }

                for (let data of toDisplay) {
                    $(this.paraphraserElement).append("<div>" + data + "</div>")
                }
                if(toDisplay.length == 0) {
                    $(this.paraphraserElement).append("<div style='font-style: italic'>None available.</div>")
                }
            })

            super.dispatch(request)
        } else {
            // The paraphraser does not support this language pair, skipping
            console.warn("The paraphraser does not support this language pair, skipping")
        }
    }

    /**
     * @param source Source textarea
     * @param target Target textarea
     */
    constructor(
        private source: JQuery<HTMLElement>,
        private target: JQuery<HTMLElement>,
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
let paraphraser: Paraphraser = new Paraphraser($('#input_source'), $('#input_target'), $('#input_para'), indicator_paraphraser)

// export the paraphraser singleton
export { paraphraser }
