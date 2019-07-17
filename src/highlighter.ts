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
        element.on('input', (e) => {
            this.highlight([0.5, 0.1])
        });
    }

    /**
     * Highlight the element based on numeric intensities.
     * @param intensities Numeric [0, 1] intensities of target words. The length must match the number of tokenized words.
     */
    public highlight(intensities: Array<Number>): void {
        let indicies: Array<[number, number]> = Highlighter.tokenizeIndicies($(this.element).val() as string)
        let highlights: Array<{ highlight: [number, number], className: string}> = []
        let i: number
        for(i = 0; i < intensities.length; i++) {
            highlights.push({highlight: indicies[i], className: 'style="background-color: red;"'})
        }
        if(i != indicies.length) {
            console.error("Something bad happened - tokens and quest length doesn't match")
        }
        // @ts-ignore
        $(this.element).highlightWithinTextarea({highlight: highlights})
        // @TODO: focus only if it was focused before
        $(this.element).focus()
    }

    /**
     * Returns indicies (beginning and end character position) of tokenized output.
     * @param raw Raw input string.
     */
    private static tokenizeIndicies(raw: string): Array<[number, number]> {
        let arr: Array<[number, number]> = []
        let words: Array<string> = Highlighter.tokenize(raw)
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

    /**
     * Tokenize input string according to some basic rules (collapse whitespace, newlines etc)
     * @param raw Raw input string
     */
    private static tokenize(raw: string): Array<string> {
        let res: Array<string> = Highlighter.clean(raw).split(' ').join('\n').split('\n')
        return res
    }

    /**
     * Cleans up `contenteditable` div styling, applies some basic rules (collapse whitespace, newlines etc)
     * @deprecated
     * @param raw Input HTML string 
     */
    private static clean(raw: string): string {
        let res: string = raw
            .replace(new RegExp('<p>', 'g'), '') // clean leading tags
            .replace(new RegExp('(<br>|\n|</p>)+', 'g'), '\n') // collapse multiple newlines into one
            .replace(new RegExp('( |&nbsp;)+', 'g'), ' ') // collapse multiple spaces into one
            .replace(new RegExp('( |&nbsp;)\n', 'g'), '\n') // collapse trailing space with newline to newline
            .replace(new RegExp('( |\n)$', 'g'), '') // remove trailing newline/space
            .replace(new RegExp('<span[^>]*>|<\/span>', 'g'), '') // remove styling tags
        return res
    }
}