import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { Utils } from "./utils"

export abstract class Translator extends AsyncMessage {
    private throttler = new Throttler(500);

    public translate_throttle() {
        this.throttler.throttle(this.translate)
    }

    protected abstract translate(): void
    protected abstract backend: TranslatorBackend
}

export class TranslatorSource extends Translator {
    protected backend: TranslatorBackend = TranslatorBackends.ufalTransformer

    protected translate() {
        console.log('Dispatching: ', $('#input_source').val())
        this.dispatch(
            {
                type: "POST",
                url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/languages",
                data: { src: 'en', tgt: 'cs', input_text: "hello" },
                async: true,
            },
            () => { console.log('hello jello') }
        )
    }
}

type TranslatorBackend = {
    composeRequest: (text: string, sourceLang: string, targetLang: string) => JQuery.AjaxSettings,
    languages: Array<[string, string]>,
}

let TranslatorBackends = {
    ufalTransformer: {
        composeRequest(text: string, sourceLang: string, targetLang: string): JQuery.AjaxSettings {
            return {}
        },
        languages: Utils.generatePairs(['cs', 'en', 'fr', 'hi'], false),
    }
}