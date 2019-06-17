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
var indicator_manager_1 = __webpack_require__(/*! ./indicator_manager */ "./src/indicator_manager.ts");
/**
 * AsyncMsg sends an AJAX request, but notes message id and if
 * the incomming message would drop an increasing sequence,
 * the message is dropped instead.
 */
var AsyncMessage = /** @class */ (function () {
    function AsyncMessage(loadingIndicator) {
        this.msgRec = 0;
        this.msgNext = 1;
        if (loadingIndicator == undefined) {
            this.indicatorHandle = undefined;
        }
        else {
            this.indicatorHandle = new indicator_manager_1.IndicatorManager(loadingIndicator);
        }
    }
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
        ajaxParams.success = (function (a, b, c) {
            console.log(a, b, c);
            callback("as");
            if (_this.receiveCheck(msgCurrent)) {
                callback("");
            }
        }).bind(this);
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
var IndicatorManager = /** @class */ (function () {
    function IndicatorManager(indicator) {
        this.n = 0;
    }
    IndicatorManager.prototype.add = function (n) {
        this.n += n;
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
var translator_source = new translator_1.TranslatorSource();
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
var TranslatorSource = /** @class */ (function (_super) {
    __extends(TranslatorSource, _super);
    function TranslatorSource() {
        var _this = _super.call(this, $('')) || this;
        _this.throttler = new throttler_1.Throttler(500);
        _this.backend = TranslatorBackends.ufalTransformer;
        return _this;
    }
    TranslatorSource.prototype.translate_throttle = function () {
        this.throttler.throttle(this.translate);
    };
    TranslatorSource.prototype.translate = function () {
        console.log($('#input_source').val());
    };
    return TranslatorSource;
}(async_message_1.AsyncMessage));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FzeW5jX21lc3NhZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGljYXRvcl9tYW5hZ2VyLnRzIiwid2VicGFjazovLy8uL3NyYy9tYWluLnRzIiwid2VicGFjazovLy8uL3NyYy90aHJvdHRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3RyYW5zbGF0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ2xGQSx1R0FBb0Q7QUFFcEQ7Ozs7R0FJRztBQUNIO0lBS0ksc0JBQVksZ0JBQXNDO1FBSnhDLFdBQU0sR0FBVyxDQUFDO1FBQ2xCLFlBQU8sR0FBVyxDQUFDO1FBSXpCLElBQUcsZ0JBQWdCLElBQUksU0FBUyxFQUFFO1lBQzlCLElB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SCxTQUFnQixhQUFhLENBQUksR0FBYSxFQUFFLFNBQXlCO1FBQXpCLDRDQUF5QjtRQUNyRSxJQUFJLEdBQUcsR0FBbUIsRUFBRTtRQUM1QixLQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTtZQUNkLEtBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO2dCQUNkLElBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDckIsU0FBUztpQkFDWjtnQkFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdCO1NBQ0o7UUFDRCxPQUFPLEdBQUc7SUFDZCxDQUFDO0lBWGUsbUJBQWEsZ0JBVzVCO0lBRUQ7O09BRUc7SUFDSCxJQUFJLGVBQWUsR0FBRztRQUNsQixFQUFFLEVBQUUsT0FBTztRQUNYLEVBQUUsRUFBRSxTQUFTO1FBQ2IsRUFBRSxFQUFFLFFBQVE7UUFDWixFQUFFLEVBQUUsT0FBTztRQUNYLEVBQUUsRUFBRSxRQUFRO0tBQ2M7SUFFOUI7OztPQUdHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLElBQVk7UUFDckMsSUFBSSxDQUFDLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQztRQUM3QixJQUFHLElBQUksSUFBSSxlQUFlLEVBQUU7WUFDeEIsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDO1NBQy9CO2FBQU07WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7U0FDM0Q7SUFDTCxDQUFDO0lBUGUsa0JBQVksZUFPM0I7QUFDTCxDQUFDLEVBMUNhLEtBQUssR0FBTCxhQUFLLEtBQUwsYUFBSyxRQTBDbEIiLCJmaWxlIjoicHRha29wZXQtd2ViLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvbWFpbi50c1wiKTtcbiIsImltcG9ydCB7SW5kaWNhdG9yTWFuYWdlcn0gZnJvbSAnLi9pbmRpY2F0b3JfbWFuYWdlcidcblxuLyoqXG4gKiBBc3luY01zZyBzZW5kcyBhbiBBSkFYIHJlcXVlc3QsIGJ1dCBub3RlcyBtZXNzYWdlIGlkIGFuZCBpZiBcbiAqIHRoZSBpbmNvbW1pbmcgbWVzc2FnZSB3b3VsZCBkcm9wIGFuIGluY3JlYXNpbmcgc2VxdWVuY2UsXG4gKiB0aGUgbWVzc2FnZSBpcyBkcm9wcGVkIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3luY01lc3NhZ2Uge1xuICAgIHByb3RlY3RlZCBtc2dSZWM6IG51bWJlciA9IDBcbiAgICBwcm90ZWN0ZWQgbXNnTmV4dDogbnVtYmVyID0gMVxuICAgIHB1YmxpYyBpbmRpY2F0b3JIYW5kbGU/IDogSW5kaWNhdG9yTWFuYWdlclxuXG4gICAgY29uc3RydWN0b3IobG9hZGluZ0luZGljYXRvcj86IEpRdWVyeTxIVE1MRWxlbWVudD4pIHtcbiAgICAgICAgaWYobG9hZGluZ0luZGljYXRvciA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9ySGFuZGxlID0gdW5kZWZpbmVkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvckhhbmRsZSA9IG5ldyBJbmRpY2F0b3JNYW5hZ2VyKGxvYWRpbmdJbmRpY2F0b3IpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0aGUgaW5jb21taW5nIG1lc3NhZ2UgaW5kZXggdG8gdGhlIGxhdGVzdCByZWNlaXZlZCBJRFxuICAgICAqIGFuZCBwb3NzaWJseSBpbmNyZWFzZSB0aGUgbGF0dGVyXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWNlaXZlQ2hlY2sobXNnSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5tc2dSZWMgPiBtc2dJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYodGhpcy5pbmRpY2F0b3JIYW5kbGUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3JIYW5kbGUuYWRkKG1zZ0luZGV4IC0gdGhpcy5tc2dSZWMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1zZ1JlYyA9IG1zZ0luZGV4O1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhbiBBSkFYIHJlcXVlc3QgYW5kIGlmIHRoZSByZXNwb25zZSBsYW5kcyBiYWNrIGJlZm9yZSB0aGVcbiAgICAgKiBmb2xsb3dpbmcgb25lLCBpbnZva2UgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZGlzcGF0Y2goYWpheFBhcmFtczogSlF1ZXJ5LkFqYXhTZXR0aW5nczxhbnk+LCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgICAgICBsZXQgbXNnQ3VycmVudCA9IHRoaXMubXNnTmV4dFxuICAgICAgICB0aGlzLm1zZ05leHQrK1xuXG5cbiAgICAgICAgaWYodGhpcy5pbmRpY2F0b3JIYW5kbGUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmluZGljYXRvckhhbmRsZS5hZGQoLTEpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBtZXJnZSB0aGUgYXJndW1lbnRzIGFuZCB1c2UgZXhpc3RpbmcgY2FsbGJhY2sgcHJvcGVydHlcbiAgICAgICAgLy8gRWcuIHNhdmUgaXQgYW5kIHdyYXAgaXQgaW4gY3VzdG9tIGNhbGxiYWNrXG5cbiAgICAgICAgYWpheFBhcmFtcy5zdWNjZXNzID0gKChhOiBhbnksIGI6IGFueSwgYzogYW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhLCBiLCBjKVxuICAgICAgICAgICAgY2FsbGJhY2soXCJhc1wiKVxuICAgICAgICAgICAgaWYgKHRoaXMucmVjZWl2ZUNoZWNrKG1zZ0N1cnJlbnQpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soXCJcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKVxuXG4gICAgICAgICQuYWpheChhamF4UGFyYW1zKTtcbiAgICB9XG59IiwiZXhwb3J0IGNsYXNzIEluZGljYXRvck1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGluZGljYXRvcjogSlF1ZXJ5PEhUTUxFbGVtZW50Pikge1xuXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBuOiBudW1iZXIgPSAwXG4gICAgcHVibGljIGFkZChuOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5uICs9IG5cbiAgICB9XG59IiwiaW1wb3J0IHtUcmFuc2xhdG9yLCBUcmFuc2xhdG9yU291cmNlfSBmcm9tICcuL3RyYW5zbGF0b3InXG5cbmxldCB0cmFuc2xhdG9yX3NvdXJjZSA6IFRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvclNvdXJjZSgpXG5cbmxldCBpbnB1dF9zb3VyY2UgPSAkKCcjaW5wdXRfc291cmNlJylcbmxldCBpbnB1dF90YXJnZXQgPSAkKCcjaW5wdXRfdGFyZ2V0JylcbmxldCBpbnB1dF9iYWNrID0gJCgnI2lucHV0X2JhY2snKVxubGV0IHNlbGVjdF9zb3VyY2UgPSAkKCcjbGFuZ3VhZ2Vfc2VsZWN0X3NvdXJjZScpXG5sZXQgc2VsZWN0X3RhcmdldCA9ICQoJyNsYW5ndWFnZV9zZWxlY3RfdGFyZ2V0JylcblxuaW5wdXRfc291cmNlLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICAgIHRyYW5zbGF0b3Jfc291cmNlLnRyYW5zbGF0ZV90aHJvdHRsZSgpXG59KVxuXG5pbnB1dF90YXJnZXQub24oJ2lucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgLy8gdHJhbnNsYXRvcl90YXJnZXQudHJhbnNsYXRlX3Rocm90dGxlKClcbn0pXG5cbi8vICQoJyNtYWluX2NvbnRlbnQnKS5odG1sKCc8c3Bhbj5oZWxsbzwvc3Bhbj4nICsgJCgnI21haW5fY29udGVudCcpLmh0bWwoKSkiLCIvKipcbiAqIFRocm90dGxlcyBldmVudHMgdW50aWwgYSBnaXZlbiBkZWxheSBmb2xsb3dzLiBcbiAqIFVzZWQgbW9zdGx5IGZvciBrZXlib2FyZCBpbnB1dC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRocm90dGxlciB7XG4gICAgcHJpdmF0ZSBhY3RpdmF0aW9uRGVsYXkgOiBudW1iZXJcbiAgICBwcml2YXRlIHRpbWVvdXRJZCA6IG51bWJlciB8IHVuZGVmaW5lZFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIGFjdGl2YXRpb25EZWxheSBEZWxheSBhZnRlciB3aGljaCB0aGUgbGF0ZXN0IHJlcXVlc3QgaXMgZmlyZWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGFjdGl2YXRpb25EZWxheTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGlvbkRlbGF5ID0gYWN0aXZhdGlvbkRlbGF5XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlc2V0IHRoZSBwcmV2aW91cyBkZWxheSBhbmQgYWRkIG5ldyBvbmUuIFxuICAgICAqIEBwYXJhbSBmdW5jIEZ1bmN0aW9uIHdoaWNoIGlzIGV2ZW50dWFsbHkgY2FsbGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyB0aHJvdHRsZShmdW5jOiAoKSA9PiBhbnkpIHtcbiAgICAgICAgaWYodGhpcy50aW1lb3V0SWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChmdW5jLCB0aGlzLmFjdGl2YXRpb25EZWxheSk7ICAgXG4gICAgfVxufSIsImltcG9ydCB7IEFzeW5jTWVzc2FnZSB9IGZyb20gXCIuL2FzeW5jX21lc3NhZ2VcIlxuaW1wb3J0IHsgVGhyb3R0bGVyIH0gZnJvbSBcIi4vdGhyb3R0bGVyXCJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zbGF0b3Ige1xuICAgIHRyYW5zbGF0ZV90aHJvdHRsZSgpOiB2b2lkXG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2xhdG9yU291cmNlIGV4dGVuZHMgQXN5bmNNZXNzYWdlIGltcGxlbWVudHMgVHJhbnNsYXRvciB7XG4gICAgcHJpdmF0ZSB0aHJvdHRsZXIgPSBuZXcgVGhyb3R0bGVyKDUwMCk7XG4gICAgcHJpdmF0ZSBiYWNrZW5kOiBUcmFuc2xhdG9yQmFja2VuZCA9IFRyYW5zbGF0b3JCYWNrZW5kcy51ZmFsVHJhbnNmb3JtZXJcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigkKCcnKSlcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhbnNsYXRlX3Rocm90dGxlKCkge1xuICAgICAgICB0aGlzLnRocm90dGxlci50aHJvdHRsZSh0aGlzLnRyYW5zbGF0ZSlcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyYW5zbGF0ZSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJCgnI2lucHV0X3NvdXJjZScpLnZhbCgpKVxuICAgIH1cbn1cblxudHlwZSBUcmFuc2xhdG9yQmFja2VuZCA9IHtcbiAgICBjb21wb3NlUmVxdWVzdDogKHRleHQ6IHN0cmluZywgc291cmNlTGFuZzogc3RyaW5nLCB0YXJnZXRMYW5nOiBzdHJpbmcpID0+IEpRdWVyeS5BamF4U2V0dGluZ3MsXG4gICAgbGFuZ3VhZ2VzOiBBcnJheTxbc3RyaW5nLCBzdHJpbmddPixcbn1cblxubGV0IFRyYW5zbGF0b3JCYWNrZW5kcyA9IHtcbiAgICB1ZmFsVHJhbnNmb3JtZXI6IHtcbiAgICAgICAgY29tcG9zZVJlcXVlc3QodGV4dDogc3RyaW5nLCBzb3VyY2VMYW5nOiBzdHJpbmcsIHRhcmdldExhbmc6IHN0cmluZyk6IEpRdWVyeS5BamF4U2V0dGluZ3Mge1xuICAgICAgICAgICAgcmV0dXJuIHt9XG4gICAgICAgIH0sXG4gICAgICAgIGxhbmd1YWdlczogVXRpbHMuZ2VuZXJhdGVQYWlycyhbJ2NzJywgJ2VuJywgJ2ZyJywgJ2hpJ10sIGZhbHNlKSxcbiAgICB9XG59IiwiLyoqXG4gKiBVdGlscyBjb250YWlucyBtaXNjZWxsYW5lb3VzIGdlbmVyaWMgZnVuY3Rpb25zLCBtb3N0bHkgZm9yIGRhdGEgc3RydWN1dHJlcyBtYW5pcHVsYXRpb24gYW5kIHRleHQgcHJvY2Vzc2luZy5cbiAqIEl0IGhhcyBhIHJvbGUgb2YgYSBzdGF0aWMgY2xhc3MuXG4gKi9cbmV4cG9ydCBtb2R1bGUgVXRpbHMge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBwYWlyIHR1cGxlcyBmcm9tIHNpbmdsZSBhcnJheS5cbiAgICAgKiBAcGFyYW0gYXJyIEFycmF5IGZyb20gd2hpY2ggcGFpcnMgYXJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIHJlZmxleGl2ZSBJZiBmYWxzZSwgcGFpcnMgaW4gdGhlIGZvcm0gKGEsIGEpIGFyZSBvbWl0dGVkLlxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVBhaXJzPFI+KGFycjogQXJyYXk8Uj4sIHJlZmxleGl2ZTogYm9vbGVhbiA9IHRydWUpIDogQXJyYXk8W1IsIFJdPiB7XG4gICAgICAgIGxldCBvdXQgOiBBcnJheTxbUiwgUl0+ID0gW11cbiAgICAgICAgZm9yKGxldCBpIGluIGFycikge1xuICAgICAgICAgICAgZm9yKGxldCBqIGluIGFycikge1xuICAgICAgICAgICAgICAgIGlmKGkgPT0gaiAmJiAhcmVmbGV4aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvdXQucHVzaChbYXJyW2ldLCBhcnJbal1dKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9yYWdlIGZvciBsYW5ndWFnZSBjb2RlIDwtPiBsYW5ndWFnZSBuYW1lIHJlbGF0aW9uLlxuICAgICAqL1xuICAgIGxldCBfbGFuZ0NvZGVUb05hbWUgPSB7XG4gICAgICAgIGNzOiAnQ3plY2gnLFxuICAgICAgICBlbjogJ0VuZ2xpc2gnLFxuICAgICAgICBmcjogJ0ZyZW5jaCcsXG4gICAgICAgIGhpOiAnSGluZGknLFxuICAgICAgICBkZTogJ0dlcm1hbicsXG4gICAgfSBhcyB7W2luZGV4OiBzdHJpbmddOiBzdHJpbmd9XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5hbWUgb2YgYSBsYW5ndWFnZSBjb3JyZXNwb2RpbmcgdG8gZ2l2ZW4gY29kZS4gVGhyb3dzIGFuIGVycm9yIGlmIGNvZGUgaXMgbm90IHJlY29nbml6ZWQuXG4gICAgICogQHBhcmFtIGNvZGUgTGFuZ3VhZ2UgY29kZS4gXG4gICAgICovXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGxhbmd1YWdlTmFtZShjb2RlOiBzdHJpbmcpIDogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgbGV0IGEgPSBfbGFuZ0NvZGVUb05hbWVbY29kZV1cbiAgICAgICAgaWYoY29kZSBpbiBfbGFuZ0NvZGVUb05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfbGFuZ0NvZGVUb05hbWVbY29kZV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBsYW5ndWFnZSBjb2RlOiBgJyArIGNvZGUgKyAnYCcpXG4gICAgICAgIH1cbiAgICB9XG59Il0sInNvdXJjZVJvb3QiOiIifQ==