import { TextUtils } from "../misc/text_utils";

/**
 * This class manages highlighting of textarea element based on numeric values.
 */
export class Highlighter {
    private element: JQuery<HTMLElement>
    private dirty: boolean = false
    
    /**
     * @param element Target textarea element
     */
    public constructor(element: JQuery<HTMLElement>) {
        this.element = element

        // initialize 
        this.highlightFocus([])
    }

    /**
     * Highlight the element based on numeric intensities.
     * @param intensities Numeric [0, 1] intensities of target words. The length must match the number of tokenized words.
     */
    public highlight(intensities: Array<number>): void {
        let indices: Array<[number, number]> = TextUtils.tokenizeIndices($(this.element).val() as string, true)
        /**
         * Instead of pairing estimator and translator requests the highlighting job is dropped if these lengths
         * don't match. This is a hack, but works great for cases such as None estimation. 
         */
        if (intensities.length != indices.length || intensities.length == 0) {
            // Only clean if it is dirty. Otherwise this worsens the mobile performance
            if(this.dirty) {
                this.highlightFocus([])
                this.dirty = false
            }
            return;
        } else {
            this.dirty = true
        }

        let highlights: Array<{ highlight: [number, number], className: string }> = []

        for (let i = 0; i < intensities.length; i++) {
            let styleColor: string = `rgba(255, 0, 0, ${0.5 - intensities[i] / 2})`
            highlights.push({ highlight: indices[i], className: `style='background-color: ${styleColor};'` })
        }

        this.highlightFocus(highlights)
    }

    /**
     * Wrapper around highlightWithinTextarea, so that focus is preserved
     * @param highlights Highlight data passed to highlightWithinTextarea
     */
    private highlightFocus(highlights: Array<{ highlight: [number, number], className: string }> = []): void {
        let isFocused = $(this.element).is(":focus")

        // @ts-ignore
        $(this.element).highlightWithinTextarea({ highlight: highlights })

        // If the element had focus before, return it
        if (isFocused) {
            $(this.element).focus()
        }
    }
}

let highlighter_source: Highlighter = new Highlighter($('#input_source'))
let highlighter_target: Highlighter = new Highlighter($('#input_target'))

export {highlighter_source, highlighter_target}