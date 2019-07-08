/**
 * Manages indicator fading
 */
class IndicatorManager {
    constructor(indicator: JQuery<HTMLElement>) {
        this.indicator = indicator
    }

    private n: number = 0
    private indicator: JQuery<HTMLElement>

    /**
     * Manages indicator fading
     * @param n 
     */
    public add(n: number) {
        this.n += n

        if(this.n < 0) {
            this.indicator.animate({opacity: 1}, 500)
        } else {
            this.indicator.animate({opacity: 0}, 500)
        }
    }
}

var indicator_translator: IndicatorManager = new IndicatorManager($('#indicator_translator'))
export { indicator_translator }