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
}