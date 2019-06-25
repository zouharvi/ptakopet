import { Translator, translator_source, translator_target } from './translator'
import { Utils, LanguageCode } from './utils'

/**
 * Manages backend and language select boxes
 */
export class LangSelector {
    private backendSelect: JQuery<HTMLElement>
    private lang1Select: JQuery<HTMLElement>
    private lang2Select: JQuery<HTMLElement>
    private ts1: Translator
    private ts2: Translator

    constructor(ts1: Translator, ts2: Translator,
        backendSelect: JQuery<HTMLElement>, qeSelect: JQuery<HTMLElement>,
        lang1Select: JQuery<HTMLElement>, lang2Select: JQuery<HTMLElement>) {
        this.ts1 = ts1
        this.ts2 = ts2
        this.backendSelect = backendSelect
        this.lang1Select = lang1Select
        this.lang2Select = lang2Select

        $(this.backendSelect).on('change', (a) => {
            this.ts1.backend = this.ts2.backend = Translator.backends[$(a.target).val() as string]
            this.ts1.translate()
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang1Select).on('change', (a) => {
            // Try to swap languages if opposite language is selected and such pair is available
            if ($(a.target).val() == this.ts2.language &&
                Utils.containsArray(this.ts1.backend.languages, [this.ts2.language, this.ts1.language])) {
                let tmp = this.ts1.language as LanguageCode
                this.ts1.language = this.ts2.language
                this.ts2.language = tmp
                this.instantiateLanguagesTarget()
                $(this.ts1.source).val($(this.ts1.target).val() as string)
            } else {
                this.ts1.language = $(a.target).val() as LanguageCode
                this.instantiateLanguagesTarget()
            }

            if(($(this.ts1.source).val() as string).length > 0)
                translator_source.translate()
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang2Select).on('change', (a) => {
            // Try to swap languages if opposite language is selected and such pair is available
            if ($(a.target).val() == this.ts1.language &&
                Utils.containsArray(this.ts2.backend.languages, [this.ts2.language, this.ts1.language])) {
                let tmp = this.ts1.language as LanguageCode
                this.ts1.language = this.ts2.language
                this.ts2.language = tmp
                this.instantiateLanguagesSource()
            } else {
                this.ts2.language = $(a.target).val() as LanguageCode
            }

            if(($(this.ts1.source).val() as string).length > 0)
                translator_source.translate()
        })

        this.instantiateLanguagesSource();
        this.instantiateBackends()
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
        let codeData = Utils.leftUnique<LanguageCode, LanguageCode>(this.ts1.backend.languages)
        let arrayData = codeData.map(Utils.languageName)
        for (let i in arrayData) {
            $(this.lang1Select).append($('<option>', { value: codeData[i], text: arrayData[i] }))
        }

        if (codeData.length < 1) {
            throw new Error("No languages available")
        }

        // Set default language
        if (this.ts1.language == undefined) {
            this.ts1.language = this.ts1.backend.default[0]
        } else if(codeData.indexOf(this.ts1.language) > -1) {
            // Try to keep the current language
            $(this.lang1Select).val(this.ts1.language)
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
        let codeData = Utils.leftDerivative(this.ts1.language as LanguageCode, this.ts2.backend.languages)
        let arrayData = codeData.map(Utils.languageName)
        for (let i in arrayData) {
            $(this.lang2Select).append($('<option>', { value: codeData[i], text: arrayData[i] }))
        }

        if (codeData.length < 1) {
            throw new Error("No languages available")
        }

        // Set default language
        if (this.ts2.language == undefined) {
            this.ts2.language = this.ts2.backend.default[1]
        } else if(codeData.indexOf(this.ts2.language) > -1) {
            // Try to keep the current language
            $(this.lang2Select).val(this.ts2.language)
        }
    }

    /**
     * Fills the select box with available backends and creates callback for this element.
     * Invokes instantiation of language select boxes
     */
    private instantiateBackends(): void {
        for (let i in Translator.backends) {
            $(this.backendSelect).append($('<option>', { value: i, text: Translator.backends[i].name }))
        }
    }
}