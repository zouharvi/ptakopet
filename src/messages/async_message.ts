import { IndicatorManager } from '../page/indicator_manager'
import { TranslatorSource } from './translator'

/**
 * AsyncMessage resolves a promise, notes message id and if 
 * the incoming message would drop an increasing sequence,
 * the message is dropped instead.
 */
export class AsyncMessage {
    protected msgRec: number = 0
    protected msgNext: number = 1

    constructor(public indicatorHandle?: IndicatorManager) { }

    /**
     * Add indicator to distinguish msgRec <= msgNext-1
     * @deprecated
     */
    public addIndicator(indicatorHandle: IndicatorManager) {
        this.indicatorHandle = indicatorHandle
    }

    /**
     * Compares the incoming message index to the latest received ID
     * and possibly increase the latter
     */
    private receiveCheck(msgIndex: number): boolean {
        if (this.msgRec >= msgIndex) {
            return false
        } else {
            // Bug in TS preventing from the use of optional chaining
            if (this.indicatorHandle != undefined) {
                this.indicatorHandle.add(msgIndex - this.msgRec)
            }
            this.msgRec = msgIndex
            return true
        }
    }

    /**
     * Makes all promises obsolete.
     */
    public cancel() {
        // Bug in TS preventing from the use of optional chaining
        if (this.indicatorHandle != undefined) {
            this.indicatorHandle.reset()
        }

        this.msgRec = this.msgNext
        this.msgNext += 1
    }

    /**
     * Resolves a promise and if the response lands back before the
     * following one, invokes callback
     */
    public dispatch<T>(message: Promise<T>, callback?: (data: T) => void): void {
        let msgCurrent = this.msgNext
        this.msgNext++

        if (this.indicatorHandle != undefined) {
            this.indicatorHandle.add(-1)
        }

        message.then(
            (data) => {
                // If in an increasing sequence invoke callback
                if (this.receiveCheck(msgCurrent) && callback) {
                    callback(data)
                }
            },
            (_: any) => {
                // Do nothing except for fix the message id
                this.receiveCheck(msgCurrent)
            }
        )
    }
}