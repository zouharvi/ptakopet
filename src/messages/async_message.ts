import { IndicatorManager } from '../page/indicator_manager'

/**
 * AsyncMessage resolves a promise, notes message id and if 
 * the incoming message would drop an increasing sequence,
 * the message is dropped instead.
 */
export class AsyncMessage {
    protected msgRec: number = 0
    protected msgNext: number = 1
    public indicatorHandle?: IndicatorManager

    public addIndicator(indicatorHandle: IndicatorManager) {
        this.indicatorHandle = indicatorHandle
    }

    /**
     * Compares the incoming message index to the latest received ID
     * and possibly increase the latter
     */
    private receiveCheck(msgIndex: number): boolean {
        if (this.msgRec > msgIndex) {
            return false
        } else {
            if (this.indicatorHandle != undefined) {
                this.indicatorHandle.add(msgIndex - this.msgRec)
            }
            this.msgRec = msgIndex
            return true
        }
    }

    /**
     * Resolves a promise and if the response lands back before the
     * following one, invokes callback
     */
    public dispatch<T>(message: Promise<T>, callback: (data: T) => void): void {
        let msgCurrent = this.msgNext
        this.msgNext++

        if (this.indicatorHandle != undefined) {
            this.indicatorHandle.add(-1)
        }

        message.then(
            (text) => {
                // If in an increasing sequence invoke callback
                if (this.receiveCheck(msgCurrent)) {
                    callback(text)
                }
            },
            (_:any) => {
                // Do nothing except for fix the message id
                this.receiveCheck(msgCurrent)
            }
        )
    }
}