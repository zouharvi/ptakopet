/**
 * This class manages the 
 */
export class Highlighter {
    private identifier: string
    public constructor(identifier: string) {
        this.identifier = identifier
        let element = $(identifier)
        
        // pravent drag-droping images
        element.bind('dragover drop', (e) => {
            e.preventDefault();
            return false;
        });

        // prevent pasting images
        // @ts-ignore
        element.on('paste', function (e) {
            e.preventDefault();
            var text = '';
            // @ts-ignore
            if (e.clipboardData || e.originalEvent.clipboardData) {
                // @ts-ignore
                text = (e.originalEvent || e).clipboardData.getData('text/plain');
                // @ts-ignore
            } else if (window.clipboardData) {
                // @ts-ignore
                text = window.clipboardData.getData('Text');
            }
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, text);
            } else {
                document.execCommand('paste', false, text);
            }
        });

        // make the div actually editable
        if (element.attr('contenteditable') != 'true') {
            element.attr('contenteditable', 'true')
        }
    }

    public highlight(intensities: [Number]): void {
        // @TODO
    }
}