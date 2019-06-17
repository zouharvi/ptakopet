/**
 * Throttles events until a given delay follows. 
 * Used mostly for keyboard input.
 */
export class Throttler {
    private activationDelay : number
    private timeoutId : number | undefined

    /**
     * @param activationDelay Delay after which the latest request is fired.
     */
    public constructor(activationDelay: number) {
        this.activationDelay = activationDelay
    }
    
    /**
     * Reset the previous delay and add new one. 
     * @param func Function which is eventually called.
     */
    public throttle(func: () => any) {
        if(this.timeoutId != undefined) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(func, this.activationDelay);   
    }
}