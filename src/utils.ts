/**
 * Utils contains miscellaneous generic functions, mostly for data strucutres manipulation and text processing.
 * It has a role of a static class.
 */
export module Utils {
    /**
     * Generates pair tuples from single array.
     * @param arr Array from which pairs are created.
     * @param reflexive If false, pairs in the form (a, a) are omitted.
     */
    export function generatePairs<R>(arr: Array<R>, reflexive: boolean = true) : Array<[R, R]> {
        let out : Array<[R, R]> = []
        for(let i in arr) {
            for(let j in arr) {
                if(i == j && !reflexive) {
                    continue;
                }
                out.push([arr[i], arr[j]])
            }
        }
        return out
    }

    /**
     * All supported languages have their language code stored here
     */
    export type LanguageCode = 'cs' | 'en' | 'fr' | 'hi' | 'de'

    /**
     * Storage for language code <-> language name relation.
     */
    let _langCodeToName = {
        cs: 'Czech',
        en: 'English',
        fr: 'French',
        hi: 'Hindi',
        de: 'German',
    } as {[K in LanguageCode]?: string}
    
    /**
     * Returns a name of a language correspoding to given code. Throws an error if code is not recognized.
     * @param code Language code. 
     */
    export function languageName(code: LanguageCode) : string | undefined {
        let a = _langCodeToName[code]
        if(code in _langCodeToName) {
            return _langCodeToName[code]
        } else {
            throw new Error('Unknown language code: `' + code + '`')
        }
    }
}

/**
 * Reexporting LanguageCode type
 */
export type LanguageCode = Utils.LanguageCode