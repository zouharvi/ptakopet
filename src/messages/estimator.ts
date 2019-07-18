import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { highlighter_target } from '../page/highlighter'
import { TextUtils } from "../misc/text_utils";
import { IndicatorManager } from "../page/indicator_manager";
import { aligner } from "./aligner";

export type Estimation = Array<number>
export class Estimator extends AsyncMessage {
    /**
     * Make an estimator request
     */
    public estimate(): void {
        // Clean the previous highlight
        highlighter_target.highlight([])

        // Check whether the backend supports this language pair
        if (Utils.containsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            let request = Settings.backendEstimator.composeRequest(
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode,
                $(this.source).val() as string,
                $(this.target).val() as string)
            super.dispatch(
                request,
                (estimation: Estimation) => {
                    highlighter_target.highlight(estimation)
                    aligner.align(estimation)
                    /**
                     * @TODO: Passing estimation to aligner is probably not a good idea and there should be a spearate
                     * driver class that wraps this. The aligner uses the estimation to instruct the highlighter the intensities
                     * with which to highlight the source textarea.
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

    // Target HTML elements
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    // Object of available backends and their implementations
    public static backends: { [index: string]: EstimatorBackend } = {
        random: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
                let tokens = TextUtils.tokenize(targetText)
                let estimation: Estimation = []
                for(let i in tokens) {
                    estimation.push(Math.random())
                }
                return new Promise<Estimation>((resolve, reject) => {
                    // Fake loading time
                    setTimeout(() => resolve(estimation), 500)
                })
            },
            languages: Utils.generatePairs<LanguageCode>(Utils.Languages),
            name: 'Random',
        },

        none: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Estimation> {
                return new Promise<Estimation>((resolve, reject) => {
                    resolve([])
                })
            },
            languages: Utils.generatePairs<LanguageCode>(Utils.Languages),
            name: 'None',
        },
    }
}

export interface EstimatorBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string) => Promise<Estimation>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let estimator: Estimator = new Estimator($('#input_source'), $('#input_target'))
let indicator_estimator: IndicatorManager = new IndicatorManager($('#indicator_estimator'))
estimator.addIndicator(indicator_estimator)

export { estimator }