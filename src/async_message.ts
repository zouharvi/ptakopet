import {IndicatorManager} from './indicator_manager'

/**
 * AsyncMsg sends an AJAX request, but notes message id and if 
 * the incomming message would drop an increasing sequence,
 * the message is dropped instead.
 */
export class AsyncMessage {
    protected msgRec: number = 0
    protected msgNext: number = 1
    public indicatorHandle? : IndicatorManager

    public addIndicator(indicatorHandle: IndicatorManager) {
        this.indicatorHandle = indicatorHandle;
    }

    /**
     * Compares the incomming message index to the latest received ID
     * and possibly increase the latter
     */
    private receiveCheck(msgIndex: number): boolean {
        if (this.msgRec > msgIndex) {
            return false;
        } else {
            if(this.indicatorHandle != undefined) {
                this.indicatorHandle.add(msgIndex - this.msgRec)
            }
            this.msgRec = msgIndex;
            return true;
        }
    }

    /**
     * Sends an AJAX request and if the response lands back before the
     * following one, invoke callback
     */
    public dispatch = (ajaxParams: JQuery.AjaxSettings<any>, callback: (data: any) => void): void => {
        let msgCurrent = this.msgNext
        this.msgNext++


        if(this.indicatorHandle != undefined) {
            this.indicatorHandle.add(-1)
        }

        // TODO: merge the arguments and use existing callback property
        // Eg. save it and wrap it in custom callback

        ajaxParams.success = (a: any, b: any, c: any) => {
            console.log(a, b, c)
            callback("as")
            console.log(this)
            if (this.receiveCheck(msgCurrent)) {
                callback("")
            }
        }

        $.ajax(ajaxParams);
    }


    // protected dispatch(ajaxParams: JQuery.AjaxSettings<any>): void {
    //     ajaxParams.success = ((a: any, b: any) => {
    //         this.receiveCheck(0)
    //     }).bind(this)

    //     $.ajax(ajaxParams);
    // }
}