var PTAKOPET_ARCH_LOADED = true;

function ptakopet_arch_ready() {
    ptakopet.position_left = typeof(localStorage.ptakopet_position_left)=="undefined"?true:localStorage.ptakopet_position_left=='true';
    ptakopet.floater = $('#ptakopet_floater')
    ptakopet.dir_button = $('#ptakopet_dir');
    ptakopet.ta1 = $('#ptakopet_ta1');
    ptakopet.ta2 = $('#ptakopet_ta2');
    ptakopet.language_select_1 = $('#ptakopet_language_select_1');
    ptakopet.language_select_2 = $('#ptakopet_language_select_2');
    ptakopet.fi = $('#ptakopet_floater_icon');
    ptakopet.engine_select = $('#ptakopet_engine_select');
    ptakopet.getURL = function(a) { return ($('#ptakopet_base_url_span').html()) + a; }
    let INPUT_SELECTOR = 'input[type=text], textarea:not(#ptakopet_ta1, #ptakopet_ta2)';
    if($(':focus').is(INPUT_SELECTOR))
        ptakopet.cur_input = $(':focus');
    
    ptakopet.refresh_floater_pos = function() {
        // change the actuall position
        ptakopet.floater.css(ptakopet.position_left?'left':'right', '10px');
        ptakopet.floater.css(!ptakopet.position_left?'left':'right', '');
    
        // change the icon
        ptakopet.position_left?
            ptakopet.dir_button.attr('class', 'fa fa-arrow-right') :
            ptakopet.dir_button.attr('class', 'fa fa-arrow-left');
    }

    ptakopet.language_select_1.change(function() {
        let new_lang = ptakopet.language_select_1.val();
        if(new_lang == ptakopet.translator.lang_2) {
            ptakopet.translator.lang_2 = ptakopet.translator.lang_1;
            ptakopet.language_select_2.val(ptakopet.translator.lang_1);
        }
        ptakopet.translator.lang_1 = new_lang;
    });
    ptakopet.language_select_2.change(function() {
        let new_lang = ptakopet.language_select_2.val();
        if(new_lang == ptakopet.translator.lang_1) {
            ptakopet.translator.lang_1 = ptakopet.translator.lang_2;
            ptakopet.language_select_1.val(ptakopet.translator.lang_2);
        }
        ptakopet.translator.lang_2 = new_lang;
    });

    // atrap text inputs
    $(INPUT_SELECTOR).each(function(i, obj) {
        // set trigger to focusin
        $(obj).focusin(function(a, b) {
            ptakopet.fi.css('visibility', 'visible');
            let parent_offset = $(obj).offset();
            let parent_width = $(obj).outerWidth();
            let parent_height = $(obj).height();
            ptakopet.fi.offset({top: parent_offset.top+1, left: parent_offset.left+parent_width+7});
            ptakopet.cur_input = $(obj);
            ptakopet.fi.css('max-width', parent_height-1);
        })
        
        // focusout handled implicitly
    });

    ptakopet.fi.click(function(a, b) {
        ptakopet.floater.css('visibility', 'visible');
        ptakopet.ta1.val(ptakopet.cur_input.val());
        // trigger input to start translate cascade
        ptakopet.ta1.trigger('input');
    })

    // atrap ptakopet text areas
    ptakopet.ta1.on('input', function(a, b) {
        ptakopet.translator.translate(
            ptakopet.ta1.val(),
            function(translation) {
                // backward translation
                ptakopet.translator.translate(translation, function(translation_rev) {
                    ptakopet.ta2.val(translation_rev);
                }, true);

                // set DOM value
                if(typeof(ptakopet.cur_input) != 'undefined') {
                    ptakopet.cur_input.val(translation);
                    ptakopet.cur_input.attr('value', translation);
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

    // if($('#ptakopet_in_tr_span').length != 0) {
    //     ptakopet.ta1.val($('#ptakopet_in_tr_span').html());
    // }

    if(typeof(ptakopet.cur_input) != 'undefined') {
        ptakopet.ta1.val(ptakopet.cur_input.val());
    }

    // settings 
    $('#ptakopet_settings_small_font').change(function() {
        if($(this).is(":checked")) {
            ptakopet.ta1.css('font-size', '11px');
            ptakopet.ta2.css('font-size', '11px');
        } else {
            ptakopet.ta1.css('font-size', '');
            ptakopet.ta2.css('font-size', '');
        }
    })
}

function ptakopet_arch_show() {
    ptakopet.floater.css("display", "block");
    ptakopet.ta1.focus();
}