import { TranslatorBackend } from '../messages/translator'
import { EstimatorBackend } from '../messages/estimator'
import { AlignerBackend } from '../messages/aligner'
import { TokenizerBackend } from '../messages/tokenizer'
import { LanguageCode } from "./utils"
import { ParaphraserBackend } from '../messages/paraphraser'

/**
 * Settings contains miscellaneous generic functions, but mostly a shared object of current settings.
 */
export class Settings {
    public static backendTranslator: TranslatorBackend
    public static backendEstimator: EstimatorBackend
    public static backendParaphraser: ParaphraserBackend
    public static backendAligner: AlignerBackend
    public static backendTokenizer: TokenizerBackend
    public static language1?: LanguageCode
    public static language2?: LanguageCode
}

export class RequestHashTwo {
    public curLang1: LanguageCode
    public curLang2: LanguageCode
    public curSource: string
    public curTarget: string

    public constructor(private object: { source: JQuery<HTMLElement>, target: JQuery<HTMLElement> }) {
        this.curSource = $(object.source).val() as string
        this.curTarget = $(object.target).val() as string
        this.curLang2 = Settings.language2 as LanguageCode
        this.curLang1 = Settings.language1 as LanguageCode
    }

    public valid(): boolean {
        if (Settings.language1 != this.curLang1)
            return false
        if ($(this.object.source).val() != this.curSource)
            return false

        if (Settings.language2 != this.curLang2)
            return false
        if ($(this.object.target).val() != this.curTarget)
            return false

        return true
    }
}

export class RequestHashOne {
    public lang: LanguageCode
    public text: string

    public constructor(private object: { source: JQuery<HTMLElement> }) {
        this.text = $(object.source).val() as string
        this.lang = Settings.language1 as LanguageCode
    }

    public valid(): boolean {
        if (Settings.language1 != this.lang)
            return false
        if ($(this.object.source as JQuery<HTMLElement>).val() != this.text)
            return false

        return true
    }
}