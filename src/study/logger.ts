import { waiter } from './waiter.ts'
/*
 * @TODO: Documentation
 */

export enum LogAction { NEXT, CONFIRM, TRANSLATE1, TRANSLATE2, ESTIMATE, ALIGN, LANG_CHANGE }
export class Logger {
    questionIndex: number = 0
    private sessionId: string
    private running: boolean = false
    // Reexport LogAction enum
    public Action = LogAction

    constructor() {
        this.sessionId = this.randomString(7)
    }
    
    private randomString(length: number): string {
        return Math.random().toString(36).substring(length);
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
            sessionId: this.sessionId,
            userId: waiter.userId,
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
