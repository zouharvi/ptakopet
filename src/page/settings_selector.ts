import { translator_source, translator_target, Translator, TranslatorBackend } from '../messages/translator'
import { estimator, Estimator, EstimatorBackend } from '../messages/estimator'
import { aligner, Aligner, AlignerBackend } from '../messages/aligner'
import { Utils, LanguageCode } from '../misc/utils'
import { Settings } from '../misc/settings'
import { highlighter_source, highlighter_target } from './highlighter'
import { logger } from '../study/logger'

/**
 * Manages backend and language select boxes
 */
export class SettingsSelector {
    private backendTranslatorSelect: JQuery<HTMLElement>
    private backendEstimatorSelect: JQuery<HTMLElement>
    private backendAlignerSelect: JQuery<HTMLElement>
    private lang1Select: JQuery<HTMLElement>
    private lang2Select: JQuery<HTMLElement>
    private warningEstimator: JQuery<HTMLElement>
    private warningAligner: JQuery<HTMLElement>

    constructor(
        backendTranslatorSelect: JQuery<HTMLElement>,
        backendEstimatorSelect: JQuery<HTMLElement>,
        backendAlignerSelect: JQuery<HTMLElement>,
        lang1Select: JQuery<HTMLElement>,
        lang2Select: JQuery<HTMLElement>,
        warningEstimator: JQuery<HTMLElement>,
        warningAligner: JQuery<HTMLElement>) {
        this.backendTranslatorSelect = backendTranslatorSelect
        this.backendEstimatorSelect = backendEstimatorSelect
        this.backendAlignerSelect = backendAlignerSelect
        this.lang1Select = lang1Select
        this.lang2Select = lang2Select
        this.warningEstimator = warningEstimator
        this.warningAligner = warningAligner

        // setup translator backend change callback
        $(this.backendTranslatorSelect).on('change', (a) => {
            Settings.backendTranslator = Translator.backends[$(a.target).val() as string]
            this.instantiateLanguagesSource()
            this.instantiateLanguagesTarget()
            this.refreshWarning()
            translator_source.translate()
        })

        // setup estimator backend change callback
        $(this.backendEstimatorSelect).on('change', (a) => {
            Settings.backendEstimator = Estimator.backends[$(a.target).val() as string]
            this.refreshWarning()
            estimator.estimate()
        })

        // setup aligner backend change callback
        $(this.backendAlignerSelect).on('change', (a) => {
            Settings.backendAligner = Aligner.backends[$(a.target).val() as string]
            this.refreshWarning()
            estimator.estimate()
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang1Select).on('change', (a) => {
            // Try to swap languages if opposite language is selected and such pair is available
            if ($(a.target).val() == Settings.language2 &&
                Utils.setContainsArray(Settings.backendTranslator.languages, [Settings.language2 as LanguageCode, Settings.language1 as LanguageCode])) {
                let tmp = Settings.language1 as LanguageCode
                Settings.language1 = Settings.language2

                Settings.language2 = tmp
                this.instantiateLanguagesTarget()
                $(translator_source.source).val($(translator_source.target).val() as string)
                // Clean the current highlight
                highlighter_source.highlight([])
                highlighter_target.highlight([])
            } else {
                Settings.language1 = $(a.target).val() as LanguageCode
                this.instantiateLanguagesTarget()
            }

            if (($(translator_source.source).val() as string).length > 0)
                translator_source.translate()
            this.refreshWarning()

            // Log by the end so that everything is already resolved
            logger.log(logger.Action.LANG_CHANGE, { lang1: Settings.language1, lang2: Settings.language2 })
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang2Select).on('change', (a) => {
            // Try to swap languages if opposite language is selected and such pair is available
            if ($(a.target).val() == Settings.language1 &&
                Utils.setContainsArray(Settings.backendTranslator.languages, [Settings.language2 as LanguageCode, Settings.language1 as LanguageCode])) {
                let tmp = Settings.language1 as LanguageCode
                Settings.language1 = Settings.language2
                Settings.language2 = tmp
                this.instantiateLanguagesSource()
                $(translator_source.source).val($(translator_source.target).val() as string)
                // Clean the current highlight
                highlighter_source.highlight([])
                highlighter_target.highlight([])
            } else {
                Settings.language2 = $(a.target).val() as LanguageCode
            }

            if (($(translator_source.source).val() as string).length > 0)
                translator_source.translate()
            this.refreshWarning()

            // Log by the end so that everything is already resolved
            logger.log(logger.Action.LANG_CHANGE, { lang1: Settings.language1, lang2: Settings.language2 })
        })

        this.instantiateBackends()
        this.instantiateLanguagesSource()
        $(this.lang1Select).trigger('change')
        $(this.lang2Select).trigger('change')
        this.refreshWarning()
    }

    /**
     * Manage visibility of warning icons next to backends
     */
    private refreshWarning(): void {
        if (Utils.setContainsArray(Settings.backendEstimator.languages, [Settings.language1, Settings.language2])) {
            $(this.warningEstimator).fadeOut()
        } else {
            $(this.warningEstimator).fadeIn()
        }

        if (Utils.setContainsArray(Settings.backendAligner.languages, [Settings.language1, Settings.language2])) {
            $(this.warningAligner).fadeOut()
        } else {
            $(this.warningAligner).fadeIn()
        }
    }

    /**
     * Fills the source language select box with available backends and creates callback for this element.
     * This function can be called multiple times after different backend has been selected.
     */
    private instantiateLanguagesSource(): void {
        // Clear previous languages
        $(this.lang1Select).find('option').remove()

        // Take unique languages from the left side of language pairs
        let codeData = Utils.leftUnique<LanguageCode, LanguageCode>([...Settings.backendTranslator.languages])
        let arrayData = codeData.map(Utils.languageName)
        for (let i in arrayData) {
            $(this.lang1Select).append($('<option>', { value: codeData[i], text: arrayData[i] }))
        }

        if (codeData.length < 1) {
            throw new Error("No languages available")
        }
        // Set default language
        if (Settings.language1 == undefined) {
            Settings.language1 = Settings.backendTranslator.default[0]
        }

        // Try to keep the current language
        if (codeData.indexOf(Settings.language1) > -1) {
            $(this.lang1Select).val(Settings.language1)
        } else {
            Settings.language1 = Settings.backendTranslator.default[0]
            Settings.language2 = Settings.backendTranslator.default[1]
        }
    }

    /**
     * Fills the target language select box with available backends and creates callback for this element.
     * This function can be called multiple times after different backend has been selected.
     */
    private instantiateLanguagesTarget(): void {
        // Clear previous languages
        $(this.lang2Select).find('option').remove()

        // Select compatible languages with already selected source language
        let codeData = Utils.leftDerivative(Settings.language1 as LanguageCode, [...Settings.backendTranslator.languages])
        let arrayData = codeData.map(Utils.languageName)
        for (let i in arrayData) {
            $(this.lang2Select).append($('<option>', { value: codeData[i], text: arrayData[i] }))
        }

        if (codeData.length < 1) {
            throw new Error("No languages available")
        }

        // Set default language
        if (Settings.language2 == undefined) {
            Settings.language2 = Settings.backendTranslator.default[1]
        }

        // Try to keep the current language
        if (codeData.indexOf(Settings.language2) > -1) {
            $(this.lang2Select).val(Settings.language2)
        } else {
            Settings.language1 = Settings.backendTranslator.default[0]
            Settings.language2 = Settings.backendTranslator.default[1]
        }
    }

    /**
     * Set settings and locck the corresponding UI elements
     */
    public forceSettings(
        backendTranslator?: string,
        backendEstimator?: string,
        backendAligner?: string,
        language1?: string,
        language2?: string,
    ): void {
        /**
         * This may not be the best way to handle settings manipulation from code
         * since it creates unnecesary calls to the server via triggers.
         */
        // mute
        translator_source.on(false)
        translator_target.on(false)
        estimator.on(false)
        aligner.on(false)
        logger.on(false)

        if (backendTranslator) {
            $(this.backendTranslatorSelect).val(backendTranslator)
        }
        if (backendEstimator) {
            $(this.backendEstimatorSelect).val(backendEstimator)
        }
        if (backendAligner) {
            $(this.backendAlignerSelect).val(backendAligner)
        }
        $(this.backendTranslatorSelect).trigger('change')
        $(this.backendAlignerSelect).trigger('change')
        $(this.backendEstimatorSelect).trigger('change')
        if (language1) {
            $(this.lang1Select).val(language1)
        }
        $(this.lang1Select).trigger('change')
        if (language2) {
            $(this.lang2Select).val(language2)
        }
        $(this.lang2Select).trigger('change')

        // unmute
        translator_source.on(true)
        translator_target.on(true)
        estimator.on(true)
        aligner.on(true)
        logger.on(true)

        // disable UI elements
        this.hide()
        $(this.lang1Select).prop('disabled', true)
        $(this.lang2Select).prop('disabled', true)
    }

    /**
     * Hides the settings block in DOM
     */
    private hide(): void {
        $('#settings_block').hide()
    }

    /**
     * Fills the select box with available backends and creates callback for this element.
     * Invokes instantiation of language select boxes
     */
    private instantiateBackends(): void {
        // translator backends
        for (let i in Translator.backends) {
            $(this.backendTranslatorSelect).append($('<option>', { value: i, text: Translator.backends[i].name }))
        }

        // estimator backends
        for (let i in Estimator.backends) {
            $(this.backendEstimatorSelect).append($('<option>', { value: i, text: Estimator.backends[i].name }))
        }

        // alignment backends
        for (let i in Aligner.backends) {
            $(this.backendAlignerSelect).append($('<option>', { value: i, text: Aligner.backends[i].name }))
        }

        Settings.backendTranslator = Translator.backends[$(this.backendTranslatorSelect).val() as string]
        Settings.backendEstimator = Estimator.backends[$(this.backendEstimatorSelect).val() as string]
        Settings.backendAligner = Aligner.backends[$(this.backendAlignerSelect).val() as string]
    }
}
