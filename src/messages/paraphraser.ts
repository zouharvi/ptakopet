import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { highlighter_target } from '../page/highlighter'
import { IndicatorManager } from "../page/indicator_manager"
import { aligner } from "./aligner"
import { Throttler } from "./throttler"
import { logger } from '../study/logger'
import { tokenizer } from './tokenizer'

export type Paraphrase = { [key in LanguageCode]?: string }
export type ParaphraseResponse = { 'status': string, 'error'?: string} & Paraphrase

export class Paraphraser extends AsyncMessage {
    private throttler = new Throttler(500)

    /**
     * Make a paraphraser request, which can be later interrupted. 
     */
    public paraphrase_throttle() {
        this.throttler.throttle(this.paraphrase)
    }

    /**
     * Make an paraphraser request
     */
    paraphrase = () => {
        if (!this.running) {
            return
        }
        // Check whether the backend supports this language pair
        if (Settings.backendParaphraser.languages.has(Settings.language1 as LanguageCode)) {
            let request = Settings.backendParaphraser.composeRequest(
                Settings.language1 as LanguageCode,
                $(this.source).val() as string)
            super.dispatch(
                request,
                async (paraphrase: Paraphrase) => {
                    $(this.paraphraserElement).empty()
                    for(let lang of Object.keys(paraphrase)) {
                        if(Utils.Languages.has(lang as LanguageCode)) {
                            let data : string = paraphrase[lang as LanguageCode] as string
                            $(this.paraphraserElement).append("<div>" + data + "</div>")
                        }
                    }
                }
            )
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
        indicator: IndicatorManager)
    {
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


        same: {
            composeRequest(language: LanguageCode, text: string): Promise<Paraphrase> {
                return new Promise<Paraphrase>(async (resolve, reject) => {
                    let res : Paraphrase = {}
                    for(let l of Utils.Languages) {
                        res[l] = text
                    }
                    resolve(res)
                })
            },
            languages: Utils.Languages,
            name: 'Same',
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
