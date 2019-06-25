import { Translator } from './translator'
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
        backendSelect: JQuery<HTMLElement>, lang1Select: JQuery<HTMLElement>, lang2Select: JQuery<HTMLElement>) {
        this.ts1 = ts1
        this.ts2 = ts2
        this.backendSelect = backendSelect
        this.lang1Select = lang1Select
        this.lang2Select = lang2Select

        $(this.backendSelect).on('change', (a) => {
            this.instantiateLanguagesSource();
            console.log($(a.target).val())
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang1Select).on('change', (a) => {
            this.ts1.language = $(a.target).val() as LanguageCode
            this.instantiateLanguagesTarget()
        })

        // At the beginning this sets the current language on the one on the top of the list
        $(this.lang2Select).on('change', (a) => {
            this.ts2.language = $(a.target).val() as LanguageCode
        })

        this.instantiateBackends()

        $(this.backendSelect).trigger('change')
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
        $(this.lang2Select).trigger('change')

        if (codeData.length < 1) {
            throw new Error("No languages available")
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