import { TextUtils } from "../misc/text_utils"
import { Tokenization } from "../messages/tokenizer"

/**
 * This class manages highlighting of textarea element based on numeric values.
 */
export class Highlighter {
    private element: JQuery<HTMLElement>
    private dirty: boolean = false
    private wasHighlighted: boolean = false

    /**
     * @param element Target textarea element
     */
    public constructor(element: JQuery<HTMLElement>) {
        this.element = element

        // initialize 
        this.highlightFocus([])
    }

    /**
     * Clean the displayed highlight
     */
    public clean(): void {
        // Only clean if it is dirty. Otherwise this worsens the mobile performance
        if (this.dirty) {
            this.highlightFocus([])
            this.dirty = false
        }
    }

    /**
     * Highlight the element based on numeric intensities.
     * @param intensities Numeric [0, 1] intensities of target words. The length must match the number of tokenized words.
     */
    public highlight(intensities: Array<number>, tokenization: Tokenization): void {
        let indices: Array<[number, number]> = []
        try {
            // Tokenization may be outdated, so it's actually good that an error is thrown here.
            indices = TextUtils.tokenizeIndices($(this.element).val() as string, tokenization)
        } catch (e) {
            console.warn(e.message, 'Refusing to continue.')
            return
        }

        if(intensities.length != indices.length) {
            console.warn('Estimation does not match the tokenization in length.', 'Refusing to continue.')
            return
        }

        if (intensities.length == 0) {
            this.clean()
        } else {
            this.dirty = true
        }

        // Compute colors from intensities
        let highlights: Array<{ highlight: [number, number], className: string }> = []
        for (let i = 0; i < indices.length; i++) {
            let styleColor: string = `rgba(255, 0, 0, ${(1 - intensities[i]) / 1.5})`
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

        this.destroyHighlight()
        this.wasHighlighted = true

        // @ts-ignore
        $(this.element).highlightWithinTextarea({ highlight: highlights })

        // If the element had focus before, return it
        if (isFocused) {
            $(this.element).focus()
        }
    }

    /**
     * Remove the binded HighlightWithinTextarea object. This is necessary for performance purposes.
     */
    private destroyHighlight(): void {
        if (this.wasHighlighted) {
            // @ts-ignore
            $(this.element).highlightWithinTextarea('destroy');
        }
    }
}

let highlighter_source: Highlighter = new Highlighter($('#input_source'))
let highlighter_target: Highlighter = new Highlighter($('#input_target'))

// export highlighter singletons
export { highlighter_source, highlighter_target }