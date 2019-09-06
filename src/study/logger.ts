import { waiter } from './waiter.ts'
/*
 * Logger proxies log actions to server with AJAX. It also contains some rudimentary
 * session id generation which is used to separate data between instances.
 */

export enum LogAction { 
    START, END,
    NEXT, CONFIRM,
    TRANSLATE1, TRANSLATE2,
    ESTIMATE, ALIGN,
    LANG_CHANGE
}

export class Logger {
    questionIndex: number = 0
    private sessionID: string
    private running: boolean = false
    // Reexport LogAction enum
    public Action = LogAction

    constructor() {
        this.sessionID = this.randomString(10)
    }
    
    private randomString(length: number): string {
        let result = '';
        let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
   
    public on(running: boolean = true) {
        this.running = running
    }

    public log(action: LogAction, extra: object = {}) : void {
        if (this.running) {
            this.dispatch(action, extra)
        }
    }

    private dispatch(action: LogAction, extra: object) : void {
        // Reverse enum mapping is not guaranteed!
        let data = {
            sessionID: this.sessionID,
            userID: waiter.userID,
            action: LogAction[action],
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
