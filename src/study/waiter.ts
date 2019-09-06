import { logger } from './logger.ts'
import { estimator } from '../messages/estimator.ts'
import { translator_source } from '../messages/translator.ts'
import { BAKED_QUEUE } from './baked.ts'

export class Waiter {
    public bakedQueue : Array<[string, string]> = [] 
    public bakedIndex : number = 0
    public userID : string | null = null

    private studyDB : any
    private localStorageID: string | null = null

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
            let userID : string | null = prompt('UserID:', '')
            if (userID == null) {
                return
            }


            this.userID = userID
            this.localStorageID = 'ptakopet_progress_' + (this.userID as string)
            
            logger.on()
    
            let keys = BAKED_QUEUE['unknown']
            if (BAKED_QUEUE.hasOwnProperty(this.userID)) {
                keys = BAKED_QUEUE[this.userID]
            } 
            for(let key in keys) {
                let qID = keys[key]
                this.bakedQueue.push([qID, this.studyDB[qID]])
            } 

            logger.log(logger.Action.START, 
                {
                    queue: this.bakedQueue.join('-'),
                }
            )
            
            $(studyBlock).show()
            $(joinButton).hide()

            
            let tmpDataIndex : string | null = window.localStorage.getItem(this.localStorageID)
            if(tmpDataIndex == null) { 
                window.localStorage.setItem(this.localStorageID, this.bakedIndex.toString())
            } else {
                this.bakedIndex = parseInt(tmpDataIndex)
            }

            // reset question index
            waiter.nextSkip(false, false)
        })
        
        // lambda is used here to capture 'this' context
        $(okButton).click(() => this.nextOk())
        $(skipButton).click(() => this.nextSkip())
        
        // the questions URL may be moved in the future
        jQuery.getJSON(
            'https://raw.githubusercontent.com/zouharvi/ptakopet/master/meta/study/questions_flat.json',
            (data) => {
                this.studyDB = data
                // TODO: log number of loaded questions
                // console.log('Loaded ' + this.studyData.length + ' questions')
            }
        )
        
    }

    private advanceIndex(): void {
        this.bakedIndex += 1
        if(this.bakedIndex == this.bakedQueue.length) {
            logger.log(logger.Action.END, {})
            alert('Konec testování')
            this.bakedIndex = 0
        }
    }

    public nextOk(): void {
        logger.log(logger.Action.CONFIRM, 
            {
                text1: translator_source.curSource,
                text2: translator_source.curTranslation,
                estimation: estimator.curEstimation.join('-'), 
                questionKey: this.bakedQueue[this.bakedIndex][0],
            }
        )
        this.advanceIndex()
        $(this.textContainer).text(this.bakedQueue[this.bakedIndex][1]) 
        logger.log(logger.Action.NEXT, 
            {
                questionKey: this.bakedQueue[this.bakedIndex][0],
            }
        )
        window.localStorage.setItem(this.localStorageID as string, this.bakedIndex.toString())
    }
    
    public nextSkip(promptUser: boolean = true, advance: boolean = true): void {
        let reason : string | null = ''
        if (promptUser) {
            reason = prompt('Důvod:', '')
            if (reason == null) {
                return
            }
        }
        if(advance) {
            this.advanceIndex()
        }
        $(this.textContainer).text(this.bakedQueue[this.bakedIndex][1]) 
        logger.log(logger.Action.NEXT, 
            {
                questionKey: this.bakedQueue[this.bakedIndex][0],
                reason: reason as string,
            }
        )
        window.localStorage.setItem(this.localStorageID as string, this.bakedIndex.toString())
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
