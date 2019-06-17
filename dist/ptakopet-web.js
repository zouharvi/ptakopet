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
            this.msgRec = msgIndex;
            return true;
        }
    };
    /**
     * Sends an AJAX request and if the response lands back before the
     * following one, invoke callback
     */
    AsyncMessage.prototype.dispatch = function (ajaxParams, callback) {
        var msgCurrent = this.msgNext;
        this.msgNext++;
        // TODO: merge the arguments and use existing callback property
        // Eg. save it and wrap it in custom callback
        ajaxParams.success = function (a, b, c) {
            console.log(a, b, c);
            callback("as");
        };
        $.ajax(ajaxParams);
        if (this.receiveCheck(msgCurrent)) {
            callback("");
        }
    };
    return AsyncMessage;
}());
exports.AsyncMessage = AsyncMessage;


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
        var _this = _super !== null && _super.apply(this, arguments) || this;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FzeW5jX21lc3NhZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Rocm90dGxlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdHJhbnNsYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEZBOzs7O0dBSUc7QUFDSDtJQUFBO1FBQ2MsV0FBTSxHQUFXLENBQUM7UUFDbEIsWUFBTyxHQUFXLENBQUM7SUFvQ2pDLENBQUM7SUFsQ0c7OztPQUdHO0lBQ0ssbUNBQVksR0FBcEIsVUFBcUIsUUFBZ0I7UUFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFBRTtZQUN4QixPQUFPLEtB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QywwQkFBMEIsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQzNEO0lBQ0wsQ0FBQztJQVBlLGtCQUFZLGVBTzNCO0FBQ0wsQ0FBQyxFQTFDYSxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUEwQ2xCIiwiZmlsZSI6InB0YWtvcGV0LXdlYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL21haW4udHNcIik7XG4iLCIvKipcbiAqIEFzeW5jTXNnIHNlbmRzIGFuIEFKQVggcmVxdWVzdCwgYnV0IG5vdGVzIG1lc3NhZ2UgaWQgYW5kIGlmIFxuICogdGhlIGluY29tbWluZyBtZXNzYWdlIHdvdWxkIGRyb3AgYW4gaW5jcmVhc2luZyBzZXF1ZW5jZSxcbiAqIHRoZSBtZXNzYWdlIGlzIGRyb3BwZWQgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFzeW5jTWVzc2FnZSB7XG4gICAgcHJvdGVjdGVkIG1zZ1JlYzogbnVtYmVyID0gMFxuICAgIHByb3RlY3RlZCBtc2dOZXh0OiBudW1iZXIgPSAxXG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0aGUgaW5jb21taW5nIG1lc3NhZ2UgaW5kZXggdG8gdGhlIGxhdGVzdCByZWNlaXZlZCBJRFxuICAgICAqIGFuZCBwb3NzaWJseSBpbmNyZWFzZSB0aGUgbGF0dGVyXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWNlaXZlQ2hlY2sobXNnSW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5tc2dSZWMgPiBtc2dJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tc2dSZWMgPSBtc2dJbmRleDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYW4gQUpBWCByZXF1ZXN0IGFuZCBpZiB0aGUgcmVzcG9uc2UgbGFuZHMgYmFjayBiZWZvcmUgdGhlXG4gICAgICogZm9sbG93aW5nIG9uZSwgaW52b2tlIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRpc3BhdGNoKGFqYXhQYXJhbXM6IEpRdWVyeS5BamF4U2V0dGluZ3M8YW55PiwgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IHZvaWQpOiB2b2lkIHtcbiAgICAgICAgbGV0IG1zZ0N1cnJlbnQgPSB0aGlzLm1zZ05leHRcbiAgICAgICAgdGhpcy5tc2dOZXh0KytcblxuICAgICAgICAvLyBUT0RPOiBtZXJnZSB0aGUgYXJndW1lbnRzIGFuZCB1c2UgZXhpc3RpbmcgY2FsbGJhY2sgcHJvcGVydHlcbiAgICAgICAgLy8gRWcuIHNhdmUgaXQgYW5kIHdyYXAgaXQgaW4gY3VzdG9tIGNhbGxiYWNrXG5cbiAgICAgICAgYWpheFBhcmFtcy5zdWNjZXNzID0gZnVuY3Rpb24oYSwgYiwgYykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYSwgYiwgYylcbiAgICAgICAgICAgIGNhbGxiYWNrKFwiYXNcIilcbiAgICAgICAgfVxuICAgICAgICAkLmFqYXgoYWpheFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVjZWl2ZUNoZWNrKG1zZ0N1cnJlbnQpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhcIlwiKVxuICAgICAgICB9XG4gICAgfVxufSIsImltcG9ydCB7VHJhbnNsYXRvclNvdXJjZX0gZnJvbSAnLi90cmFuc2xhdG9yJ1xuXG5sZXQgdHJhbnNsYXRvcl9zb3VyY2UgPSBuZXcgVHJhbnNsYXRvclNvdXJjZSgpXG5cbmxldCBpbnB1dF9zb3VyY2UgPSAkKCcjaW5wdXRfc291cmNlJylcbmxldCBpbnB1dF90YXJnZXQgPSAkKCcjaW5wdXRfdGFyZ2V0JylcbmxldCBpbnB1dF9iYWNrID0gJCgnI2lucHV0X2JhY2snKVxubGV0IHNlbGVjdF9zb3VyY2UgPSAkKCcjbGFuZ3VhZ2Vfc2VsZWN0X3NvdXJjZScpXG5sZXQgc2VsZWN0X3RhcmdldCA9ICQoJyNsYW5ndWFnZV9zZWxlY3RfdGFyZ2V0JylcblxuaW5wdXRfc291cmNlLm9uKCdpbnB1dCcsIGZ1bmN0aW9uKCkge1xuICAgIHRyYW5zbGF0b3Jfc291cmNlLnRyYW5zbGF0ZV90aHJvdHRsZSgpXG59KVxuXG5pbnB1dF90YXJnZXQub24oJ2lucHV0JywgZnVuY3Rpb24oKSB7XG4gICAgLy8gdHJhbnNsYXRvcl90YXJnZXQudHJhbnNsYXRlX3Rocm90dGxlKClcbn0pXG5cbi8vICQoJyNtYWluX2NvbnRlbnQnKS5odG1sKCc8c3Bhbj5oZWxsbzwvc3Bhbj4nICsgJCgnI21haW5fY29udGVudCcpLmh0bWwoKSkiLCIvKipcbiAqIFRocm90dGxlcyBldmVudHMgdW50aWwgYSBnaXZlbiBkZWxheSBmb2xsb3dzLiBcbiAqIFVzZWQgbW9zdGx5IGZvciBrZXlib2FyZCBpbnB1dC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRocm90dGxlciB7XG4gICAgcHJpdmF0ZSBhY3RpdmF0aW9uRGVsYXkgOiBudW1iZXJcbiAgICBwcml2YXRlIHRpbWVvdXRJZCA6IG51bWJlciB8IHVuZGVmaW5lZFxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIGFjdGl2YXRpb25EZWxheSBEZWxheSBhZnRlciB3aGljaCB0aGUgbGF0ZXN0IHJlcXVlc3QgaXMgZmlyZWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGFjdGl2YXRpb25EZWxheTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGlvbkRlbGF5ID0gYWN0aXZhdGlvbkRlbGF5XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJlc2V0IHRoZSBwcmV2aW91cyBkZWxheSBhbmQgYWRkIG5ldyBvbmUuIFxuICAgICAqIEBwYXJhbSBmdW5jIEZ1bmN0aW9uIHdoaWNoIGlzIGV2ZW50dWFsbHkgY2FsbGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyB0aHJvdHRsZShmdW5jOiAoKSA9PiBhbnkpIHtcbiAgICAgICAgaWYodGhpcy50aW1lb3V0SWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZW91dElkID0gc2V0VGltZW91dChmdW5jLCB0aGlzLmFjdGl2YXRpb25EZWxheSk7ICAgXG4gICAgfVxufSIsImltcG9ydCB7IEFzeW5jTWVzc2FnZSB9IGZyb20gXCIuL2FzeW5jX21lc3NhZ2VcIlxuaW1wb3J0IHsgVGhyb3R0bGVyIH0gZnJvbSBcIi4vdGhyb3R0bGVyXCJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4vdXRpbHNcIlxuXG5pbnRlcmZhY2UgVHJhbnNsYXRvciB7XG4gICAgdHJhbnNsYXRlX3Rocm90dGxlKCk6IHZvaWRcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0b3JTb3VyY2UgZXh0ZW5kcyBBc3luY01lc3NhZ2UgaW1wbGVtZW50cyBUcmFuc2xhdG9yIHtcbiAgICBwcml2YXRlIHRocm90dGxlciA9IG5ldyBUaHJvdHRsZXIoNTAwKTtcbiAgICBwcml2YXRlIGJhY2tlbmQ6IFRyYW5zbGF0b3JCYWNrZW5kID0gVHJhbnNsYXRvckJhY2tlbmRzLnVmYWxUcmFuc2Zvcm1lclxuXG4gICAgcHVibGljIHRyYW5zbGF0ZV90aHJvdHRsZSgpIHtcbiAgICAgICAgdGhpcy50aHJvdHRsZXIudGhyb3R0bGUodGhpcy50cmFuc2xhdGUpXG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cmFuc2xhdGUoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoJyNpbnB1dF9zb3VyY2UnKS52YWwoKSlcbiAgICB9XG59XG5cbnR5cGUgVHJhbnNsYXRvckJhY2tlbmQgPSB7XG4gICAgY29tcG9zZVJlcXVlc3Q6ICh0ZXh0OiBzdHJpbmcsIHNvdXJjZUxhbmc6IHN0cmluZywgdGFyZ2V0TGFuZzogc3RyaW5nKSA9PiBKUXVlcnkuQWpheFNldHRpbmdzLFxuICAgIGxhbmd1YWdlczogQXJyYXk8W3N0cmluZywgc3RyaW5nXT4sXG59XG5cbmxldCBUcmFuc2xhdG9yQmFja2VuZHMgPSB7XG4gICAgdWZhbFRyYW5zZm9ybWVyOiB7XG4gICAgICAgIGNvbXBvc2VSZXF1ZXN0KHRleHQ6IHN0cmluZywgc291cmNlTGFuZzogc3RyaW5nLCB0YXJnZXRMYW5nOiBzdHJpbmcpOiBKUXVlcnkuQWpheFNldHRpbmdzIHtcbiAgICAgICAgICAgIHJldHVybiB7fVxuICAgICAgICB9LFxuICAgICAgICBsYW5ndWFnZXM6IFV0aWxzLmdlbmVyYXRlUGFpcnMoWydjcycsICdlbicsICdmcicsICdoaSddLCBmYWxzZSksXG4gICAgfVxufSIsIi8qKlxuICogVXRpbHMgY29udGFpbnMgbWlzY2VsbGFuZW91cyBnZW5lcmljIGZ1bmN0aW9ucywgbW9zdGx5IGZvciBkYXRhIHN0cnVjdXRyZXMgbWFuaXB1bGF0aW9uIGFuZCB0ZXh0IHByb2Nlc3NpbmcuXG4gKiBJdCBoYXMgYSByb2xlIG9mIGEgc3RhdGljIGNsYXNzLlxuICovXG5leHBvcnQgbW9kdWxlIFV0aWxzIHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgcGFpciB0dXBsZXMgZnJvbSBzaW5nbGUgYXJyYXkuXG4gICAgICogQHBhcmFtIGFyciBBcnJheSBmcm9tIHdoaWNoIHBhaXJzIGFyZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSByZWZsZXhpdmUgSWYgZmFsc2UsIHBhaXJzIGluIHRoZSBmb3JtIChhLCBhKSBhcmUgb21pdHRlZC5cbiAgICAgKi9cbiAgICBleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVQYWlyczxSPihhcnI6IEFycmF5PFI+LCByZWZsZXhpdmU6IGJvb2xlYW4gPSB0cnVlKSA6IEFycmF5PFtSLCBSXT4ge1xuICAgICAgICBsZXQgb3V0IDogQXJyYXk8W1IsIFJdPiA9IFtdXG4gICAgICAgIGZvcihsZXQgaSBpbiBhcnIpIHtcbiAgICAgICAgICAgIGZvcihsZXQgaiBpbiBhcnIpIHtcbiAgICAgICAgICAgICAgICBpZihpID09IGogJiYgIXJlZmxleGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3V0LnB1c2goW2FycltpXSwgYXJyW2pdXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcmFnZSBmb3IgbGFuZ3VhZ2UgY29kZSA8LT4gbGFuZ3VhZ2UgbmFtZSByZWxhdGlvbi5cbiAgICAgKi9cbiAgICBsZXQgX2xhbmdDb2RlVG9OYW1lID0ge1xuICAgICAgICBjczogJ0N6ZWNoJyxcbiAgICAgICAgZW46ICdFbmdsaXNoJyxcbiAgICAgICAgZnI6ICdGcmVuY2gnLFxuICAgICAgICBoaTogJ0hpbmRpJyxcbiAgICAgICAgZGU6ICdHZXJtYW4nLFxuICAgIH0gYXMge1tpbmRleDogc3RyaW5nXTogc3RyaW5nfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuYW1lIG9mIGEgbGFuZ3VhZ2UgY29ycmVzcG9kaW5nIHRvIGdpdmVuIGNvZGUuIFRocm93cyBhbiBlcnJvciBpZiBjb2RlIGlzIG5vdCByZWNvZ25pemVkLlxuICAgICAqIEBwYXJhbSBjb2RlIExhbmd1YWdlIGNvZGUuIFxuICAgICAqL1xuICAgIGV4cG9ydCBmdW5jdGlvbiBsYW5ndWFnZU5hbWUoY29kZTogc3RyaW5nKSA6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGxldCBhID0gX2xhbmdDb2RlVG9OYW1lW2NvZGVdXG4gICAgICAgIGlmKGNvZGUgaW4gX2xhbmdDb2RlVG9OYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2xhbmdDb2RlVG9OYW1lW2NvZGVdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbGFuZ3VhZ2UgY29kZTogYCcgKyBjb2RlICsgJ2AnKVxuICAgICAgICB9XG4gICAgfVxufSJdLCJzb3VyY2VSb290IjoiIn0=