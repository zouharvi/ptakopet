import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { IndicatorManager } from "../page/indicator_manager";


export class Aligner extends AsyncMessage {
    /**
     * Make an alignment request
     */
    public align(): void {
        // @TODO: implement
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

    // Target HTML elements or something with `val` function
    public source: JQuery<HTMLElement> | { val(_: string): void }
    public target: JQuery<HTMLElement> | { val(_: string): void }

    // Object of available backends and their implementations
    public static backends: { [index: string]: AlignerBackend } = {
        none: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Array<[number, number]>> {
                return new Promise<Array<[number, number]>>((resolve, reject) => {
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
    composeRequest: (sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string) => Promise<Array<[number, number]>>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let aligner: Aligner = new Aligner($('#input_source'), $('#input_target'))
let indicator_aligner: IndicatorManager = new IndicatorManager($('#indicator_aligner'))
aligner.addIndicator(indicator_aligner)

export { aligner }