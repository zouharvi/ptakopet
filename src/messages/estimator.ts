import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings, RequestHashTwo } from '../misc/settings'
import { highlighter_source, highlighter_target } from '../page/highlighter'
import { IndicatorManager } from "../page/indicator_manager"
import { aligner, Alignment } from "./aligner"
import { Throttler } from "./throttler"
import { logger } from '../study/logger'
import { tokenizer, Tokenization } from './tokenizer'
import { ExtraTranslationInfo, translator_source } from "./translator"

export type Estimation = Array<number>
export type EstimationResponse = { 'status': string, 'qe': Estimation | undefined, 'error': string | undefined }

export class Estimator extends AsyncMessage {
    public curEstimation: Estimation = []
    private throttler = new Throttler(500)

    /**
     * Make a estimator request, which can be later interrupted. 
     */
    public estimate_throttle() {
        this.throttler.throttle(this.estimate)
    }

    public clean() {
        this.curEstimation = []
    }

    /**
     * Make an estimator request
     */
    public async estimate() {
        if (!this.running) {
            return
        }

        // Check whether the backend supports this language pair
        if (!Utils.setContainsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            // The estimator does not support this language pair, skipping
            console.warn("The estimator does not support this language pair, skipping")
            return
        }

        let hash = new RequestHashTwo(this)

        if(hash.curSource == '') {
            return
        }

        let alignment = await aligner.align()

        let request = Settings.backendEstimator.composeRequest(
            [Settings.language1, Settings.language2] as [LanguageCode, LanguageCode],
            [hash.curSource, hash.curTarget],
            { ...translator_source.curExtra, alignment: alignment })


        request.then(async (estimation: Estimation) => {
            if (estimation.length == 0) {
                // Used for none estimator to stop cascade but also useful to other, as this limits the log clutter
                return
            }

            // Make sure that we drop the pending quality estimation after lang switch
            if (!hash.valid()) {
                return
            }

            this.curEstimation = estimation
            let tokenizationSource = await tokenizer.tokenize(hash.curSource, Settings.language2 as LanguageCode)
            let tokenizationTarget = await tokenizer.tokenize(hash.curTarget, Settings.language1 as LanguageCode)
            highlighter_target.highlight(estimation, tokenizationTarget)
            logger.log(logger.Action.ESTIMATE, { estimation: estimation.join(' ') })

            // Make sure that we drop the pending quality estimation after lang switch
            if (!hash.valid()) {
                return
            }

            let intensities = Estimator.computeSourceComplexity(alignment, estimation, tokenizationSource)
            highlighter_source.highlight(intensities, tokenizationSource)
        })

        super.dispatch(request)
    }

    /**
     * @param source Source textarea
     * @param target Target textarea
     */
    constructor(
        public source: JQuery<HTMLElement>,
        public target: JQuery<HTMLElement>,
        indicator: IndicatorManager) {
        super(indicator)
    }

    private running: boolean = true
    public on(running: boolean = true) {
        this.running = running
    }

    private static computeSourceComplexity(alignment: Alignment, estimation: Estimation, tokenizationSource: Tokenization): Estimation {
        let sourceCount = tokenizationSource.length

        // Using only fill would create reference errors, so we need to map it with a lambda function  
        let intensities: Array<Array<number>> = Array<Array<number>>(sourceCount).fill([]).map((_) => new Array<number>())
        for (let i in alignment) {
            intensities[alignment[i][0]].push(estimation[alignment[i][1]])
        }

        // We use 0.87 implicitly for unaligned source tokens and average for others, but other strategy may be better 
        return intensities.map((arr) => arr.length == 0 ? 0.87 : arr.reduce((a, b) => a + b, 0) / arr.length)
    }

    // Object of available backends and their implementations
    public static backends: { [index: string]: EstimatorBackend } = {
        openkiwi: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/qe/openkiwi",
                        data: { sourceLang: lang1, targetLang: lang2, sourceText: text1.replace(/\n/, " "), targetText: text2.replace(/\n/, " ") },
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
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/qe/questplusplus",
                        data: { sourceLang: lang1, targetLang: lang2, sourceText: text1.replace(/\n/, " "), targetText: text2.replace(/\n/, " ") },
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
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/qe/deepquest",
                        data: { sourceLang: lang1, targetLang: lang2, sourceText: text1.replace(/\n/, " "), targetText: text2.replace(/\n/, " ") },
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

        sheffield: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
                if (extra.options) {
                    extra.options.lang = lang2
                } else {
                    extra.options = { lang: lang2 }
                }

                return new Promise<Estimation>((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "https://dq.fredblain.org/",
                        data: JSON.stringify(extra),
                    })
                        .done((data: any) => {
                            resolve(data.map((x: any) => x.probas).flat(1))
                        })
                        .fail((xhr: JQueryXHR) => reject(xhr))
                })
            },
            languages: new Set([['en', 'et'], ['en', 'cs']]),
            name: 'Sheffield QE',
        },

        random: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
                return new Promise<Estimation>(async (resolve, reject) => {
                    let tokens = await tokenizer.tokenize(text2, Settings.language2 as LanguageCode)
                    let estimation: Estimation = []
                    for (let i in tokens) {
                        estimation.push(Math.random())
                    }
                    resolve(estimation)
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages),
            name: 'Random',
        },

        manual: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
                return new Promise<Estimation>(async (resolve, reject) => {
                    if (extra.silent) {
                        resolve([])
                        return
                    }

                    let tokens = await tokenizer.tokenize(text2, Settings.language2 as LanguageCode)

                    let zeroes: Estimation = []
                    for (let i = 0; i < tokens.length; i++) {
                        zeroes.push(0)
                    }
                    if (tokens.length == 0) {
                        resolve(zeroes)
                    }

                    let qeRaw: string | null = prompt("Enter " + tokens.length + " comma separeted floats (no whitespace) for quality estimation")

                    if (qeRaw == null) {
                        resolve(zeroes)
                    } else {
                        let estimation: Estimation = []
                        try {
                            for (let val of (qeRaw as string).split(',')) {
                                estimation.push(parseFloat(val))
                            }
                            if (estimation.length != tokens.length) {
                                resolve(zeroes)
                            } else {
                                resolve(estimation)
                            }
                        } catch (e) {
                            resolve(zeroes)
                        }
                    }
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages),
            name: 'Manual',
        },

        none: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo): Promise<Estimation> {
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
    composeRequest: ([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string], extra: ExtraTranslationInfo) => Promise<Estimation>,

    // Array of available languages to this backend
    languages: Set<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let indicator_estimator: IndicatorManager = new IndicatorManager($('#indicator_estimator'))
let estimator: Estimator = new Estimator($('#input_source'), $('#input_target'), indicator_estimator)

// export the estimator singleton
export { estimator }