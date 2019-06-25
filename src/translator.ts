import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { LanguageCode, Utils } from "./utils"

export abstract class Translator extends AsyncMessage {
    private throttler = new Throttler(500);

    /**
     * Make a translator request, which can be later interrupted. 
     */
    public translate_throttle() {
        this.throttler.throttle(this.translate)
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

    protected abstract translate(): void
    public abstract backend: TranslatorBackend
    public language?: LanguageCode
    protected source: JQuery<HTMLElement>
    protected target: JQuery<HTMLElement>

    public static backends: { [index: string]: TranslatorBackend } = {
        ufalTransformer: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): JQuery.AjaxSettings {
                return {
                    type: "POST",
                    url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                    data: { src: sourceLang, tgt: targetLang, input_text: text },
                    async: true,
                }
            },
            sanitizeData(data: any): string {
                return data
            },
            languages: Utils.generatePairs<LanguageCode>(['cs', 'en', 'fr', 'hi'], false),
            name: 'ÚFAL Transformer',
        },


        ufalTransformer2: {
            composeRequest(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): JQuery.AjaxSettings {
                return {
                    type: "POST",
                    url: "https://lindat.mff.cuni.cz/services/transformer/api/v2/languages/",
                    data: { src: sourceLang, tgt: targetLang, input_text: text },
                    async: true,
                }
            },
            sanitizeData(data: any): string {
                return data
            },
            languages: Utils.generatePairs<LanguageCode>(['cs', 'en', 'fr', 'hi'], false),
            name: 'ÚFAL Transformer 2',
        }
    }
}

export class TranslatorSource extends Translator {
    public backend: TranslatorBackend = Translator.backends.ufalTransformer

    protected translate = () => {
        super.dispatch(
            this.backend.composeRequest($(this.source).val() as string, 'en', 'cs'),
            (data) => {
                let text = this.backend.sanitizeData(data)
                $(this.target).text(text)
            }
        )
    }
}

type TranslatorBackend = {
    composeRequest: (text: string, sourceLang: LanguageCode, targetLang: LanguageCode) => JQuery.AjaxSettings,
    languages: Array<[LanguageCode, LanguageCode]>,
    sanitizeData(data: any): string,
    name: string,
}