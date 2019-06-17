/**
 * @TODO
 */
export class IndicatorManager {
    /**
     * @TODO
     * @param indicator 
     */
    constructor(indicator: JQuery<HTMLElement>) {
        this.indicator = indicator
    }

    private n: number = 0
    private indicator: JQuery<HTMLElement>

    /**
     * @TODO
     * @param n 
     */
    public add(n: number) {
        this.n += n

        if(this.n < 0) {
            this.indicator.fadeIn()
        } else {
            this.indicator.fadeOut()
        }
    }
}