import { translator_source, translator_target, Translator } from '../messages/translator'
import { estimator, Estimator } from '../messages/estimator'
import { Utils, LanguageCode } from '../misc/utils'
import { Settings } from '../misc/settings'
import { Aligner } from '../messages/aligner';

/**
 * Manages backend and language select boxes
 */
export class SettingsSelector {
    private backendTranslatorSelect: JQuery<HTMLElement>
    private backendEstimatorSelect: JQuery<HTMLElement>
    private backendAlignerSelect: JQuery<HTMLElement>
    private lang1Select: JQuery<HTMLElement>
    private lang2Select: JQuery<HTMLElement>

    constructor(
        backendTranslatorSelect: JQuery<HTMLElement>,
        backendEstimatorSelect: JQuery<HTMLElement>,
        backendAlignerSelect: JQuery<HTMLElement>,
        lang1Select: JQuery<HTMLElement>, lang2Select: JQuery<HTMLElement>) {
        this.backendTranslatorSelect = backendTranslatorSelect
        this.backendEstimatorSelect = backendEstimatorSelect
        this.backendAlignerSelect = backendAlignerSelect
        this.lang1Select = lang1Select
        this.lang2Select = lang2Select

        // setup translator backend change callback
        $(this.backendTranslatorSelect).on('change', (a) => {
            Settings.backendTranslator = Translator.backends[$(a.target).val() as string]
            this.instantiateLanguagesSource();
            translator_source.translate()
        })
        
        // setup estimator backend change callback
        $(this.backendEstimatorSelect).on('change', (a) => {
            Settings.backendEstimator = Estimator.backends[$(a.target).val() as string]
            translator_source.translate()
        })
        
        // setup aligner backend change callback
        $(this.backendAlignerSelect).on('change', (a) => {
            Settings.backendAligner = Aligner.backends[$(a.target).val() as string]
            translator_source.translate()
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang1Select).on('change', (a) => {
            // Try to swap languages if opposite language is selected and such pair is available
            if ($(a.target).val() == Settings.language2 &&
                Utils.containsArray(Settings.backendTranslator.languages, [Settings.language2, Settings.language1])) {
                let tmp = Settings.language1 as LanguageCode
                Settings.language1 = Settings.language2
                Settings.language2 = tmp
                this.instantiateLanguagesTarget()
                $(translator_source.source).val($(translator_source.target).val() as string)
            } else {
                Settings.language1 = $(a.target).val() as LanguageCode
                this.instantiateLanguagesTarget()
            }

            if(($(translator_source.source).val() as string).length > 0)
                translator_source.translate()
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang2Select).on('change', (a) => {
            // Try to swap languages if opposite language is selected and such pair is available
            if ($(a.target).val() == Settings.language1 &&
                Utils.containsArray(Settings.backendTranslator.languages, [Settings.language2, Settings.language1])) {
                let tmp = Settings.language1 as LanguageCode
                Settings.language1 = Settings.language2
                Settings.language2 = tmp
                this.instantiateLanguagesSource()
            } else {
                Settings.language2 = $(a.target).val() as LanguageCode
            }

            if(($(translator_source.source).val() as string).length > 0)
                translator_source.translate()
        })
        this.instantiateBackends()
        this.instantiateLanguagesSource();
        $(this.lang1Select).trigger('change')
        $(this.lang2Select).trigger('change')
    }

    /**
     * Fills the source language select box with available backends and creates callback for this element.
     * This function can be called multiple times after different backend has been selected.
     */
    private instantiateLanguagesSource(): void {
        // Clear previous languages
        $(this.lang1Select).find('option').remove()

        // Take unique languages from the left side of language pairs
        let codeData = Utils.leftUnique<LanguageCode, LanguageCode>(Settings.backendTranslator.languages)
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
        } else if(codeData.indexOf(Settings.language1) > -1) {
            // Try to keep the current language
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
        let codeData = Utils.leftDerivative(Settings.language1 as LanguageCode, Settings.backendTranslator.languages)
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
        } else if(codeData.indexOf(Settings.language2) > -1) {
            // Try to keep the current language
            $(this.lang2Select).val(Settings.language2)
        } else {
            Settings.language1 = Settings.backendTranslator.default[0]
            Settings.language2 = Settings.backendTranslator.default[1]
        }
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
        Settings.backendTranslator = Translator.backends.ufalTransformer

        // estimator backends
        for (let i in Estimator.backends) {
            $(this.backendEstimatorSelect).append($('<option>', { value: i, text: Estimator.backends[i].name }))
        }
        Settings.backendEstimator = Estimator.backends.random

        // alignment backends
        for (let i in Aligner.backends) {
            $(this.backendAlignerSelect).append($('<option>', { value: i, text: Aligner.backends[i].name }))
        }
        Settings.backendAligner = Aligner.backends.diagonal
    }
}