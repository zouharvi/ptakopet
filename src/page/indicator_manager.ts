/**
 * Manages indicator fading
 */
export class IndicatorManager {
    constructor(indicator: JQuery<HTMLElement>) {
        this.indicator = indicator
    }

    public n: number = 0
    private indicator: JQuery<HTMLElement>

    /**
     * Manages indicator fading
     * @param n Balance (on iff n < 0)
     */
    public add(n: number) {
        if (n == 0) {
            return;
        }
        this.n += n

        this.futureCheck()
    }

    private futureCheck(): void {
        window.setTimeout(() => {
            this.presentCheck()
        }, 200)
    }

    private presentCheck(): void {
        if (this.n < 0) {
            this.indicator.animate({ opacity: 1 }, 100)
        } else {
            this.indicator.animate({ opacity: 0 }, 100)
        }
    }

    /**
     * Returns to the initial state
     */
    public reset() {
        this.n = 0
        this.add(0)
        this.presentCheck()
    }
}