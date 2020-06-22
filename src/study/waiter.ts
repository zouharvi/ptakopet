import { logger } from './logger'
import { estimator } from '../messages/estimator'
import { translator_source, translator_target } from '../messages/translator'
import { highlighter_source, highlighter_target } from '../page/highlighter'
import { SettingsProfile, SettingsProfiles } from '../misc/settings_profiles'
import { baked_study } from './baked_study'
import { paraphraser } from '../messages/paraphraser'

export class Waiter {
    public bakedQueue: Array<[string, string]> = []
    public bakedQueueAll: Array<Array<string>> = []
    public bakedIndex: number = 0
    public bakedBlock: number = 0
    public userID: string = 'default'
    public responseID?: string
    public sourceID?: string

    private localStorageID: string | null = null

    private textContainer: JQuery<HTMLElement> = $('#study_text')
    private instructionsContainer: JQuery<HTMLElement> = $('#study_instructions')
    private studyProgress: JQuery<HTMLElement> = $('#study_progress')
    private okButtonsParent: JQuery<HTMLElement> = $('#study_ok_buttons')
    private skipButton: JQuery<HTMLElement> = $('#study_skip_button')
    private noteButton: JQuery<HTMLElement> = $('#study_note_button')
    private joinButton: JQuery<HTMLElement> = $('#join_study_button')
    private studyParent: JQuery<HTMLElement> = $('#study_content_block')
    private moduleMainContent: JQuery<HTMLElement> = $('#module_main_content')

    constructor() {
        $(this.joinButton).click(() => this.joinStudy())

        // $(okButton).click(() => this.nextOk())
        for (let okChild of $(this.okButtonsParent).children()) {
            $(okChild).click(() => this.nextOk($(okChild).val() as number))
        }

        // lambda is used here to capture 'this' context
        $(this.skipButton).click(() => this.nextOk(undefined))
        $(this.noteButton).click(() => {
            let message = prompt('Enter message:', '')
            if (message == null)
                return
            logger.log(logger.Action.NOTE,
                {
                    note: message,
                    questionKey: this.bakedQueue[this.bakedIndex][0],
                }
            )
        })
    }

    /**
     * Prepares the interface after the users joins the study
     */
    public joinStudy(userID: string | null = null): void {
        if (userID == null) {
            userID = prompt('UserID:', '')
        }
        if (userID == null) {
            return
        }

        if (!baked_study.users.hasOwnProperty(userID)) {
            alert(`Unknown userID "${userID}". Login forbidden.`)
            return
        }

        this.userID = userID
        logger.on(true)

        this.localStorageID = `ptakopet_progress_multi_${this.userID}`;
        [this.bakedIndex, this.bakedBlock] = this.getProgress()
        this.bakedQueueAll = baked_study.users[this.userID]
        if (this.bakedQueueAll.length <= this.bakedBlock) {
            alert(`${this.bakedBlock}/${this.bakedQueueAll.length} blocks annotated. Stimuli count: ${this.bakedQueueAll.map((queue) => queue.length.toString()).join(', ')}.\nLogin forbidden.`)
            return
        }

        this.generateCurrentQueue()

        let logData: any = {
            queue: this.bakedQueue.map((x) => x[0]).join('|'),
            agent: navigator.userAgent,
        }
        if (this.responseID) logData['responseID'] = this.responseID
        if (this.sourceID) logData['sourceID'] = this.sourceID

        logger.log(logger.Action.START, logData)

        $(this.studyParent).show()
        $(this.joinButton).hide()
        $(this.moduleMainContent).attr('study_active', '')

        // reset question index
        this.serveQuestion()
    }

    private generateCurrentQueue() {
        let keys = baked_study.users[this.userID][this.bakedBlock]
        this.bakedQueue = []
        for (let key in keys) {
            let qID = keys[key]
            let qIDbare = qID
            if (qID.indexOf('#') != -1) {
                qIDbare = qID.substring(0, qID.indexOf('#'))
            }
            this.bakedQueue.push([qID, baked_study.stimuli[qIDbare]])
        }
    }

    private getProgress(): [number, number] {
        let progressRaw: string | null = window.localStorage.getItem(this.localStorageID as string)
        if (progressRaw == null) {
            let progress = { index: 0, block: 0 }
            window.localStorage.setItem(this.localStorageID as string, JSON.stringify(progress))
            return [0, 0]
        } else {
            let progress: { index: number, block: number } = JSON.parse(progressRaw)
            return [progress.index, progress.block]
        }
    }

    private saveProgress(): void {
        let progressRaw: string | null = window.localStorage.getItem(this.localStorageID as string)
        if (progressRaw == null) {
            throw new Error(`Tried to update block to ${this.bakedBlock}, but no local storage found.`)
        } else {
            let progress = { index: this.bakedIndex, block: this.bakedBlock }
            window.localStorage.setItem(this.localStorageID as string, JSON.stringify(progress))
        }
    }

    /**
     * Tries to advance the question index 
     */
    private advanceIndex(): boolean {
        this.bakedIndex += 1
        if (this.bakedIndex == this.bakedQueue.length) {
            if (this.bakedBlock + 1 == this.bakedQueueAll.length) {
                // The conditions are not merged so that the logger logs the non-incremented block
                logger.log(logger.Action.END, {})
            }
            this.bakedBlock += 1
            this.bakedIndex = 0
            this.saveProgress()
            if (this.bakedBlock == this.bakedQueueAll.length) {
                alert(`${this.bakedBlock}/${this.bakedQueueAll.length} blocks annotated. Stimuli count: ${this.bakedQueueAll.map((queue) => queue.length.toString()).join(', ')}.\nTesting finished.`)
                if (this.sourceID == 'statmt') {
                    $.ajax({
                        type: 'GET',
                        url: "https://statmt.org/bergamot/cgi/translationexperiment.php",
                        data: { userID: this.userID, CallSource: 'ptakopet', CallState: 'completed' }
                    })
                }
                return false
            } else {
                alert(`Block progress: ${this.bakedBlock}/${this.bakedQueueAll.length}. Please continue with the next block of stimuli.`)
                this.generateCurrentQueue()
            }
        }
        return true
    }

    /**
     * Work done, send to logger and go to the next question
     */
    public nextOk(value?: number): void {
        if (value == undefined) {
            // User tries to skip the current question
            let reason = prompt("Reason: ")
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
        console.warn('NEXT OK')

        let serveNext = this.advanceIndex()
        if (serveNext) {
            this.serveQuestion()
        } else {
            window.setTimeout(() => window.location.reload(), 1000)
        }
    }

    /**
     * Display the current question
     */
    private serveQuestion(): void {
        this.studyProgress.text(`Stimulus: ${this.bakedIndex + 1}/${this.bakedQueue.length}, Block: ${this.bakedBlock + 1}/${this.bakedQueueAll.length}`)

        let question: [string, string] = this.bakedQueue[this.bakedIndex]
        let qID: string = question[0]
        let formattedText: string = question[1]

        console.warn('SERVING NEXT', question, qID, formattedText)

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
        for (let settings of baked_study.stimuliRules) {
            if ((new RegExp(settings.rule)).test(qID)) {
                if (settings.profile != undefined) {
                    SettingsProfiles.setSettings(settings.profile as SettingsProfile)
                }
                if (settings.message != undefined) {
                    instructions = settings.message as string
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
        this.saveProgress()
    }
}

let waiter: Waiter = new Waiter()

//$(waiter.joinButton).trigger('click') // for temporary debug purposes

export { waiter }