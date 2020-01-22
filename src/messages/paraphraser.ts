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
export type ParaphraseResponse = { 'status': string } & Paraphrase

export class Paraphraser extends AsyncMessage {
    private throttler = new Throttler(500)

    /**
     * Make a estimator request, which can be later interrupted. 
     */
    public estimate_throttle() {
        this.throttler.throttle(this.estimate)
    }

    /**
     * Make an estimator request
     */
    estimate = () => {
        if (!this.running) {
            return
        }
        // Check whether the backend supports this language pair
        if (Utils.setContainsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            // update tokenization

            let request = Settings.backendEstimator.composeRequest(
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode,
                $(this.source).val() as string,
                $(this.target).val() as string)
            super.dispatch(
                request,
                async (paraphrase: Paraphraser) => {
                    let tokenization = await tokenizer.tokenize($(this.target).val() as string, Settings.language2 as LanguageCode)
                    logger.log(logger.Action.ESTIMATE, { estimation: estimation.join('-') })
                    aligner.align(estimation)
                    highlighter_target.highlight(estimation, tokenization)
                }
            )
        } else {
            // The estimator does not support this language pair, skipping
            console.warn("The estimator does not support this language pair, skipping")
        }
    }

    /**
     * @param source Source textarea
     * @param target Target textarea
     */
    constructor(private source: JQuery<HTMLElement>, private target: JQuery<HTMLElement>, indicator: IndicatorManager) {
        super(indicator)
    }

    private running: boolean = true
    public on(running: boolean = true) {
        this.running = running
    }

    // Object of available backends and their implementations
    public static backends: { [index: string]: ParaphraserBackend } = {
        mock: {
            composeRequest(language: LanguageCode, text: string): Promise<Paraphrase> {
                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/qe/questplusplus",
                        data: { sourceLang: sourceLang, targetLang: targetLang, sourceText: sourceText.replace(/\n/, " "), targetText: targetText.replace(/\n/, " ") },
                        async: true,
                    })
                        .done((data: EstimationResponse) => {
                            if (data['status'] == 'OK') {
                                resolve(data['qe'])
                            } else {
                                console.warn(data['error'])
                                reject(data['error'] as string)
                            }
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: new Set(['cs', 'en', 'de']),
            name: 'QuEst++',
        },


        same: {
            composeRequest(language: LanguageCode, text: string): Promise<Paraphrase> {
                return new Promise<Paraphrase>(async (resolve, reject) => {
                    
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
let paraphraser: Paraphraser = new Paraphraser($('#input_source'), $('#input_target'), indicator_paraphraser)

// export the estimator singleton
export { paraphraser }
