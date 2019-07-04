import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode, Utils } from "./utils"
import { Settings } from './settings'
import { Highlighter } from './highlighter'


// @TODO: pair each estimator request with a specific translator return?
class Estimator extends AsyncMessage {
    /**
     * Make an estimator request
     */
    public estimate(): void {
        let request = Settings.backend.composeRequest(
            $(this.source).val() as string,
            Settings.language1 as LanguageCode,
            Settings.language2 as LanguageCode)
        super.dispatch(
            request,
            (text) => {
                $(this.target).text(text)
                translator_target.translate()
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
        this.highlighter_source = new Highlighter(source)
        console.log('running highlighter')
    }

    // Target HTML elements or something with `text` function
    public source: JQuery<HTMLElement> | { text(_: string): void }
    public target: JQuery<HTMLElement> | { text(_: string): void }

    private highlighter_source: Highlighter

    // Object of available backends and their implementations
    public static backends: { [index: string]: EstimatorBackend } = {
        random: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): Promise<string> {
                return new Promise<string>((resolve, rejext) => resolve(text))
            },
            languages: [['en', 'es']],
            name: 'Random',
        }
    }
}

export interface EstimatorBackend {
    // Return a finished ajax settings object, which can later be used for proper request
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => Promise<string>,

    // Array of available languages to this backend
    languages: Array<[LanguageCode, LanguageCode]>,

    // Proper backend name (not key)
    name: string,
}

var estimator: Estimator = new Estimator($('#input_source'), $('#input_target'))
export { estimator }