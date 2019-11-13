import { TranslatorBackend } from '../messages/translator'
import { EstimatorBackend } from '../messages/estimator'
import { AlignerBackend } from '../messages/aligner'
import { TokenizerBackend } from '../messages/tokenizer'
import { LanguageCode } from "./utils"

/**
 * Settings contains miscellaneous generic functions, but mostly a shared object of current settings.
 */
export class Settings {
    public static backendTranslator: TranslatorBackend
    public static backendEstimator: EstimatorBackend
    public static backendAligner: AlignerBackend
    public static backendTokenizer: TokenizerBackend
    public static language1?: LanguageCode
    public static language2?: LanguageCode
}