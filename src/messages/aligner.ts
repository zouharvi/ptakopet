import { AsyncMessage } from "./async_message"
import { LanguageCode, Utils } from "../misc/utils"
import { IndicatorManager } from "../page/indicator_manager"
import { Settings } from "../misc/settings"
import { TextUtils } from "../misc/text_utils"
import { Estimation } from "./estimator"
import { highlighter_source } from "../page/highlighter"
import { logger } from '../study/logger'
import { tokenizer } from './tokenizer'

export type Alignment = Array<[number, number]>
export type AlignmentResponse = { 'status': string, 'alignment': string | undefined, 'error': string | undefined }
export class Aligner {
    /**
     * Make an alignment request
     */
    public async align(): Promise<Alignment> {
        if (!this.running) {
            return new Promise<Alignment>((resolve, reject) => { resolve([]) })
        }
        if (!Utils.setContainsArray(Settings.backendAligner.languages, [Settings.language1 as LanguageCode, Settings.language2 as LanguageCode])) {
            console.warn("The aligner does not support this language pair, skipping")
            return new Promise<Alignment>((resolve, reject) => { resolve([]) })
        } else {
            let request = Settings.backendAligner.composeRequest(
                [Settings.language1, Settings.language2] as [LanguageCode, LanguageCode],
                [$(this.source).val(), $(this.target).val()] as [string, string]
            )
            request.then((alignment: Alignment) => {
                let stringified = alignment.map((x: [number, number]) => x[0].toString() + '-' + x[1].toString()).join(' ')
                logger.log(logger.Action.ALIGN, { alignment: stringified })
            })
            return request
        }
    }

    constructor(source: JQuery<HTMLElement>, target: JQuery<HTMLElement>) {
        this.source = source
        this.target = target
    }

    private running: boolean = true
    public on(running: boolean = true) {
        this.running = running
    }

    /**
     * 
     * @param raw String in the widely used Pharaoh alignment format
     */
    private static pharaohToObject(raw: string): Alignment {
        return raw
            .split(' ')
            .map((tok: string) => {
                return tok.split('-').map((a: string) => Number.parseInt(a)) as [number, number]
            })
    }


    // Target HTML elements
    public source: JQuery<HTMLElement>
    public target: JQuery<HTMLElement>

    // Object of available backends and their implementations
    public static backends: { [index: string]: AlignerBackend } = {
        fastAlign: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string]): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/align/fast_align",
                        data: { sourceLang: lang1, targetLang: lang2, sourceText: text1, targetText: text2 },
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
            languages: new Set([
                ...Utils.generatePairsArray<LanguageCode>(['en', 'cs', 'fr'], false),
                ...Utils.generatePairsArray<LanguageCode>(['en', 'de', 'cs'], false),
                ...Utils.generatePairsArray<LanguageCode>(['en', 'et'], false),
            ]),
            name: 'fast_align',
        },

        diagonal: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string]): Promise<Alignment> {
                return new Promise<Alignment>(async (resolve, reject) => {
                    let alignment: Alignment = []
                    let tokens1: Array<string> = await tokenizer.tokenize(text1, Settings.language1 as LanguageCode)
                    let tokens2: Array<string> = await tokenizer.tokenize(text2, Settings.language2 as LanguageCode)

                    for (let i: number = 0; i < tokens1.length; i++) {
                        alignment.push([i, Math.min(i, tokens2.length - 1)])
                    }

                    resolve(alignment)
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages, false),
            name: 'Diagonal',
        },

        none: {
            composeRequest([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string]): Promise<Alignment> {
                return new Promise<Alignment>((resolve, reject) => {
                    resolve([])
                })
            },
            languages: Utils.generatePairsSet<LanguageCode>(Utils.Languages, false),
            name: 'None',
        },
    }
}

export interface AlignerBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: ([lang1, lang2]: [LanguageCode, LanguageCode], [text1, text2]: [string, string]) => Promise<Alignment>,

    // Array of available languages to this backend
    languages: Set<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

let aligner: Aligner = new Aligner($('#input_source'), $('#input_target'))

// export the aligner singleton
export { aligner }