import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { Settings } from '../misc/settings'
import { Highlighter } from '../page/highlighter'
import { TextUtils } from "../misc/text_utils";
import { IndicatorManager } from "../page/indicator_manager";


export class Estimator extends AsyncMessage {
    /**
     * Make an estimator request
     */
    public estimate(): void {
        // Check whether the backend supports this language pair
        if (Utils.containsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            let request = Settings.backendEstimator.composeRequest(
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode,
                $(this.source).val() as string,
                $(this.target).val() as string)
            super.dispatch(
                request,
                (estimation: Array<number>) => {
                    this.highlighter_target.highlight(estimation)
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
        this.highlighter_source = new Highlighter(source)
        this.highlighter_target = new Highlighter(target)
    }

    // Target HTML elements or something with `val` function
    public source: JQuery<HTMLElement> | { val(_: string): void }
    public target: JQuery<HTMLElement> | { val(_: string): void }

    private highlighter_source: Highlighter
    private highlighter_target: Highlighter

    // Object of available backends and their implementations
    public static backends: { [index: string]: EstimatorBackend } = {
        random: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Array<number>> {
                let tokens = TextUtils.tokenize(targetText)
                let estimation: Array<number> = []
                for(let i in tokens) {
                    estimation.push(Math.random())
                }
                return new Promise<Array<number>>((resolve, reject) => {
                    setTimeout(() => resolve(estimation), 500)
                })
            },
            languages: Utils.generatePairs<LanguageCode>(Utils.Languages),
            name: 'Random',
        },

        none: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Array<number>> {
                return new Promise<Array<number>>((resolve, reject) => {
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
    composeRequest: (sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string) => Promise<Array<number>>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let estimator: Estimator = new Estimator($('#input_source'), $('#input_target'))
let indicator_estimator: IndicatorManager = new IndicatorManager($('#indicator_estimator'))
estimator.addIndicator(indicator_estimator)

export { estimator }