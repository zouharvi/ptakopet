/**
 * TextUtils contains miscellaneous text processing functions
 * It has a role of a static class.
 */
export module TextUtils {
    /**
     * Cleans up `contenteditable` div styling, applies some basic rules (collapse whitespace, newlines etc)
     * @deprecated
     * @param raw Input HTML string 
     */
    export function clean(raw: string): string {
        let res: string = raw
            .replace(new RegExp('\\.', 'g'), ' . ') // add space around .
            .replace(new RegExp(',', 'g'), ' , ') // add space around ,
            .replace(new RegExp('<p>', 'g'), '') // clean leading tags
            .replace(new RegExp('^\\s+', 'g'), '') // clean leading space
            .replace(new RegExp('(<br>|\n|</p>)+', 'g'), '\n') // collapse multiple newlines into one
            .replace(new RegExp('( |&nbsp;)+', 'g'), ' ') // collapse multiple spaces into one
            .replace(new RegExp('( |&nbsp;)\n', 'g'), '\n') // collapse trailing space with newline to newline
            .replace(new RegExp('( |\n)$', 'g'), '') // remove trailing newline/space
            .replace(new RegExp('<span[^>]*>|<\/span>', 'g'), '') // remove styling tags
        return res
    }

    /**
     * Returns indices (beginning and end character position) of tokenized output.
     * @param raw Raw input string.
     */
    export function tokenizeIndices(raw: string, tokens: Array<string>): Array<[number, number]> {
        let out: Array<[number, number]> = []

        let newRaw: string = raw.slice(0)
        let buff = 0
        for (let tok of tokens) {
            let occurence = newRaw.indexOf(tok)
            if (occurence == -1) {
                throw new Error("Tokenization does not match the raw text.")
            } else {
                out.push([buff + occurence, buff + occurence + tok.length])
                buff += occurence + tok.length
                newRaw = newRaw.slice(occurence + tok.length)
            }
        }

        return out
    }

    /**
     * Decode HTML entities
     * @param raw 
     */
    export function decodeHTMLEntities(raw: string) {
        var translate_re = /&(nbsp|amp|apos|quot|lt|gt);/g;
        var translate: { [index: string]: string } = {
            "nbsp": " ",
            "amp": "&",
            "apos": "'",
            "quot": '"',
            "lt": "<",
            "gt": ">"
        };
        return raw.replace(translate_re, function (match, entity) {
            return translate[entity];
        }).replace(/&#(\d+);/gi, function (match, numStr) {
            var num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }

    /**
     * Compare two strings, but by human standards
     * @param str1 
     * @param str2 
     */
    export function vagueEqual(str1: string, str2: string): boolean {
        return str1.toLowerCase().trim() == str2.toLowerCase().trim()
    }
}
