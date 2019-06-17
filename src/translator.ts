import { AsyncMessage } from "./async_message"
import { Throttler } from "./throttler"
import { Utils } from "./utils"

export interface Translator {
    translate_throttle(): void
}

export class TranslatorSource extends AsyncMessage implements Translator {
    private throttler = new Throttler(500);
    private backend: TranslatorBackend = TranslatorBackends.ufalTransformer

    constructor() {
        super($(''))
    }

    public translate_throttle() {
        this.throttler.throttle(this.translate)
    }

    private translate() {
        console.log($('#input_source').val())
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