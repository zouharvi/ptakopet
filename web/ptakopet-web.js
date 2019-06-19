/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/async_message.ts":
/*!******************************!*\
  !*** ./src/async_message.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * AsyncMsg sends an AJAX request, but notes message id and if
 * the incomming message would drop an increasing sequence,
 * the message is dropped instead.
 */
var AsyncMessage = /** @class */ (function () {
    function AsyncMessage() {
        this.msgRec = 0;
        this.msgNext = 1;
        // protected dispatch(ajaxParams: JQuery.AjaxSettings<any>): void {
        //     ajaxParams.success = ((a: any, b: any) => {
        //         this.receiveCheck(0)
        //     }).bind(this)
        //     $.ajax(ajaxParams);
        // }
    }
    AsyncMessage.prototype.addIndicator = function (indicatorHandle) {
        this.indicatorHandle = indicatorHandle;
    };
    /**
     * Compares the incomming message index to the latest received ID
     * and possibly increase the latter
     */
    AsyncMessage.prototype.receiveCheck = function (msgIndex) {
        if (this.msgRec > msgIndex) {
            return false;
        }
        else {
            if (this.indicatorHandle != undefined) {
                this.indicatorHandle.add(msgIndex - this.msgRec);
            }
            this.msgRec = msgIndex;
            return true;
        }
    };
    /**
     * Sends an AJAX request and if the response lands back before the
     * following one, invoke callback
     */
    AsyncMessage.prototype.dispatch = function (ajaxParams, callback) {
        var _this = this;
        var msgCurrent = this.msgNext;
        this.msgNext++;
        if (this.indicatorHandle != undefined) {
            this.indicatorHandle.add(-1);
        }
        // TODO: merge the arguments and use existing callback property
        // Eg. save it and wrap it in custom callback
        ajaxParams.success = function (a, b, c) {
            console.log(a, b, c);
            callback("as");
            console.log(_this);
            if (_this.receiveCheck(msgCurrent)) {
                callback("");
            }
        };
        $.ajax(ajaxParams);
    };
    return AsyncMessage;
}());
exports.AsyncMessage = AsyncMessage;


/***/ }),

/***/ "./src/indicator_manager.ts":
/*!**********************************!*\
  !*** ./src/indicator_manager.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * @TODO
 */
var IndicatorManager = /** @class */ (function () {
    /**
     * @TODO
     * @param indicator
     */
    function IndicatorManager(indicator) {
        this.n = 0;
        this.indicator = indicator;
    }
    /**
     * @TODO
     * @param n
     */
    IndicatorManager.prototype.add = function (n) {
        this.n += n;
        if (this.n < 0) {
            this.indicator.fadeIn();
        }
        else {
            this.indicator.fadeOut();
        }
    };
    return IndicatorManager;
}());
exports.IndicatorManager = IndicatorManager;


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var translator_1 = __webpack_require__(/*! ./translator */ "./src/translator.ts");
var indicator_manager_1 = __webpack_require__(/*! ./indicator_manager */ "./src/indicator_manager.ts");
var translator_source = new translator_1.TranslatorSource();
var indicator_translator = new indicator_manager_1.IndicatorManager($('#indicator_translator'));
translator_source.addIndicator(indicator_translator);
var input_source = $('#input_source');
var input_target = $('#input_target');
var input_back = $('#input_back');
var select_source = $('#language_select_source');
var select_target = $('#language_select_target');
input_source.on('input', function () {
    translator_source.translate_throttle();
});
input_target.on('input', function () {
    // translator_target.translate_throttle()
});
// $('#main_content').html('<span>hello</span>' + $('#main_content').html())


/***/ }),

/***/ "./src/throttler.ts":
/*!**************************!*\
  !*** ./src/throttler.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * Throttles events until a given delay follows.
 * Used mostly for keyboard input.
 */
var Throttler = /** @class */ (function () {
    /**
     * @param activationDelay Delay after which the latest request is fired.
     */
    function Throttler(activationDelay) {
        this.activationDelay = activationDelay;
    }
    /**
     * Reset the previous delay and add new one.
     * @param func Function which is eventually called.
     */
    Throttler.prototype.throttle = function (func) {
        if (this.timeoutId != undefined) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(func, this.activationDelay);
    };
    return Throttler;
}());
exports.Throttler = Throttler;


/***/ }),

/***/ "./src/translator.ts":
/*!***************************!*\
  !*** ./src/translator.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var async_message_1 = __webpack_require__(/*! ./async_message */ "./src/async_message.ts");
var throttler_1 = __webpack_require__(/*! ./throttler */ "./src/throttler.ts");
var utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var Translator = /** @class */ (function (_super) {
    __extends(Translator, _super);
    function Translator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.throttler = new throttler_1.Throttler(500);
        return _this;
    }
    Translator.prototype.translate_throttle = function () {
        this.throttler.throttle(this.translate);
    };
    return Translator;
}(async_message_1.AsyncMessage));
exports.Translator = Translator;
var TranslatorSource = /** @class */ (function (_super) {
    __extends(TranslatorSource, _super);
    function TranslatorSource() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.backend = TranslatorBackends.ufalTransformer;
        _this.translate = function () {
            console.log('Dispatching: ', $('#input_source').val());
            _super.prototype.dispatch.call(_this, {
                type: "POST",
                url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/languages",
                data: { src: 'en', tgt: 'cs', input_text: "hello" },
                async: true,
            }, function () { console.log('hello jello'); });
        };
        return _this;
    }
    return TranslatorSource;
}(Translator));
exports.TranslatorSource = TranslatorSource;
var TranslatorBackends = {
    ufalTransformer: {
        composeRequest: function (text, sourceLang, targetLang) {
            return {};
        },
        languages: utils_1.Utils.generatePairs(['cs', 'en', 'fr', 'hi'], false),
    }
};


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * Utils contains miscellaneous generic functions, mostly for data strucutres manipulation and text processing.
 * It has a role of a static class.
 */
var Utils;
(function (Utils) {
    /**
     * Generates pair tuples from single array.
     * @param arr Array from which pairs are created.
     * @param reflexive If false, pairs in the form (a, a) are omitted.
     */
    function generatePairs(arr, reflexive) {
        if (reflexive === void 0) { reflexive = true; }
        var out = [];
        for (var i in arr) {
            for (var j in arr) {
                if (i == j && !reflexive) {
                    continue;
                }
                out.push([arr[i], arr[j]]);
            }
        }
        return out;
    }
    Utils.generatePairs = generatePairs;
    /**
     * Storage for language code <-> language name relation.
     */
    var _langCodeToName = {
        cs: 'Czech',
        en: 'English',
        fr: 'French',
        hi: 'Hindi',
        de: 'German',
    };
    /**
     * Returns a name of a language correspoding to given code. Throws an error if code is not recognized.
     * @param code Language code.
     */
    function languageName(code) {
        var a = _langCodeToName[code];
        if (code in _langCodeToName) {
            return _langCodeToName[code];
        }
        else {
            throw new Error('Unknown language code: `' + code + '`');
        }
    }
    Utils.languageName = languageName;
})(Utils = exports.Utils || (exports.Utils = {}));


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FzeW5jX21lc3NhZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGljYXRvcl9tYW5hZ2VyLnRzIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIiwid2VicGFjazovLy8uL3NyYy90aHJvdHRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RyYW5zbGF0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2hGQTs7OztHQUlHO0FBQ0g7SUFBQTtRQUNjLFdBQU0sR0FBVyxDQUFDO1FBQ2xCLFlBQU8sR0FBVyxDQUFDO1FBbUQ3QixtRUFBbUU7UUFDbkUsa0RBQWtEO1FBQ2xELCtCQUErQjtRQUMvQixvQkFBb0I7UUFFcEIsMEJBQTBCO1FB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QzthQUM3QjtTQUNKO1FBQ0QsT0FBTyxHQUFHO0lBQ2QsQ0FBQztJQVhlLG1CQUFhLGdCQVc1QjtJQUVEOztPQUVHO0lBQ0gsSUFBSSxlQUFlLEdBQUc7UUFDbEIsRUFBRSxFQUFFLE9BQU87UUFDWCxFQUFFLEVBQUUsU0FBUztRQUNiLEVBQUUsRUFBRSxRQUFRO1FBQ1osRUFBRSxFQUFFLE9BQU87UUFDWCxFQUFFLEVBQUUsUUFBUTtLQUNjO0lBRTlCOzs7T0FHRztJQUNILFNBQWdCLFlBQVksQ0FBQyxJQUFZO1FBQ3JDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBRyxJQUFJLElBQUksZUFBZSxFQUFFO1lBQ3hCLE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQztTQUMvQjthQUFNO1lBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztJQVBlLGtCQUFZLGVBTzNCO0FBQ0wsQ0FBQyxFQTFDYSxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUEwQ2xCIiwiZmlsZSI6InB0YWtvcGV0LXdlYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL21haW4udHNcIik7XG4iLCJpbXBvcnQge0luZGljYXRvck1hbmFnZXJ9IGZyb20gJy4vaW5kaWNhdG9yX21hbmFnZXInXG5cbi8qKlxuICogQXN5bmNNc2cgc2VuZHMgYW4gQUpBWCByZXF1ZXN0LCBidXQgbm90ZXMgbWVzc2FnZSBpZCBhbmQgaWYgXG4gKiB0aGUgaW5jb21taW5nIG1lc3NhZ2Ugd291bGQgZHJvcCBhbiBpbmNyZWFzaW5nIHNlcXVlbmNlLFxuICogdGhlIG1lc3NhZ2UgaXMgZHJvcHBlZCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgQXN5bmNNZXNzYWdlIHtcbiAgICBwcm90ZWN0ZWQgbXNnUmVjOiBudW1iZXIgPSAwXG4gICAgcHJvdGVjdGVkIG1zZ05leHQ6IG51bWJlciA9IDFcbiAgICBwdWJsaWMgaW5kaWNhdG9ySGFuZGxlPyA6IEluZGljYXRvck1hbmFnZXJcblxuICAgIHB1YmxpYyBhZGRJbmRpY2F0b3IoaW5kaWNhdG9ySGFuZGxlOiBJbmRpY2F0b3JNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuaW5kaWNhdG9ySGFuZGxlID0gaW5kaWNhdG9ySGFuZGxlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHRoZSBpbmNvbW1pbmcgbWVzc2FnZSBpbmRleCB0byB0aGUgbGF0ZXN0IHJlY2VpdmVkIElEXG4gICAgICogYW5kIHBvc3NpYmx5IGluY3JlYXNlIHRoZSBsYXR0ZXJcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlY2VpdmVDaGVjayhtc2dJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLm1zZ1JlYyA+IG1zZ0luZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljYXRvckhhbmRsZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvckhhbmRsZS5hZGQobXNnSW5kZXggLSB0aGlzLm1zZ1JlYylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubXNnUmVjID0gbXNnSW5kZXg7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGFuIEFKQVggcmVxdWVzdCBhbmQgaWYgdGhlIHJlc3BvbnNlIGxhbmRzIGJhY2sgYmVmb3JlIHRoZVxuICAgICAqIGZvbGxvd2luZyBvbmUsIGludm9rZSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBkaXNwYXRjaChhamF4UGFyYW1zOiBKUXVlcnkuQWpheFNldHRpbmdzPGFueT4sIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgICAgIGxldCBtc2dDdXJyZW50ID0gdGhpcy5tc2dOZXh0XG4gICAgICAgIHRoaXMubXNnTmV4dCsrXG5cbiAgICAgICAgaWYodGhpcy5pbmRpY2F0b3JIYW5kbGUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvckhhbmRsZS5hZGQoLTEpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBtZXJnZSB0aGUgYXJndW1lbnRzIGFuZCB1c2UgZXhpc3RpbmcgY2FsbGJhY2sgcHJvcGVydHlcbiAgICAgICAgLy8gRWcuIHNhdmUgaXQgYW5kIHdyYXAgaXQgaW4gY3VzdG9tIGNhbGxiYWNrXG5cbiAgICAgICAgYWpheFBhcmFtcy5zdWNjZXNzID0gKGE6IGFueSwgYjogYW55LCBjOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGEsIGIsIGMpXG4gICAgICAgICAgICBjYWxsYmFjayhcImFzXCIpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzKVxuICAgICAgICAgICAgaWYgKHRoaXMucmVjZWl2ZUNoZWNrKG1zZ0N1cnJlbnQpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soXCJcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheChhamF4UGFyYW1zKTtcbiAgICB9XG5cblxuICAgIC8vIHByb3RlY3RlZCBkaXNwYXRjaChhamF4UGFyYW1zOiBKUXVlcnkuQWpheFNldHRpbmdzPGFueT4pOiB2b2lkIHtcbiAgICAvLyAgICAgYWpheFBhcmFtcy5zdWNjZXNzID0gKChhOiBhbnksIGI6IGFueSkgPT4ge1xuICAgIC8vICAgICAgICAgdGhpcy5yZWNlaXZlQ2hlY2soMClcbiAgICAvLyAgICAgfSkuYmluZCh0aGlzKVxuXG4gICAgLy8gICAgICQuYWpheChhamF4UGFyYW1zKTtcbiAgICAvLyB9XG59IiwiLyoqXG4gKiBAVE9ET1xuICovXG5leHBvcnQgY2xhc3MgSW5kaWNhdG9yTWFuYWdlciB7XG4gICAgLyoqXG4gICAgICogQFRPRE9cbiAgICAgKiBAcGFyYW0gaW5kaWNhdG9yIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGluZGljYXRvcjogSlF1ZXJ5PEhUTUxFbGVtZW50Pikge1xuICAgICAgICB0aGlzLmluZGljYXRvciA9IGluZGljYXRvclxuICAgIH1cblxuICAgIHByaXZhdGUgbjogbnVtYmVyID0gMFxuICAgIHByaXZhdGUgaW5kaWNhdG9yOiBKUXVlcnk8SFRNTEVsZW1lbnQ+XG5cbiAgICAvKipcbiAgICAgKiBAVE9ET1xuICAgICAqIEBwYXJhbSBuIFxuICAgICAqL1xuICAgIHB1YmxpYyBhZGQobjogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMubiArPSBuXG5cbiAgICAgICAgaWYodGhpcy5uIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IuZmFkZUluKClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLmZhZGVPdXQoKVxuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7VHJhbnNsYXRvciwgVHJhbnNsYXRvclNvdXJjZX0gZnJvbSAnLi90cmFuc2xhdG9yJ1xuaW1wb3J0IHsgSW5kaWNhdG9yTWFuYWdlciB9IGZyb20gJy4vaW5kaWNhdG9yX21hbmFnZXInO1xuXG5sZXQgdHJhbnNsYXRvcl9zb3VyY2UgOiBUcmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3JTb3VyY2UoKVxubGV0IGluZGljYXRvcl90cmFuc2xhdG9yIDogSW5kaWNhdG9yTWFuYWdlciA9IG5ldyBJbmRpY2F0b3JNYW5hZ2VyKCQoJyNpbmRpY2F0b3JfdHJhbnNsYXRvcicpKVxudHJhbnNsYXRvcl9zb3VyY2UuYWRkSW5kaWNhdG9yKGluZGljYXRvcl90cmFuc2xhdG9yKVxuXG5cblxubGV0IGlucHV0X3NvdXJjZSA9ICQoJyNpbnB1dF9zb3VyY2UnKVxubGV0IGlucHV0X3RhcmdldCA9ICQoJyNpbnB1dF90YXJnZXQnKVxubGV0IGlucHV0X2JhY2sgPSAkKCcjaW5wdXRfYmFjaycpXG5sZXQgc2VsZWN0X3NvdXJjZSA9ICQoJyNsYW5ndWFnZV9zZWxlY3Rfc291cmNlJylcbmxldCBzZWxlY3RfdGFyZ2V0ID0gJCgnI2xhbmd1YWdlX3NlbGVjdF90YXJnZXQnKVxuXG5pbnB1dF9zb3VyY2Uub24oJ2lucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgdHJhbnNsYXRvcl9zb3VyY2UudHJhbnNsYXRlX3Rocm90dGxlKClcbn0pXG5cbmlucHV0X3RhcmdldC5vbignaW5wdXQnLCBmdW5jdGlvbigpIHtcbiAgICAvLyB0cmFuc2xhdG9yX3RhcmdldC50cmFuc2xhdGVfdGhyb3R0bGUoKVxufSlcblxuLy8gJCgnI21haW5fY29udGVudCcpLmh0bWwoJzxzcGFuPmhlbGxvPC9zcGFuPicgKyAkKCcjbWFpbl9jb250ZW50JykuaHRtbCgpKSIsIi8qKlxuICogVGhyb3R0bGVzIGV2ZW50cyB1bnRpbCBhIGdpdmVuIGRlbGF5IGZvbGxvd3MuIFxuICogVXNlZCBtb3N0bHkgZm9yIGtleWJvYXJkIGlucHV0LlxuICovXG5leHBvcnQgY2xhc3MgVGhyb3R0bGVyIHtcbiAgICBwcml2YXRlIGFjdGl2YXRpb25EZWxheSA6IG51bWJlclxuICAgIHByaXZhdGUgdGltZW91dElkIDogbnVtYmVyIHwgdW5kZWZpbmVkXG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gYWN0aXZhdGlvbkRlbGF5IERlbGF5IGFmdGVyIHdoaWNoIHRoZSBsYXRlc3QgcmVxdWVzdCBpcyBmaXJlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoYWN0aXZhdGlvbkRlbGF5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0aW9uRGVsYXkgPSBhY3RpdmF0aW9uRGVsYXlcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogUmVzZXQgdGhlIHByZXZpb3VzIGRlbGF5IGFuZCBhZGQgbmV3IG9uZS4gXG4gICAgICogQHBhcmFtIGZ1bmMgRnVuY3Rpb24gd2hpY2ggaXMgZXZlbnR1YWxseSBjYWxsZWQuXG4gICAgICovXG4gICAgcHVibGljIHRocm90dGxlKGZ1bmM6ICgpID0+IGFueSkge1xuICAgICAgICBpZih0aGlzLnRpbWVvdXRJZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRJZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmMsIHRoaXMuYWN0aXZhdGlvbkRlbGF5KTsgICBcbiAgICB9XG59IiwiaW1wb3J0IHsgQXN5bmNNZXNzYWdlIH0gZnJvbSBcIi4vYXN5bmNfbWVzc2FnZVwiXG5pbXBvcnQgeyBUaHJvdHRsZXIgfSBmcm9tIFwiLi90aHJvdHRsZXJcIlxuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi91dGlsc1wiXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUcmFuc2xhdG9yIGV4dGVuZHMgQXN5bmNNZXNzYWdlIHtcbiAgICBwcml2YXRlIHRocm90dGxlciA9IG5ldyBUaHJvdHRsZXIoNTAwKTtcblxuICAgIHB1YmxpYyB0cmFuc2xhdGVfdGhyb3R0bGUoKSB7XG4gICAgICAgIHRoaXMudGhyb3R0bGVyLnRocm90dGxlKHRoaXMudHJhbnNsYXRlKVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCB0cmFuc2xhdGUoKTogdm9pZFxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBiYWNrZW5kOiBUcmFuc2xhdG9yQmFja2VuZFxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRvclNvdXJjZSBleHRlbmRzIFRyYW5zbGF0b3Ige1xuICAgIHByb3RlY3RlZCBiYWNrZW5kOiBUcmFuc2xhdG9yQmFja2VuZCA9IFRyYW5zbGF0b3JCYWNrZW5kcy51ZmFsVHJhbnNmb3JtZXJcblxuICAgIHByb3RlY3RlZCB0cmFuc2xhdGUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEaXNwYXRjaGluZzogJywgJCgnI2lucHV0X3NvdXJjZScpLnZhbCgpKVxuICAgICAgICBzdXBlci5kaXNwYXRjaChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9saW5kYXQubWZmLmN1bmkuY3ovc2VydmljZXMvdHJhbnNmb3JtZXIvYXBpL3YxL2xhbmd1YWdlc1wiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHsgc3JjOiAnZW4nLCB0Z3Q6ICdjcycsIGlucHV0X3RleHQ6IFwiaGVsbG9cIiB9LFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHsgY29uc29sZS5sb2coJ2hlbGxvIGplbGxvJykgfVxuICAgICAgICApXG4gICAgfVxufVxuXG50eXBlIFRyYW5zbGF0b3JCYWNrZW5kID0ge1xuICAgIGNvbXBvc2VSZXF1ZXN0OiAodGV4dDogc3RyaW5nLCBzb3VyY2VMYW5nOiBzdHJpbmcsIHRhcmdldExhbmc6IHN0cmluZykgPT4gSlF1ZXJ5LkFqYXhTZXR0aW5ncyxcbiAgICBsYW5ndWFnZXM6IEFycmF5PFtzdHJpbmcsIHN0cmluZ10+LFxufVxuXG5sZXQgVHJhbnNsYXRvckJhY2tlbmRzID0ge1xuICAgIHVmYWxUcmFuc2Zvcm1lcjoge1xuICAgICAgICBjb21wb3NlUmVxdWVzdCh0ZXh0OiBzdHJpbmcsIHNvdXJjZUxhbmc6IHN0cmluZywgdGFyZ2V0TGFuZzogc3RyaW5nKTogSlF1ZXJ5LkFqYXhTZXR0aW5ncyB7XG4gICAgICAgICAgICByZXR1cm4ge31cbiAgICAgICAgfSxcbiAgICAgICAgbGFuZ3VhZ2VzOiBVdGlscy5nZW5lcmF0ZVBhaXJzKFsnY3MnLCAnZW4nLCAnZnInLCAnaGknXSwgZmFsc2UpLFxuICAgIH1cbn0iLCIvKipcbiAqIFV0aWxzIGNvbnRhaW5zIG1pc2NlbGxhbmVvdXMgZ2VuZXJpYyBmdW5jdGlvbnMsIG1vc3RseSBmb3IgZGF0YSBzdHJ1Y3V0cmVzIG1hbmlwdWxhdGlvbiBhbmQgdGV4dCBwcm9jZXNzaW5nLlxuICogSXQgaGFzIGEgcm9sZSBvZiBhIHN0YXRpYyBjbGFzcy5cbiAqL1xuZXhwb3J0IG1vZHVsZSBVdGlscyB7XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIHBhaXIgdHVwbGVzIGZyb20gc2luZ2xlIGFycmF5LlxuICAgICAqIEBwYXJhbSBhcnIgQXJyYXkgZnJvbSB3aGljaCBwYWlycyBhcmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0gcmVmbGV4aXZlIElmIGZhbHNlLCBwYWlycyBpbiB0aGUgZm9ybSAoYSwgYSkgYXJlIG9taXR0ZWQuXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUGFpcnM8Uj4oYXJyOiBBcnJheTxSPiwgcmVmbGV4aXZlOiBib29sZWFuID0gdHJ1ZSkgOiBBcnJheTxbUiwgUl0+IHtcbiAgICAgICAgbGV0IG91dCA6IEFycmF5PFtSLCBSXT4gPSBbXVxuICAgICAgICBmb3IobGV0IGkgaW4gYXJyKSB7XG4gICAgICAgICAgICBmb3IobGV0IGogaW4gYXJyKSB7XG4gICAgICAgICAgICAgICAgaWYoaSA9PSBqICYmICFyZWZsZXhpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dC5wdXNoKFthcnJbaV0sIGFycltqXV0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JhZ2UgZm9yIGxhbmd1YWdlIGNvZGUgPC0+IGxhbmd1YWdlIG5hbWUgcmVsYXRpb24uXG4gICAgICovXG4gICAgbGV0IF9sYW5nQ29kZVRvTmFtZSA9IHtcbiAgICAgICAgY3M6ICdDemVjaCcsXG4gICAgICAgIGVuOiAnRW5nbGlzaCcsXG4gICAgICAgIGZyOiAnRnJlbmNoJyxcbiAgICAgICAgaGk6ICdIaW5kaScsXG4gICAgICAgIGRlOiAnR2VybWFuJyxcbiAgICB9IGFzIHtbaW5kZXg6IHN0cmluZ106IHN0cmluZ31cbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmFtZSBvZiBhIGxhbmd1YWdlIGNvcnJlc3BvZGluZyB0byBnaXZlbiBjb2RlLiBUaHJvd3MgYW4gZXJyb3IgaWYgY29kZSBpcyBub3QgcmVjb2duaXplZC5cbiAgICAgKiBAcGFyYW0gY29kZSBMYW5ndWFnZSBjb2RlLiBcbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gbGFuZ3VhZ2VOYW1lKGNvZGU6IHN0cmluZykgOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICBsZXQgYSA9IF9sYW5nQ29kZVRvTmFtZVtjb2RlXVxuICAgICAgICBpZihjb2RlIGluIF9sYW5nQ29kZVRvTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9sYW5nQ29kZVRvTmFtZVtjb2RlXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGxhbmd1YWdlIGNvZGU6IGAnICsgY29kZSArICdgJylcbiAgICAgICAgfVxuICAgIH1cbn0iXSwic291cmNlUm9vdCI6IiJ9