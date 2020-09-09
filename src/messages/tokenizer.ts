import { IndicatorManager } from "../page/indicator_manager"
import { Settings } from "../misc/settings"
import { TextUtils } from "../misc/text_utils"
import { LanguageCode } from "../misc/utils"

export type Tokenization = Array<string>
export type TokenizerResponse = { 'status': string, 'tokenization': string[] | undefined, 'error': string | undefined }
export class Tokenizer {
    constructor() { }

    /**
     * Make a tokenization request
     */
    public tokenize(text: string, lang: LanguageCode): Promise<Tokenization> {
        let request: Promise<Tokenization> = Settings.backendTokenizer.composeRequest(text, lang)
        return request
    }

    // Object of available backends and their implementations
    public static backends: { [index: string]: TokenizerBackend } = {
        moses: {
            async composeRequest(text: string, lang: LanguageCode): Promise<Tokenization> {
                return new Promise<Tokenization>((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "https://quest.ms.mff.cuni.cz/zouharvi/tokenize/moses",
                        data: { text: text, lang: lang },
                        async: true,
                    })
                        .done((data: TokenizerResponse) => {
                            let tokens: Tokenization = data['tokenization'] as Tokenization
                            for (let i = 0; i < tokens.length; i++) {
                                tokens[i] = TextUtils.decodeHTMLEntities(tokens[i])
                            }
                            if (data['status'] == 'OK') {
                                resolve(tokens)
                            } else {
                                reject(data['error'] as string)
                            }
                        })
                        .fail(reject)
                })
            },
            name: 'Moses',
        },
        space: {
            async composeRequest(text: string, lang: LanguageCode): Promise<Tokenization> {
                //  Tokenize input string according to whitespaces
                //  This is sometimes used for debugging just because it is local and fast
                return new Promise<Tokenization>((resolve, reject) => {
                    let res: Array<string> = TextUtils.clean(text).split(/[\s]+/)

                    // special case for empty string
                    if (res.length == 1 && res[0] == "") {
                        return []
                    }
                    resolve(res)
                })
            },
            name: 'Spaces',
        },
        local: {
            async composeRequest(text: string, lang: LanguageCode): Promise<Tokenization> {
                //  Tokenize input string according to some basic rules (collapse whitespace, newlines etc)
                //  This is sometimes used for debugging just because it is local and fast
                return new Promise<Tokenization>((resolve, reject) => {
                    let res: Array<string> = TextUtils.clean(text).split(/[\s\n\'\"]+/)

                    // special case for empty string
                    if (res.length == 1 && res[0] == "") {
                        return []
                    }
                    resolve(res)
                })
            },
            name: 'Local',
        },
    }
}

export interface TokenizerBackend {
    // Return a finished promise object, which can later be resolved
    composeRequest: (text: string, lang: LanguageCode) => Promise<Tokenization>,

    // Proper backend name (not key)
    name: string,
}

let tokenizer: Tokenizer = new Tokenizer()

// export the tokenizer singleton
export { tokenizer }