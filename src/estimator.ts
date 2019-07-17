import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "./utils"
import { Settings } from './settings'
import { Highlighter } from './highlighter'


// @TODO: pair each estimator request with a specific translator return?
export class Estimator extends AsyncMessage {
    /**
     * Make an estimator request
     */
    public estimate(): void {
        // Check whether the backend supports this language pair
        if (Utils.containsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            let request = Settings.backendEstimator.composeRequest(
                $(this.source).val() as string,
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode)
            super.dispatch(
                request,
                (estimation: Array<number>) => {
                    this.highlighter_target.highlight(estimation)
                    console.log(estimation)
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
        console.log('creating highlighter')
    }

    // Target HTML elements or something with `text` function
    public source: JQuery<HTMLElement> | { text(_: string): void }
    public target: JQuery<HTMLElement> | { text(_: string): void }

    private highlighter_source: Highlighter
    private highlighter_target: Highlighter

    // Object of available backends and their implementations
    public static backends: { [index: string]: EstimatorBackend } = {
        random: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Array<number>> {
                return new Promise<Array<number>>((resolve, rejext) => resolve([0.1, 0.2, 0.6, 0.3]))
            },
            languages: Utils.generatePairs<LanguageCode>(Utils.Languages),
            name: 'Random',
        },

        questplusplus: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<Array<number>> {
                return new Promise<Array<number>>((resolve, rejext) => resolve([0.1, 0.2, 0.6, 0.3]))
            },
            languages: [['en', 'es']],
            name: 'QuEst++',
        }
    }
}

export interface EstimatorBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<Array<number>>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

var estimator: Estimator = new Estimator($('#input_source'), $('#input_target'))
export { estimator }