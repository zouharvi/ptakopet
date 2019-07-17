import { TranslatorBackend } from './translator'
import { EstimatorBackend } from './estimator'
import { LanguageCode } from "./utils"

/**
 * Settings contains miscellaneous generic functions, but mostly a shared object of current settings.
 */
export class Settings {
    public static backendTranslator: TranslatorBackend
    public static backendEstimator: EstimatorBackend
    public static language1?: LanguageCode
    public static language2?: LanguageCode
}