import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { IndicatorManager } from "../page/indicator_manager";
import { Settings } from "../misc/settings";
import { TextUtils } from "../misc/text_utils";
import { Estimation } from "./estimator";
import { highlighter_source } from "../page/highlighter";


export type Alignment = Array<[number, number]>
export class Aligner extends AsyncMessage {
    /**
     * Make an alignment request
     */
    public align(estimation: Estimation): void {
        if (Utils.containsArray(Settings.backendEstimator.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            let request = Settings.backendAligner.composeRequest(
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode,
                $(this.source).val() as string,
                $(this.target).val() as string)
            super.dispatch(
                request,
                (alignment: Alignment) => {
                    let intensities: Array<number> = []
                    for (let i in alignment) {
                        intensities.push(estimation[alignment[i][1]])
                    }
                    highlighter_source.highlight(intensities)
                }
            )
        } else {
            // The aligner does not support this language pair, skipping
            console.warn("The aligner does not support this language pair, skipping")
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
    public static backends: { [index: string]: AlignerBackend } = {
        identity: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    let alignment: Alignment = []
                    let tokens1: Array<string> = TextUtils.tokenize(sourceText)
                    let tokens2: Array<string> = TextUtils.tokenize(targetText)
                    // @TODO: this is COMPLETELY wrong and has to be redone
                    for (let i: number = 0; i < tokens1.length; i++) {
                        alignment.push([i, Math.min(i, tokens2.length - 1)])
                    }
                    // Fake loading time
                    setTimeout(() => resolve(alignment), 1000)
                })
            },
            languages: Utils.generatePairs<LanguageCode>(Utils.Languages),
            name: 'Identity',
        },
        none: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    resolve([])
                })
            },
            languages: Utils.generatePairs<LanguageCode>(Utils.Languages),
            name: 'None',
        },
    }
}

export interface AlignerBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string) => Promise<Alignment>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let aligner: Aligner = new Aligner($('#input_source'), $('#input_target'))
let indicator_aligner: IndicatorManager = new IndicatorManager($('#indicator_aligner'))
aligner.addIndicator(indicator_aligner)

export { aligner }