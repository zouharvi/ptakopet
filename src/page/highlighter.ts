import { TextUtils } from "../misc/text_utils";

/**
 * This class manages highlighting of textarea element based on numberic values.
 */
export class Highlighter {
    private element: JQuery<HTMLElement>
    /**
     * @param element Target textarea element
     */
    public constructor(element: JQuery<HTMLElement>) {
        this.element = element

        // initialize 
        // @ts-ignore
        element.highlightWithinTextarea({highlight: []})
    }

    /**
     * Highlight the element based on numeric intensities.
     * @param intensities Numeric [0, 1] intensities of target words. The length must match the number of tokenized words.
     */
    public highlight(intensities: Array<Number>): void {
        let indicies: Array<[number, number]> = Highlighter.tokenizeIndicies($(this.element).val() as string)
        let highlights: Array<{ highlight: [number, number], className: string}> = []
        for(let i = 0; i < intensities.length; i++) {
            highlights.push({highlight: indicies[i], className: 'style="background-color: red;"'})
        }
        if(intensities.length != indicies.length) {
            console.error("Something bad happened - tokens and quest length doesn't match")
        }
        let isFocused = $(this.element).is(":focus")

        // @ts-ignore
        $(this.element).highlightWithinTextarea({highlight: highlights})

        // If the element had focus before, return it
        if(isFocused) {
            $(this.element).focus()
        }
    }

    /**
     * Returns indicies (beginning and end character position) of tokenized output.
     * @param raw Raw input string.
     */
    private static tokenizeIndicies(raw: string): Array<[number, number]> {
        let arr: Array<[number, number]> = []
        let words: Array<string> = TextUtils.tokenize(raw)
        let wordIndex: number = 0

        for (let i = 0; i < raw.length; i++) {
            if (raw.substring(i).indexOf(words[wordIndex]) == 0) {
                arr.push([i, i + words[wordIndex].length])
                i += words[wordIndex].length
                wordIndex++
            }
            if (wordIndex >= words.length) {
                break
            }
        }
        return arr
    }
}