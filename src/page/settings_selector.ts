import { translator_source, translator_target, Translator } from '../messages/translator'
import { estimator, Estimator } from '../messages/estimator'
import { paraphraser, Paraphraser } from '../messages/paraphraser'
import { aligner, Aligner } from '../messages/aligner'
import { Tokenizer } from '../messages/tokenizer'
import { Utils, LanguageCode } from '../misc/utils'
import { Settings } from '../misc/settings'
import { highlighter_source, highlighter_target } from './highlighter'
import { logger } from '../study/logger'
import { SettingsObject, SettingsProfiles } from '../misc/settings_profiles'

/**
 * Manages backend and language select boxes
 */
export class SettingsSelector {
    constructor(
        private backendTranslatorSelect: JQuery<HTMLElement>,
        private backendEstimatorSelect: JQuery<HTMLElement>,
        private backendParaphraserSelect: JQuery<HTMLElement>,
        private backendAlignerSelect: JQuery<HTMLElement>,
        private backendTokenizerSelect: JQuery<HTMLElement>,
        public  lang1Select: JQuery<HTMLElement>,
        public  lang2Select: JQuery<HTMLElement>,
        private warningEstimator: JQuery<HTMLElement>,
        private warningAligner: JQuery<HTMLElement>
    ) {

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

        // setup paraphraser backend change callback
        $(this.backendParaphraserSelect).on('change', (a) => {
            Settings.backendParaphraser = Paraphraser.backends[$(a.target).val() as string]
            this.refreshWarning()
            paraphraser.paraphrase()
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
                highlighter_source.clean()
                highlighter_target.clean()
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
                highlighter_source.clean()
                highlighter_target.clean()
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

        // Settings Profiles will do many triggers later
        // $(this.lang1Select).trigger('change')
        // $(this.lang2Select).trigger('change')
        // this.refreshWarning()
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
        // let codeData = Utils.leftDerivative(Settings.language1 as LanguageCode, [...Settings.backendTranslator.languages])
        let codeData = Utils.rightUnique([...Settings.backendTranslator.languages])
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
    public forceSettings(settingsObject: SettingsObject): void {
        // mute
        this.muteServices(true)

        // Language settings
        // This would be done automatically by triggering the changes below,
        // but at the cost of false positive warning for backends
        if (settingsObject.language1) {
            Settings.language1 = settingsObject.language1 as LanguageCode
            $(this.lang1Select).val(settingsObject.language1)
        }
        if (settingsObject.language2) {
            Settings.language2 = settingsObject.language2 as LanguageCode
            $(this.lang2Select).val(settingsObject.language2)
        }
        $(this.lang1Select).trigger('change')
        $(this.lang2Select).trigger('change')

        // Settings from the settings block
        if (settingsObject.backendTranslator)
            $(this.backendTranslatorSelect).val(settingsObject.backendTranslator)

        if (settingsObject.backendEstimator)
            $(this.backendEstimatorSelect).val(settingsObject.backendEstimator)
        
        if (settingsObject.backendParaphraser)
            $(this.backendParaphraserSelect).val(settingsObject.backendParaphraser)
        
        if (settingsObject.backendAligner)
            $(this.backendAlignerSelect).val(settingsObject.backendAligner)
        
        $(this.backendTranslatorSelect).trigger('change')
        $(this.backendEstimatorSelect).trigger('change')
        $(this.backendParaphraserSelect).trigger('change')
        $(this.backendAlignerSelect).trigger('change')
        
        // unmute
        this.muteServices(false)
    }

    /**
     * Mutes/unmutes all available messaging services 
     * @param yes 
     */
    private muteServices(yes: boolean) {
        translator_source.on(!yes)
        translator_target.on(!yes)
        estimator.on(!yes)
        paraphraser.on(!yes)
        aligner.on(!yes)
        aligner.on(!yes)
        logger.on(!yes)
    }

    /**
     * Hides the settings block in DOM and locks other settings elements
     */
    public hide(yes: boolean): void {
        $(this.lang1Select).prop('disabled', yes)
        $(this.lang2Select).prop('disabled', yes)
        if(yes) {
            $('#burger_main').hide()
            $('#burger_show_arrow').css('visibility', 'hidden')
        } else {
            // $('#burger_main').show()
            $('#burger_show_arrow').css('visibility', 'visible')
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

        // estimator backends
        for (let i in Estimator.backends) {
            $(this.backendEstimatorSelect).append($('<option>', { value: i, text: Estimator.backends[i].name }))
        }

        // paraphraser backends
        for (let i in Paraphraser.backends) {
            $(this.backendParaphraserSelect).append($('<option>', { value: i, text: Paraphraser.backends[i].name }))
        }

        // alignment backends
        for (let i in Aligner.backends) {
            $(this.backendAlignerSelect).append($('<option>', { value: i, text: Aligner.backends[i].name }))
        }

        // tokenizer backends
        for (let i in Tokenizer.backends) {
            $(this.backendTokenizerSelect).append($('<option>', { value: i, text: Tokenizer.backends[i].name }))
        }

        Settings.backendTranslator = Translator.backends[$(this.backendTranslatorSelect).val() as string]
        Settings.backendEstimator = Estimator.backends[$(this.backendEstimatorSelect).val() as string]
        Settings.backendAligner = Aligner.backends[$(this.backendAlignerSelect).val() as string]
        Settings.backendTokenizer = Tokenizer.backends[$(this.backendTokenizerSelect).val() as string]
    }
}