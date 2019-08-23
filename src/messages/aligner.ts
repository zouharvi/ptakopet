import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { IndicatorManager } from "../page/indicator_manager";
import { Settings } from "../misc/settings";
import { TextUtils } from "../misc/text_utils";
import { Estimation } from "./estimator";
import { highlighter_source } from "../page/highlighter";
import { logger } from '../study/logger'


export type Alignment = Array<[number, number]>
export type AlignmentResponse = { 'status': string, 'alignment': string | undefined, 'error': string | undefined }
export class Aligner extends AsyncMessage {
    /**
     * Make an alignment request
     */
    public align(estimation: Estimation): void {
        if (Utils.setContainsArray(Settings.backendAligner.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            let request = Settings.backendAligner.composeRequest(
                Settings.language1 as LanguageCode,
                Settings.language2 as LanguageCode,
                $(this.source).val() as string,
                $(this.target).val() as string)
            super.dispatch(
                request,
                (alignment: Alignment) => {
                    if(estimation.length == 0) {
                        highlighter_source.highlight([])
                        logger.log(logger.Action.ALIGN, { alignment: '' })
                    } else {
                        // This exctracts the max from the left side
                        let max = Math.max(...alignment.map((a: [number, number]) => a[0])) 

                        let intensities: Array<number> = Array<number>(max).fill(1)
                        for (let i in alignment) {
                            intensities[alignment[i][0]] = estimation[alignment[i][1]]
                        }
                        logger.log(logger.Action.ALIGN, { alignment: intensities.join('-') })
                        highlighter_source.highlight(intensities)
                    }
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

    /**
     * 
     * @param raw String in the widely used Pharaoh alignment format
     */
    private static pharaohToObject(raw: string): Alignment {
        return raw
            .split(' ')
            .map((tok: string) => {
                return tok.split('-').map((a:string) => Number.parseInt(a)) as [number, number]
            })
    }


    // Target HTML elements
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    // Object of available backends and their implementations
    public static backends: { [index: string]: AlignerBackend } = {
        fastAlign: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/align/fast_align",
                        data: { sourceLang: sourceLang, targetLang: targetLang, sourceText: sourceText, targetText: targetText },
                        async: true,
                    })
                        .done((data: AlignmentResponse) => {
                            if (data['status'] == 'OK') {
                                resolve(Aligner.pharaohToObject(data['alignment'] as string))
                            } else {
                                console.warn(data['error'])
                                reject(data['error'] as string)
                            }
                        })
                        .fail(reject)
                })
            },
            languages: Utils.generatePairsArray(['en', 'cs', 'fr']),
            name: 'fast_align',
        },

        diagonal: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    let alignment: Alignment = []
                    let tokens1: Array<string> = TextUtils.tokenize(sourceText)
                    let tokens2: Array<string> = TextUtils.tokenize(targetText)

                    for (let i: number = 0; i < tokens1.length; i++) {
                        alignment.push([i, Math.min(i, tokens2.length - 1)])
                    }
                    // Fake loading time
                    setTimeout(() => resolve(alignment), 1000)
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages),
            name: 'Diagonal',
        },
        none: {
            composeRequest(sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    resolve([])
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages),
            name: 'None',
        },
    }
}

export interface AlignerBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (sourceLang: LanguageCode, targetLang: LanguageCode, sourceText: string, targetText: string) => Promise<Alignment>,

    // Array of available languages to this backend
    languages: Set<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let aligner: Aligner = new Aligner($('#input_source'), $('#input_target'))
let indicator_aligner: IndicatorManager = new IndicatorManager($('#indicator_aligner'))
aligner.addIndicator(indicator_aligner)

// export the aligner singleton
export { aligner }
