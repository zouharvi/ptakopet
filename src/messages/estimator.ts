import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { highlighter_target } from '../page/highlighter'
import { TextUtils } from "../misc/text_utils"
import { IndicatorManager } from "../page/indicator_manager"
import { aligner } from "./aligner"
import { Throttler } from "./throttler"
import { logger } from '../study/logger'

export type Estimation = Array<number>
export type EstimationResponse = { 'status': string, 'qe': Estimation | undefined, 'error': string | undefined }

export class Estimator extends AsyncMessage {
    public curEstimation : Estimation = []
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
        if(!this.running) {
            return
        }
        // Check whether the backend supports this language pair
        if (Utils.setContainsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            let request = Settings.backendEstimator.composeRequest(
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode,
                $(this.source).val() as string,
                $(this.target).val() as string)
            super.dispatch(
                request,
                (estimation: Estimation) => {
                    this.curEstimation = estimation
                    logger.log(logger.Action.ESTIMATE, { estimation : estimation.join('-') })
                    aligner.align(estimation)
                    highlighter_target.highlight(estimation)
                    
                    /**
                     * @TODO: Passing estimation to aligner is probably not a good idea and there should be a spearate
                     * driver class that wraps this. The aligner uses the estimation to instruct the highlighter the intensities
                     * with which to highlight the source textarea.
                     * - zouharvi 15 Aug 2019
                     */
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
    constructor(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>) {
        super()
        this.source = source
        this.target = target
    }
    
    private running: boolean = true
    public on(running: boolean = true) {
        this.running = running
    }

    // Target HTML elements
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    // Object of available backends and their implementations
    public static backends: { [index: string]: EstimatorBackend } = {
        openkiwi: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/qe/openkiwi",
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
            languages: new Set([['cs', 'de'], ['en', 'de']]),
            name: 'OpenKiwi',
        },

        questplusplus: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
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
            languages: new Set([['en', 'cs']]),
            name: 'QuEst++',
        },
        
        deepquest: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/qe/deepquest",
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
            languages: new Set([['en', 'de'], ['cs', 'de']]),
            name: 'deepQuest',
        },

        random: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
                let tokens = TextUtils.tokenize(targetText)
                let estimation: Estimation = []
                for (let i in tokens) {
                    estimation.push(Math.random())
                }
                return new Promise<Estimation>((resolve, reject) => {
                    // Fake loading time
                    setTimeout(() => resolve(estimation), 500)
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages),
            name: 'Random',
        },

        none: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    resolve([])
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages),
            name: 'None',
        },
    }
}

export interface EstimatorBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string) => Promise<Estimation>,

    // Array of available languages to this backend
    languages: Set<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let estimator: Estimator = new Estimator($('#input_source'), $('#input_target'))
let indicator_estimator: IndicatorManager = new IndicatorManager($('#indicator_estimator'))
estimator.addIndicator(indicator_estimator)

// export the estimator singleton
export { estimator }
