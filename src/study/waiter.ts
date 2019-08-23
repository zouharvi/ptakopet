export class Waiter {
    private studyData: Array<string> = [
        "To learn about using tag codes, export text with tags from a formatted document.",
        "Controls the range of tones in the shadows or highlights that are modified.",
    ]
    private studyDataIndex: number = 0
    

    private textContainer: JQuery<HTMLElement>
    private okButton: JQuery<HTMLElement>
    private skipButton: JQuery<HTMLElement>
    
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

        $(textContainer).text(this.studyData[this.studyDataIndex]) 

        $(joinButton).click(() => {
            $(studyBlock).show()
            $(joinButton).hide()
        })
        
        // lambda is used here to capture 'this' context
        $(okButton).click(() => this.next())
        $(skipButton).click(() => this.next())

        $(studyBlock).show() // for temporary debug purposes
    }

    private next(): void {
        this.studyDataIndex = (this.studyDataIndex + 1) % this.studyData.length
        $(this.textContainer).text(this.studyData[this.studyDataIndex]) 
    }
}
