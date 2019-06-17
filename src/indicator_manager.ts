export class IndicatorManager {
    constructor(indicator: JQuery<HTMLElement>) {

    }

    private n: number = 0
    public add(n: number) {
        this.n += n
    }
}