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
     * Returns all elements, which appear on the left side of this pair
     * @param arr Array from which elements are extracted
     */
    export function leftUnique<R, T>(arr: Array<[R, T]>) : Array<R> {
        let left: Array<R> = arr.map((a:[R,T]) => { return a[0]} )
        return [...new Set(left)]
    }

    /**
     * Returns all elements, which appear on the left side of this pair
     * @param arr Array from which elements are extracted
     */
    export function leftDerivative<R, T>(elem: R, arr: Array<[R, T]>) : Array<T> {
        let ok: Array<[R, T]> = arr.filter((a) => (a[0] == elem))
        let right: Array<T> = ok.map((a:[R,T]) => { return a[1]} )
        return right
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