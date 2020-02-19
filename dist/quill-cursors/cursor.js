"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tinycolor = require("tinycolor2");
var Cursor = (function () {
    function Cursor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
    }
    Cursor.prototype.build = function (options) {
        var element = document.createElement(Cursor.CONTAINER_ELEMENT_TAG);
        element.classList.add(Cursor.CURSOR_CLASS);
        element.id = "ql-cursor-" + this.id;
        element.innerHTML = options.template;
        var selectionElement = element.getElementsByClassName(Cursor.SELECTION_CLASS)[0];
        var caretContainerElement = element.getElementsByClassName(Cursor.CARET_CONTAINER_CLASS)[0];
        var caretElement = caretContainerElement.getElementsByClassName(Cursor.CARET_CLASS)[0];
        var flagElement = element.getElementsByClassName(Cursor.FLAG_CLASS)[0];
        flagElement.style.backgroundColor = this.color;
        caretElement.style.backgroundColor = this.color;
        element.getElementsByClassName(Cursor.NAME_CLASS)[0].textContent = this.name;
        this._hideDelay = options.hideDelayMs + "ms";
        this._hideSpeedMs = options.hideSpeedMs;
        this._positionFlag = options.positionFlag;
        flagElement.style.transitionDelay = this._hideDelay;
        flagElement.style.transitionDuration = this._hideSpeedMs + "ms";
        this._el = element;
        this._selectionEl = selectionElement;
        this._caretEl = caretContainerElement;
        this._flagEl = flagElement;
        return this._el;
    };
    Cursor.prototype.show = function () {
        this._el.classList.remove(Cursor.HIDDEN_CLASS);
    };
    Cursor.prototype.hide = function () {
        this._el.classList.add(Cursor.HIDDEN_CLASS);
    };
    Cursor.prototype.remove = function () {
        this._el.parentNode.removeChild(this._el);
    };
    Cursor.prototype.toggleFlag = function (shouldShow) {
        var _this = this;
        var isShown = this._flagEl.classList.toggle(Cursor.SHOW_FLAG_CLASS, shouldShow);
        if (isShown)
            return;
        this._flagEl.classList.add(Cursor.NO_DELAY_CLASS);
        setTimeout(function () { return _this._flagEl.classList.remove(Cursor.NO_DELAY_CLASS); }, this._hideSpeedMs);
    };
    Cursor.prototype.updateCaret = function (rectangle, container) {
        this._caretEl.style.top = rectangle.top + "px";
        this._caretEl.style.left = rectangle.left + "px";
        this._caretEl.style.height = rectangle.height + "px";
        if (this._positionFlag) {
            this._positionFlag(this._flagEl, rectangle, container);
        }
        else {
            this._updateCaretFlag(rectangle, container);
        }
    };
    Cursor.prototype.updateSelection = function (selections, container) {
        var _this = this;
        this._clearSelection();
        selections = selections || [];
        selections = Array.from(selections);
        selections = this._sanitize(selections);
        selections = this._sortByDomPosition(selections);
        selections.forEach(function (selection) { return _this._addSelection(selection, container); });
    };
    Cursor.prototype._updateCaretFlag = function (caretRectangle, container) {
        this._flagEl.style.width = '';
        var flagRect = this._flagEl.getBoundingClientRect();
        this._flagEl.classList.remove(Cursor.FLAG_FLIPPED_CLASS);
        if (caretRectangle.left > container.width - flagRect.width) {
            this._flagEl.classList.add(Cursor.FLAG_FLIPPED_CLASS);
        }
        this._flagEl.style.left = caretRectangle.left + "px";
        this._flagEl.style.top = caretRectangle.top + "px";
        this._flagEl.style.width = Math.ceil(flagRect.width) + "px";
    };
    Cursor.prototype._clearSelection = function () {
        this._selectionEl.innerHTML = '';
    };
    Cursor.prototype._addSelection = function (selection, container) {
        var selectionBlock = this._selectionBlock(selection, container);
        this._selectionEl.appendChild(selectionBlock);
    };
    Cursor.prototype._selectionBlock = function (selection, container) {
        var element = document.createElement(Cursor.SELECTION_ELEMENT_TAG);
        element.classList.add(Cursor.SELECTION_BLOCK_CLASS);
        element.style.top = selection.top - container.top + "px";
        element.style.left = selection.left - container.left + "px";
        element.style.width = selection.width + "px";
        element.style.height = selection.height + "px";
        element.style.backgroundColor = tinycolor(this.color).setAlpha(0.3).toString();
        return element;
    };
    Cursor.prototype._sortByDomPosition = function (selections) {
        return selections.sort(function (a, b) {
            if (a.top === b.top) {
                return a.left - b.left;
            }
            return a.top - b.top;
        });
    };
    Cursor.prototype._sanitize = function (selections) {
        var _this = this;
        var serializedSelections = new Set();
        return selections.filter(function (selection) {
            if (!selection.width || !selection.height) {
                return false;
            }
            var serialized = _this._serialize(selection);
            if (serializedSelections.has(serialized)) {
                return false;
            }
            serializedSelections.add(serialized);
            return true;
        });
    };
    Cursor.prototype._serialize = function (selection) {
        return [
            "top:" + selection.top,
            "right:" + selection.right,
            "bottom:" + selection.bottom,
            "left:" + selection.left,
        ].join(';');
    };
    Cursor.CONTAINER_ELEMENT_TAG = 'SPAN';
    Cursor.SELECTION_ELEMENT_TAG = 'SPAN';
    Cursor.CURSOR_CLASS = 'ql-cursor';
    Cursor.SELECTION_CLASS = 'ql-cursor-selections';
    Cursor.SELECTION_BLOCK_CLASS = 'ql-cursor-selection-block';
    Cursor.CARET_CLASS = 'ql-cursor-caret';
    Cursor.CARET_CONTAINER_CLASS = 'ql-cursor-caret-container';
    Cursor.FLAG_CLASS = 'ql-cursor-flag';
    Cursor.SHOW_FLAG_CLASS = 'show-flag';
    Cursor.FLAG_FLIPPED_CLASS = 'flag-flipped';
    Cursor.NAME_CLASS = 'ql-cursor-name';
    Cursor.HIDDEN_CLASS = 'hidden';
    Cursor.NO_DELAY_CLASS = 'no-delay';
    return Cursor;
}());
exports.default = Cursor;
//# sourceMappingURL=cursor.js.map