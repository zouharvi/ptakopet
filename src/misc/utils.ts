/**
 * Utils contains miscellaneous generic functions, mostly for data structures manipulation and text processing.
 * It has a role of a static class.
 */
export module Utils {
    /**
     * Generates pair tuples from single array.
     * @param arr Array from which pairs are created.
     * @param reflexive If false, pairs in the form (a, a) are omitted.
     */
    export function generatePairsArray<R>(arr: Array<R>, reflexive: boolean = true): Set<[R, R]> {
        let out: Set<[R, R]> = new Set<[R, R]>()
        for (let i in arr) {
            for (let j in arr) {
                if (i == j && !reflexive) {
                    continue
                }
                out.add([arr[i], arr[j]])
            }
        }
        return out
    }

    /**
     * Generates pair tuples from single set.
     * @param set Set from which pairs are created.
     * @param reflexive If false, pairs in the form (a, a) are omitted.
     */
    export function generatePairsSet<R>(set: Set<R>, reflexive: boolean = true): Set<[R, R]> {
        let out: Set<[R, R]> = new Set<[R, R]>()
        set.forEach((a) => {
            set.forEach((b) => {
                if (a != b || reflexive) {
                    out.add([a, b])
                }
            })
        })
        return out
    }

    /**
     * Returns all elements, which appear on the left side of this pair
     * @param arr Array from which elements are extracted
     */
    export function leftUnique<R, T>(arr: Array<[R, T]>): Array<R> {
        let left: Array<R> = arr.map((a: [R, T]) => { return a[0] })
        return [...new Set(left)]
    }

    /**
     * Returns all elements, which appear on the right side of this pair
     * @param arr Array from which elements are extracted
     */
    export function rightUnique<R, T>(arr: Array<[R, T]>): Array<T> {
        let right: Array<T> = arr.map((a: [R, T]) => { return a[1] })
        return [...new Set(right)]
    }

    /**
     * Returns all elements on the right from tuples which have @param elem on the left
     * @param arr Array from which elements are extracted
     */
    export function leftDerivative<R, T>(elem: R, arr: Array<[R, T]>): Array<T> {
        let ok: Array<[R, T]> = arr.filter((a) => (a[0] == elem))
        let right: Array<T> = ok.map((a: [R, T]) => { return a[1] })
        return right
    }


    /**
     * Returns all elements, which appear on the left side of this pair
     * @param arr Set from which elements are extracted
     */
    export function leftUniqueSet<R, T>(arr: Set<[R, T]>): Set<R> {
        let out: Set<R> = new Set<R>()
        arr.forEach((a: [R, T]) => { out.add(a[0]) })
        return out
    }

    /**
     * Returns all elements on the right from tuples which have @param elem on the left
     * @param arr Set from which elements are extracted
     */
    export function leftDerivativeSet<R, T>(elem: R, arr: Set<[R, T]>): Set<T> {
        let out: Set<T> = new Set<T>()
        arr.forEach((a: [R, T]) => {
            if (a[0] == elem) {
                out.add(a[1])
            }
        })
        return out
    }

    /**
     * Performs set difference
     * @param set Set from which elements are removed 
     * @param toRemove Set of removees
     */
    export function setDifference<R>(set: Set<R>, toRemove: Set<R>): Set<R> {
        toRemove.forEach((a: R) => {
            set.delete(a)
        })
        return set
    }

    /**
     * Performs set union
     * @param setA 
     * @param setB 
     */
    export function setUnion<R>(setA: Set<R>, setB: Set<R>): Set<R> {
        setB.forEach((a: R) => {
            setA.add(a)
        })
        return setA
    }

    /**
     * Check whether an array of array contains a given array by joining all elements with '-'
     * @param arr Haystack
     * @param elem Needle
     */
    export function arrayContainsArray<R>(arr: Array<Array<R>>, elem: Array<R>): boolean {
        return (arr.map((a) => a.join('-')).indexOf(elem.join('-')) > -1)
    }

    /**
     * Check whether a set of array contains a given array by joining all elements with '-'
     * @param arr Haystack
     * @param elem Needle
     */
    export function setContainsArray<R>(arr: Set<Array<R>>, elem: Array<R>): boolean {
        for (let a of arr.values()) {
            if (a.join('-') == elem.join('-')) {
                return true
            }
        }
        return false
    }

    /**
     * All supported languages have their language code stored here
     */
    export type LanguageCode = 'cs' | 'en' | 'fr' | 'ru' | 'hi' | 'de' | 'pl' | 'es' | 'et' | 'lt' | 'hu'

    /**
     * Storage for language code <-> language name relation.
     */
    let _langCodeToName = {
        cs: 'Czech',
        en: 'English',
        fr: 'French',
        ru: 'Russian',
        es: 'Spanish',
        hi: 'Hindi',
        de: 'German',
        pl: 'Polish',
        et: 'Estonian',
        lt: 'Lithuanian',
        hu: 'Hungarian',
    } as { [K in LanguageCode]: string }

    /**
     * All available languages
     */
    export let Languages: Set<LanguageCode> = new Set<LanguageCode>(Object.keys(_langCodeToName) as Array<LanguageCode>)


    /**
     * Returns a name of a language corresponding to given code. Throws an error if code is not recognized.
     * @param code Language code. 
     */
    export function languageName(code: LanguageCode): string | undefined {
        let a = _langCodeToName[code]
        if (code in _langCodeToName) {
            return _langCodeToName[code]
        } else {
            throw new Error('Unknown language code: `' + code + '`')
        }
    }

    /**
     * Returns associative array of GET parameters
     **/
    export function parseGETParams(): { [key: string]: string } {
        let queryString: string = window.location.search.substring(1)

        let params: { [key: string]: string } = {}
        let queries = queryString.split("&")

        queries.forEach((indexQuery: string) => {
            let indexPair = indexQuery.split("=")
            let queryKey = decodeURIComponent(indexPair[0])
            let queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "")
            params[queryKey] = queryValue
        })

        return params
    }

    /**
     * Generate random alphanumeric string
     * @param length: length of the target string
     */
    export function randomString(length: number): string {
        let result = ''
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let charactersLength = characters.length
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }
}

/**
 * Reexporting LanguageCode type
 */
export type LanguageCode = Utils.LanguageCode
