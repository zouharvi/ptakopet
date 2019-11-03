export class Tester {
    /**
     * Put heavy workload on changing the input field with interval.
     */
    public static workloadInput(): void {
        let TIMEOUT = 5200
        function writeA() {
            $('#input_source').val('Ahoj, jak se dnes máte.');
            $('#input_source').trigger('input')
            window.setTimeout(writeB, TIMEOUT)
        }
        function writeB() {
            $('#input_source').val('Ahoj, jak se zítra máte?');
            $('#input_source').trigger('input')
            window.setTimeout(writeA, TIMEOUT)
        }
        writeA()
    }
}