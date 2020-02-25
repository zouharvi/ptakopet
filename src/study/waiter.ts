import { logger } from './logger'
import { estimator } from '../messages/estimator'
import { translator_source, translator_target } from '../messages/translator'
import { highlighter_source, highlighter_target } from '../page/highlighter'
import { SettingsProfile, SettingsProfiles } from '../misc/settings_profiles'
import { baked_study } from './baked_study'
import { paraphraser } from '../messages/paraphraser'
import { aligner } from '../messages/aligner'

export class Waiter {
    public bakedQueue: Array<[string, string]> = []
    public bakedIndex: number = 0
    public userID: string | null = null

    private localStorageID: string | null = null

    constructor(
        private textContainer: JQuery<HTMLElement>,
        private instructionsContainer: JQuery<HTMLElement>,
        okButtonsParent: JQuery<HTMLElement>,
        private skipButton: JQuery<HTMLElement>,
        private joinButton: JQuery<HTMLElement>,
        private studyBlock: JQuery<HTMLElement>,
        private moduleMainContent: JQuery<HTMLElement>,
    ) {

        $(joinButton).click(() => this.joinStudy())

        // $(okButton).click(() => this.nextOk())
        for (let okChild of $(okButtonsParent).children()) {
            $(okChild).click(() => this.nextOk($(okChild).val() as number))
        }

        // lambda is used here to capture 'this' context
        $(skipButton).click(() => this.nextOk(undefined))
    }

    /**
     * Prepares the interface after the users joins the study
     */
    private joinStudy(): void {
        let userID: string | null = prompt('UserID:', '')
        if (userID == null) {
            return
        }
        if (!baked_study.users.hasOwnProperty(userID)) {
            alert('Unknown userID. Falling back to public version.')
            logger.on(false)
            return
        }

        this.userID = userID
        this.localStorageID = 'ptakopet_progress_' + (this.userID as string)
        logger.on(true)
        let keys = baked_study.users[this.userID].bakedQueue

        for (let key in keys) {
            let qID = keys[key]
            let qIDbare = qID
            if(qID.indexOf('#') != -1) {
                qIDbare = qID.substring(0, qID.indexOf('#'))
            }
            this.bakedQueue.push([qID, baked_study.stimuli[qIDbare]])
        }

        logger.log(logger.Action.START,
            {
                queue: this.bakedQueue.map((x) => x[0]).join('|'),
                agent: navigator.userAgent,
            }
        )

        $(this.studyBlock).show()
        $(this.joinButton).hide()
        $(this.moduleMainContent).attr('study_active', '')

        SettingsProfiles.setSettingsTag('edin')

        let tmpDataIndex: string | null = window.localStorage.getItem(this.localStorageID)
        if (tmpDataIndex == null) {
            window.localStorage.setItem(this.localStorageID, this.bakedIndex.toString())
        } else {
            this.bakedIndex = parseInt(tmpDataIndex)
        }

        // reset question index
        this.serveQuestion()
    }

    /**
     * Tries to advance the question index 
     */
    private advanceIndex(): void {
        this.bakedIndex += 1
        if (this.bakedIndex == this.bakedQueue.length) {
            logger.log(logger.Action.END, {})
            alert('Testing finished. Thank you. | Konec testování. Děkujeme.')
            this.bakedIndex = 0
        }
    }

    /**
     * Work done, send to logger and go to the next question
     */
    public nextOk(value?: number): void {
        if (value == undefined) {
            // User tries to skip the current question
            let reason = prompt("Reason: | Důvod: ")
            logger.log(logger.Action.CONFIRM_SKIP,
                {
                    text1: translator_source.curSource,
                    text2: translator_source.curTranslation,
                    text3: translator_target.curTranslation,
                    reason: reason,
                    questionKey: this.bakedQueue[this.bakedIndex][0],
                }
            )
        } else {
            // User sends in the result
            logger.log(logger.Action.CONFIRM_OK,
                {
                    text1: translator_source.curSource,
                    text2: translator_source.curTranslation,
                    text3: translator_target.curTranslation,
                    confidence: value,
                    estimation: estimator.curEstimation.join('-'),
                    questionKey: this.bakedQueue[this.bakedIndex][0],
                }
            )
        }

        this.advanceIndex()
        this.serveQuestion()
    }

    /**
     * Display the current question
     */
    private serveQuestion(): void {
        let question: [string, string] = this.bakedQueue[this.bakedIndex]
        let qID: string = question[0]
        let formattedText: string = question[1]

        // clear artifacts
        highlighter_source.clean()
        highlighter_target.clean()
        estimator.clean()
        translator_source.clean()
        translator_target.clean()
        paraphraser.clean()

        // disable estimation on out of domain questions
        estimator.on(qID[0] == 't')
        let instructions: string = ''

        // apply regex rules 
        // this could be rewritten so that the settings is set only once, but no elegant
        // solution exists, as TS doesn't allow deep merging of two objects
        for (let regex in baked_study.stimuliRules) {
            if ((new RegExp(regex)).test(qID)) {
                if (baked_study.stimuliRules[regex].profile != undefined) {
                    SettingsProfiles.setSettings(baked_study.stimuliRules[regex].profile as SettingsProfile)
                }
                if (baked_study.stimuliRules[regex].message != undefined) {
                    instructions = baked_study.stimuliRules[regex].message as string
                }
            }
        }
        $(this.instructionsContainer).html(instructions)

        // show stimuli
        $(this.textContainer).html(formattedText)

        // log next stimuli
        logger.log(logger.Action.NEXT,
            {
                questionKey: this.bakedQueue[this.bakedIndex][0],
            }
        )
        window.localStorage.setItem(this.localStorageID as string, this.bakedIndex.toString())
    }
}

let waiter: Waiter = new Waiter(
    $('#study_text'),
    $('#study_instructions'),
    $('#study_ok_buttons'),
    $('#study_skip_button'),
    $('#join_study_button'),
    $('#study_content_block'),
    $('#module_main_content'),
)

//$(waiter.joinButton).trigger('click') // for temporary debug purposes

export { waiter }