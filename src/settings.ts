import { TranslatorBackend, Translator } from './translator'
import { LanguageCode } from "./utils"

/**
 * Settings contains miscellaneous generic functions, but mostly a shared object of current settings.
 */
export class Settings {
    public static backend: TranslatorBackend
    public static language1?: LanguageCode
    public static language2?: LanguageCode
}