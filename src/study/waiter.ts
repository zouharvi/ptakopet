import { logger } from './logger.ts'
import { estimator } from '../messages/estimator.ts'
import { translator_source } from '../messages/translator.ts'

export class Waiter {
    private studyData: Array<[string, string]> = [
        ['k1', "To learn about using tag codes, export text with tags from a formatted document."],
        ['k2', "Controls the range of tones in the shadows or highlights that are modified."],
    ]
    public studyDataIndex: number = 0

    private textContainer: JQuery<HTMLElement>
    private okButton: JQuery<HTMLElement>
    private skipButton: JQuery<HTMLElement>
    public  joinButton: JQuery<HTMLElement>
    
    constructor(
        textContainer: JQuery<HTMLElement>,
        okButton: JQuery<HTMLElement>,
        skipButton: JQuery<HTMLElement>,
        joinButton: JQuery<HTMLElement>,
        studyBlock: JQuery<HTMLElement>,
    ) {
        this.textContainer = textContainer
        this.okButton = okButton
        this.skipButton = skipButton
        this.textContainer = textContainer
        this.joinButton = joinButton

        $(joinButton).click(() => {
            $(studyBlock).show()
            logger.on()
            $(joinButton).hide()

            // reset question index
            this.studyDataIndex = -1
            waiter.skip()
        })
        
        // lambda is used here to capture 'this' context
        $(okButton).click(() => this.nextOk())
        $(skipButton).click(() => this.skip())
    }

    public nextOk(): void {
        logger.log(logger.Action.CONFIRM, 
            {
                text1: translator_source.curSource,
                text2: translator_source.curTranslation,
                estimation: estimator.curEstimation.join('-'), 
                questionKey: this.studyData[this.studyDataIndex][0],
            }
        )
        this.studyDataIndex = (this.studyDataIndex + 1) % this.studyData.length
        $(this.textContainer).text(this.studyData[this.studyDataIndex][1]) 
        logger.log(logger.Action.NEXT, 
            {
                questionKey: this.studyData[this.studyDataIndex][0],
            }
        )
    }
    
    public skip(): void {
        this.studyDataIndex = (this.studyDataIndex + 1) % this.studyData.length
        $(this.textContainer).text(this.studyData[this.studyDataIndex][1]) 
        logger.log(logger.Action.NEXT, 
            {
                questionKey: this.studyData[this.studyDataIndex][0],
            }
        )
    }
}

let waiter: Waiter = new Waiter(
    $('#study_text'),
    $('#study_ok_button'),
    $('#study_skip_button'),
    $('#join_study_button'),
    $('#study_content_block'),
)

//$(waiter.joinButton).trigger('click') // for temporary debug purposes

export { waiter }
