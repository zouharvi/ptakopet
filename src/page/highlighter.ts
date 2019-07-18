import { TextUtils } from "../misc/text_utils";

/**
 * This class manages highlighting of textarea element based on numeric values.
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
    public highlight(intensities: Array<number>): void {
        let indices: Array<[number, number]> = TextUtils.tokenizeIndices($(this.element).val() as string, false)
        let highlights: Array<{ highlight: [number, number], className: string}> = []
        for(let i = 0; i < intensities.length; i++) {
            let styleColor: string = `rgba(255, 0, 0, ${intensities[i]/2})` 
            highlights.push({highlight: indices[i], className: `style='background-color: ${styleColor};'`})
        }
        if(intensities.length != indices.length) {
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
}