/**
 * TextUtils contains miscellaneous text processing functions
 * It has a role of a static class.
 */
export module TextUtils {
    /**
     * Tokenize input string according to some basic rules (collapse whitespace, newlines etc)
     * @param raw Raw input string
     */
    export function tokenize(raw: string): Array<string> {
        let res: Array<string> = TextUtils.clean(raw).split(' ').join('\n').split('\n')
        return res
    }

    /**
     * Cleans up `contenteditable` div styling, applies some basic rules (collapse whitespace, newlines etc)
     * @deprecated
     * @param raw Input HTML string 
     */
    export function clean(raw: string): string {
        let res: string = raw
            .replace(new RegExp('<p>', 'g'), '') // clean leading tags
            .replace(new RegExp('(<br>|\n|</p>)+', 'g'), '\n') // collapse multiple newlines into one
            .replace(new RegExp('( |&nbsp;)+', 'g'), ' ') // collapse multiple spaces into one
            .replace(new RegExp('( |&nbsp;)\n', 'g'), '\n') // collapse trailing space with newline to newline
            .replace(new RegExp('( |\n)$', 'g'), '') // remove trailing newline/space
            .replace(new RegExp('<span[^>]*>|<\/span>', 'g'), '') // remove styling tags
        return res
    }

    /**
     * Returns indicies (beginning and end character position) of tokenized output.
     * @param raw Raw input string.
     */
    export function tokenizeIndicies(raw: string, skipSpaces: boolean = true): Array<[number, number]> {
        let arr: Array<[number, number]> = []
        let words: Array<string> = TextUtils.tokenize(raw)
        // counts the number of all words
        let wordIndex: number = 0
        // count the number of spaces which to eventually substract
        let spaceBuffer: number = 0
        for (let i = 0; i < raw.length; i++) {
            if (raw.substring(i).indexOf(words[wordIndex]) == 0) {
                if(skipSpaces) {
                    arr.push([i, i + words[wordIndex].length])
                } else {
                    // if we want to add spaces to the next word, substract the spaceBuffer from the left index
                    arr.push([i - spaceBuffer, i + words[wordIndex].length])
                }
                i += words[wordIndex].length -1
                wordIndex++
                // reset space buffer
                spaceBuffer = 0
            } else {
                // not a word character, increase space buffer
                spaceBuffer++
            }
            // check if all words were found
            if (wordIndex >= words.length) {
                break
            }
        }
        return arr
    }
}