import { TranslatorBackend } from './messages/translator'
import { EstimatorBackend } from './messages/estimator'
import { LanguageCode } from "./misc/utils"
import { AlignerBackend } from './messages/aligner';

/**
 * Settings contains miscellaneous generic functions, but mostly a shared object of current settings.
 */
export class Settings {
    public static backendTranslator: TranslatorBackend
    public static backendEstimator: EstimatorBackend
    public static backendAligner: AlignerBackend
    public static language1?: LanguageCode
    public static language2?: LanguageCode
}