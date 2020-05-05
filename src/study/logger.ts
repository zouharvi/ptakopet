import { waiter } from './waiter'
import { Utils } from '../misc/utils'
/*
 * Logger proxies log actions to server with AJAX. It also contains some rudimentary
 * session id generation which is used to separate data between instances.
 */

export enum LogAction {
    START, END,
    NEXT,
    CONFIRM_OK, CONFIRM_SKIP,
    TRANSLATE1, TRANSLATE2,
    PARAPHRASE,
    ESTIMATE, ALIGN,
    LANG_CHANGE
}

export class Logger {
    public questionIndex: number = 0
    private sessionID: string
    private running: boolean = false

    // Reexport LogAction enum
    public Action = LogAction

    constructor() {
        this.sessionID = Utils.randomString(10)
    }

    /**
     * Switch Logger globally on or off
     */
    public on(running: boolean = true) {
        this.running = running
    }

    /**
     * Log extra
     */
    public log(action: LogAction, extra: object = {}): void {
        if (this.running) {
            this.dispatch(action, extra)
        }
    }

    /**
     * Send logged data to the loggin server
     */
    private dispatch(action: LogAction, extra: object): void {
        // Reverse enum mapping is not guaranteed!
        let data = {
            sessionID: this.sessionID,
            userID: waiter.userID + '-' + waiter.bakedBlock,
            action: LogAction[action],
            // Date.now() returns epoch number in milliseconds
            time: Date.now(),
            ...extra,
        }
        $.ajax({
            method: 'POST',
            url: 'https://quest.ms.mff.cuni.cz/zouharvi/log',
            data: data,
        }).done((data: any) => {
            console.log('LOG', LogAction[action], data)
        })
    }
}


let logger = new Logger()
export { logger }