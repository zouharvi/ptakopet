import { Translator } from "../messages/translator";
import { Estimator } from "../messages/estimator";
import { LanguageCode } from "./utils";
import { Aligner } from "../messages/aligner";
import { Tokenizer } from "../messages/tokenizer";
import { Paraphraser } from "../messages/paraphraser";

// Workaround before Promise.allSettled gets into mainstream
declare interface PromiseConstructor {
    allSettled(promises: Array<Promise<any>>): Promise<Array<{ status: 'fulfilled' | 'rejected', value?: any, reason?: any }>>;
}

/**
 * Small static class for testing the system
 */
export class Tester {
    /**
     * Put heavy workload on changing the input field with interval.
     */
    public static workload(): void {
        $('#tester_notification').show()
        $('#tester_notification_content').append('Performing indefinite workload test.')

        let TIMEOUT = 5200
        function writeA() {
            $('#input_source').val('Ahoj, jak se dnes máte.');
            $('#input_source').trigger('input')
            window.setTimeout(writeB, TIMEOUT)
        }
        function writeB() {
            $('#input_source').val('Ahoj, jak se zítra máte?');
            $('#input_source').trigger('input')
            window.setTimeout(writeA, TIMEOUT)
        }
        writeA()
    }

    /**
     * Check backend services availability
     */
    public static async services() {
        $('#tester_notification').show()
        let element: JQuery<HTMLDivElement> = $('#tester_notification_content')
        let appendMessage = (text: string) => element.append(`<div>${text}</div>`)
        let appendTitle = (text: string) => element.append(`<h4>${text}</h4>`)
        let promises: Array<Promise<any>>

        appendTitle("Translators")
        promises = Object.keys(Translator.backends).map((key) => {
            let backend = Translator.backends[key]
            let languages = backend.default
            let name = `${backend.name} (${languages[0]}-${languages[1]})`
            return backend.composeRequest(languages, "Hello there")
                .then(() => appendMessage(`OK - ${name}`), () => appendMessage(`ERROR - ${name}`))
        })
        await Promise.allSettled(promises)

        appendTitle("Estimators")
        promises = Object.keys(Estimator.backends).map((key) => {
            let backend = Estimator.backends[key]
            let languages: [LanguageCode, LanguageCode] = Array.from(backend.languages)[0]
            let name = `${backend.name} (${languages[0]}-${languages[1]})`
            let extra = {
                "data": [
                    { "sent": "Tere, kuidas teil läheb?", "sent_score": -0.04982418566942215, "token_scores": [-0.0008917645900510252, -0.003657795488834381, -0.15138748288154602, -0.18744874000549316, -0.0034941136837005615, -0.0018630623817443848], "tokens": ["▁Tere", ",", "▁kuidas", "▁teil", "▁läheb", "?"] }
                ],
                "options": {
                    "bpe_format": "marian", "eos": false
                },
                "alignment": [[0, 0], [1, 1], [2, 2], [5, 3], [5, 4], [6, 5]],
                silent: true
            }
            return backend.composeRequest(languages, ["Hello there", "Ahoj tady"], extra)
                .then(() => appendMessage(`OK - ${name}`), () => appendMessage(`ERROR - ${name}`))
        })
        await Promise.allSettled(promises)

        appendTitle("Paraphrasers")
        promises = Object.keys(Paraphraser.backends).map((key) => {
            let backend = Paraphraser.backends[key]
            let language: LanguageCode = Array.from(backend.languages)[0]
            let name = `${backend.name} (${language})`
            return backend.composeRequest(language, "Hello there")
                .then(() => appendMessage(`OK - ${name}`), () => appendMessage(`ERROR - ${name}`))
        })
        await Promise.allSettled(promises)

        appendTitle("Aligners")
        promises = Object.keys(Aligner.backends).map((key) => {
            let backend = Aligner.backends[key]
            let languages: [LanguageCode, LanguageCode] = Array.from(backend.languages)[0]
            let name = `${backend.name} (${languages[0]}-${languages[1]})`
            return backend.composeRequest(languages, ["Hello there", "Ahoj tady"])
                .then(() => appendMessage(`OK - ${name}`), () => appendMessage(`ERROR - ${name}`))
        })
        await Promise.allSettled(promises)

        appendTitle("Tokenizers")
        promises = Object.keys(Tokenizer.backends).map((key) => {
            let backend = Tokenizer.backends[key]
            let language: LanguageCode = 'en'
            let name = `${backend.name} (${language})`
            return backend.composeRequest("Hello there.", language)
                .then(() => appendMessage(`OK - ${name}`), () => appendMessage(`ERROR - ${name}`))
        })
        await Promise.allSettled(promises)

        appendTitle("Done")
    }
}