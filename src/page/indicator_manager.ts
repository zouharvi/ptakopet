/**
 * Manages indicator fading
 */
export class IndicatorManager {
    constructor(indicator: JQuery<HTMLElement>) {
        this.indicator = indicator
    }

    private n: number = 0
    private indicator: JQuery<HTMLElement>

    /**
     * Manages indicator fading
     * @param n Balance (on iff n < 0)
     */
    public add(n: number) {
        this.n += n

        if(this.n < 0) {
            this.indicator.animate({opacity: 1}, 300)
        } else {
            this.indicator.animate({opacity: 0}, 300)
        }
    }
}