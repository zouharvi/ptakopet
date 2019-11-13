import { AsyncMessage } from "./async_message"
import { IndicatorManager } from "../page/indicator_manager"
import { Settings } from "../misc/settings"
import { TextUtils } from "../misc/text_utils"

export type Tokenization = Array<string>
export type TokenizationDouble = [Tokenization, Tokenization]
export type TokenizerResponse = { 'status': string, 'tokens': string | undefined, 'error': string | undefined }
export class Tokenizer extends AsyncMessage {
    public latestSrc: Tokenization = new Array<string>()
    public latestTrg: Tokenization = new Array<string>()

    /**
     * Make a tokenization request
     */
    public tokenize(): void {
        if (!this.running) {
            return
        }
        let request = Settings.backendTokenizer.composeRequest(
            $(this.source).val() as string,
            $(this.target).val() as string
        )
        super.dispatch(
            request,
            (tokens: TokenizationDouble) => {
                this.latestSrc = tokens[0]
                this.latestTrg = tokens[1]
            }
        )
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
    public static backends: { [index: string]: TokenizerBackend } = {
        local: {
            composeRequest(text: string): Promise<TokenizationDouble> {
                return new Promise<TokenizationDouble>((resolve, reject) => {
                    resolve([[],[]])
                    // $.ajax({
                    //     type: "GET",
                    //     url: "https://quest.ms.mff.cuni.cz/zouharvi/align/fast_align",
                    //     data: { sourceLang: sourceLang, targetLang: targetLang, sourceText: sourceText, targetText: targetText },
                    //     async: true,
                    // })
                    //     .done((data: AlignmentResponse) => {

                    //         if (data['status'] == 'OK') {
                    //             resolve(Aligner.pharaohToObject(data['alignment'] as string))
                    //         } else {
                    //             console.warn(data['error'])
                    //             reject(data['error'] as string)
                    //         }
                    //     })
                    //     .fail(reject)
                })
            },
            name: 'Local',
        },

        moses: {
            composeRequest(sourceText: string, targetText: string): Promise<TokenizationDouble> {
                return new Promise<TokenizationDouble>((resolve, reject) => {
                    resolve([[],[]])
                    // let alignment: Alignment = []
                    // let tokens1: Array<string> = TextUtils.tokenize(sourceText)
                    // let tokens2: Array<string> = TextUtils.tokenize(targetText)

                    // for (let i: number = 0; i < tokens1.length; i++) {
                    //     alignment.push([i, Math.min(i, tokens2.length - 1)])
                    // }

                    // // Fake loading time
                    // setTimeout(() => resolve(alignment), 500)
                })
            },
            name: 'Moses',
        },

        space: {
            composeRequest(sourceText: string, targetText: string): Promise<TokenizationDouble> {
                return new Promise<TokenizationDouble>((resolve, reject) => {
                    resolve([[],[]])
                })
            },
            name: 'Spaces',
        },
    }
}

export interface TokenizerBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (sourceText: string, targetText: string) => Promise<TokenizationDouble>,

    // Proper backend name (not key)
    name: string,
}

let tokenizer: Tokenizer = new Tokenizer($('#input_source'), $('#input_target'))
let indicator_tokenizer: IndicatorManager = new IndicatorManager($('#indicator_tokenizer'))
tokenizer.addIndicator(indicator_tokenizer)

// export the tokenizer singleton
export { tokenizer }