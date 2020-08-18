import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings, RequestHashOne } from '../misc/settings'
import { IndicatorManager } from "../page/indicator_manager"
import { Throttler } from "./throttler"
import { logger } from '../study/logger'

export type ParaphraseGID = { 'text': string, 'pivot': string, 'gid': number }
export type Paraphrases = Array<string>
export type ParaphrasesResponse = { 'status': string, 'error'?: string } & { [key in LanguageCode]?: string }
export type ParaphrasesGIDResponse = Array<ParaphraseGID>

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

        super.dispatch(request, async (paraphrases: Paraphrases) => {
            $(this.paraphraserElement).empty()

            // Skip if source is obsolete
            if (!hash.valid()) {
                return
            }

            logger.log(logger.Action.PARAPHRASE, { paraphrase: paraphrases.join('|') })

            for (let data of paraphrases) {
                $(this.paraphraserElement).append("<div>" + data + "</div>")
            }
            if (paraphrases.length == 0) {
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
            composeRequest(lang: LanguageCode, text: string): Promise<Paraphrases> {
                return new Promise<Paraphrases>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/paraphrase/mock",
                        data: { lang: lang, text: text.replace(/\n/, " ") },
                        async: true,
                    })
                        .done((data: ParaphrasesResponse) => {
                            if (data['status'] == 'OK') {
                                delete data['status']
                                resolve(Object.values(data) as Paraphrases)
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
            composeRequest(lang: LanguageCode, text: string): Promise<Paraphrases> {
                return new Promise<Paraphrases>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/paraf/translate",
                        data: { lang: lang, text: text.replace(/\n/, " ") },
                        async: true,
                    })
                        .done((data: ParaphrasesGIDResponse) => {
                            let out: Paraphrases = new Array<string>()
                            let processed : Set<number> = new Set<number>()
                            data.forEach((value: ParaphraseGID) => {
                                if (value.gid <= 0) {
                                    return
                                }
                                if (processed.has(value.gid)) {
                                    return
                                }
                                out.push(value.text)
                                processed.add(value.gid)
                            })
                            resolve(out)
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: new Set<LanguageCode>(['de', 'en', 'es', 'hu', 'lt', 'ru', 'cs', 'et']),
            name: 'Rainbow',
        },
        none: {
            composeRequest(language: LanguageCode, text: string): Promise<Paraphrases> {
                return new Promise<Paraphrases>((resolve, reject) => {
                    resolve([])
                })
            },
            languages: Utils.Languages,
            name: 'None',
        },
    }
}

export interface ParaphraserBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (lang: LanguageCode, text: string) => Promise<Paraphrases>,

    // Array of available languages to this backend
    languages: Set<LanguageCode>,

    // Proper backend name (not key)
    name: string,
}

let indicator_paraphraser: IndicatorManager = new IndicatorManager($('#indicator_paraphraser'))
let paraphraser: Paraphraser = new Paraphraser($('#input_source'), $('#input_para'), indicator_paraphraser)

// export the paraphraser singleton
export { paraphraser }
