
function ptakopet_arch_ready() {
    ptakopet.position_left = typeof(localStorage.ptakopet_position_left)=="undefined"?true:localStorage.ptakopet_position_left=='true';
    ptakopet.floater = $('#ptakopet_floater')
    ptakopet.dir_button = $('#ptakopet_dir');
    ptakopet.ta1 = $('#ptakopet_ta1');
    ptakopet.ta2 = $('#ptakopet_ta2');
    ptakopet.getURL = function(a) { return ($('#ptakopet_base_url_span').html()) + a; }
    
    ptakopet.refresh_floater_pos = function() {
        // change the actuall position
        ptakopet.floater.css(ptakopet.position_left?'left':'right', '20px');
        ptakopet.floater.css(!ptakopet.position_left?'left':'right', '');
    
        // change the icon
        ptakopet.position_left?
            ptakopet.dir_button.attr('class', 'fa fa-arrow-right') :
            ptakopet.dir_button.attr('class', 'fa fa-arrow-left');
    }
    
    // atrap text inputs
    $('input[type=text]').each(function(i, obj) {
        let trigger_id = 'ptakopet_i' + i;
        $('html').append('<img src="' + ptakopet.getURL('../src/logo_bird_mini.png') + '" class="ptakopet_trigger_bird" id="' + trigger_id + '">');
        let trigger_obj = $('#' +trigger_id);

        // add button with hash id
        $(obj).focusin(function(a, b) {
            trigger_obj.css('visibility', 'visible');
            let parent_offset = $(obj).offset();
            trigger_obj.offset({top: parent_offset.top, left: parent_offset.left+200});
            ptakopet.cur_input = $(obj);
        })

        $(obj).focusout(function(a, b) {
            // dirty trick to make the click event fire before the button disappears
            window.setTimeout(function() {
                $('#' +trigger_id).css('visibility', 'hidden');
            }, 700);
        })

        trigger_obj.click(function(a, b) {
            ptakopet.floater.css('visibility', 'visible');
            // ptakopet.cur_input.focus();
        })
    });

    // atrap ptakopet text areas
    ptakopet.ta1.on('input', function(a, b) {
        ptakopet.translator.translate(
            ptakopet.ta1.val(),
            function(translation) {
                if(typeof(ptakopet.cur_input) != 'undefined') {
                    ptakopet.cur_input.val(translation);
                }
            });
    });
    
    ptakopet.refresh_floater_pos();
    // bind top bar buttons
    $("#ptakopet_dir").click(function(e) {
        localStorage.ptakopet_position_left = ptakopet.position_left = !ptakopet.position_left;
        ptakopet.refresh_floater_pos();
    });
    $("#ptakopet_close").click(function(e) {
        ptakopet.floater.css('visibility', 'hidden');
    });

}