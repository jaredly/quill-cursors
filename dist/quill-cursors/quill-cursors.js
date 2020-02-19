"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cursor_1 = __importDefault(require("./cursor"));
var RangeFix = __importStar(require("rangefix"));
var template_1 = __importDefault(require("./template"));
var resize_observer_polyfill_1 = __importDefault(require("resize-observer-polyfill"));
var Delta = require("quill-delta");
var QuillCursors = (function () {
    function QuillCursors(quill, options) {
        if (options === void 0) { options = {}; }
        this._cursors = {};
        this._quill = quill;
        this._options = this._setDefaults(options);
        this._container = this._quill.addContainer(this._options.containerClass);
        this._boundsContainer = this._options.boundsContainer || this._quill.container;
        this._currentSelection = this._quill.getSelection();
        this._registerSelectionChangeListeners();
        this._registerTextChangeListener();
        this._registerDomListeners();
    }
    QuillCursors.prototype.createCursor = function (id, name, color) {
        var cursor = this._cursors[id];
        if (!cursor) {
            cursor = new cursor_1.default(id, name, color);
            this._cursors[id] = cursor;
            var element = cursor.build(this._options);
            this._container.appendChild(element);
        }
        return cursor;
    };
    QuillCursors.prototype.moveCursor = function (id, range) {
        var cursor = this._cursors[id];
        if (!cursor) {
            return;
        }
        cursor.range = range;
        this._updateCursor(cursor);
    };
    QuillCursors.prototype.removeCursor = function (id) {
        var cursor = this._cursors[id];
        if (!cursor) {
            return;
        }
        cursor.remove();
        delete this._cursors[id];
    };
    QuillCursors.prototype.update = function () {
        var _this = this;
        this.cursors().forEach(function (cursor) { return _this._updateCursor(cursor); });
    };
    QuillCursors.prototype.clearCursors = function () {
        var _this = this;
        this.cursors().forEach(function (cursor) { return _this.removeCursor(cursor.id); });
    };
    QuillCursors.prototype.toggleFlag = function (id, shouldShow) {
        var cursor = this._cursors[id];
        if (!cursor) {
            return;
        }
        cursor.toggleFlag(shouldShow);
    };
    QuillCursors.prototype.cursors = function () {
        var _this = this;
        return Object.keys(this._cursors)
            .map(function (key) { return _this._cursors[key]; });
    };
    QuillCursors.prototype._registerSelectionChangeListeners = function () {
        var _this = this;
        this._quill.on(this._quill.constructor.events.SELECTION_CHANGE, function (selection) {
            _this._currentSelection = selection;
        });
    };
    QuillCursors.prototype._registerTextChangeListener = function () {
        var _this = this;
        this._quill.on(this._quill.constructor.events.TEXT_CHANGE, function (delta) { return _this._handleTextChange(delta); });
    };
    QuillCursors.prototype._registerDomListeners = function () {
        var _this = this;
        var editor = this._quill.container.getElementsByClassName('ql-editor')[0];
        editor.addEventListener('scroll', function () { return _this.update(); });
        var resizeObserver = new resize_observer_polyfill_1.default(function () { return _this.update(); });
        resizeObserver.observe(editor);
    };
    QuillCursors.prototype._updateCursor = function (cursor) {
        if (!cursor.range) {
            return cursor.hide();
        }
        var startIndex = this._indexWithinQuillBounds(cursor.range.index);
        var endIndex = this._indexWithinQuillBounds(cursor.range.index + cursor.range.length);
        var startLeaf = this._quill.getLeaf(startIndex);
        var endLeaf = this._quill.getLeaf(endIndex);
        if (!this._leafIsValid(startLeaf) || !this._leafIsValid(endLeaf)) {
            return cursor.hide();
        }
        cursor.show();
        var containerRectangle = this._boundsContainer.getBoundingClientRect();
        var endBounds = this._quill.getBounds(endIndex);
        cursor.updateCaret(endBounds, containerRectangle);
        var ranges = this._lineRanges(cursor, startLeaf, endLeaf);
        var selectionRectangles = ranges
            .reduce(function (rectangles, range) { return rectangles.concat(Array.from(RangeFix.getClientRects(range))); }, []);
        cursor.updateSelection(selectionRectangles, containerRectangle);
    };
    QuillCursors.prototype._indexWithinQuillBounds = function (index) {
        var quillLength = this._quill.getLength();
        var maxQuillIndex = quillLength ? quillLength - 1 : 0;
        index = Math.max(index, 0);
        index = Math.min(index, maxQuillIndex);
        return index;
    };
    QuillCursors.prototype._leafIsValid = function (leaf) {
        return leaf && leaf[0] && leaf[0].domNode && leaf[1] >= 0;
    };
    QuillCursors.prototype._handleTextChange = function (delta) {
        var _this = this;
        window.setTimeout(function () {
            if (_this._options.transformOnTextChange) {
                _this._transformCursors(delta);
            }
            if (_this._options.selectionChangeSource) {
                _this._emitSelection();
                _this.update();
            }
        });
    };
    QuillCursors.prototype._emitSelection = function () {
        this._quill.emitter.emit(this._quill.constructor.events.SELECTION_CHANGE, this._quill.getSelection(), this._currentSelection, this._options.selectionChangeSource);
    };
    QuillCursors.prototype._setDefaults = function (options) {
        options = Object.assign({}, options);
        options.template = options.template || template_1.default;
        options.containerClass = options.containerClass || 'ql-cursors';
        if (options.selectionChangeSource !== null) {
            options.selectionChangeSource = options.selectionChangeSource || this._quill.constructor.sources.API;
        }
        options.hideDelayMs = Number.isInteger(options.hideDelayMs) ? options.hideDelayMs : 3000;
        options.hideSpeedMs = Number.isInteger(options.hideSpeedMs) ? options.hideSpeedMs : 400;
        options.transformOnTextChange = !!options.transformOnTextChange;
        return options;
    };
    QuillCursors.prototype._lineRanges = function (cursor, startLeaf, endLeaf) {
        var lines = this._quill.getLines(cursor.range);
        return lines.reduce(function (ranges, line, index) {
            if (!line.children) {
                var singleElementRange = document.createRange();
                singleElementRange.selectNode(line.domNode);
                return ranges.concat(singleElementRange);
            }
            var _a = index === 0 ?
                startLeaf :
                line.path(0).pop(), rangeStart = _a[0], startOffset = _a[1];
            var _b = index === lines.length - 1 ?
                endLeaf :
                line.path(line.length() - 1).pop(), rangeEnd = _b[0], endOffset = _b[1];
            var range = document.createRange();
            range.setStart(rangeStart.domNode, startOffset);
            range.setEnd(rangeEnd.domNode, endOffset);
            return ranges.concat(range);
        }, []);
    };
    QuillCursors.prototype._transformCursors = function (delta) {
        var _this = this;
        delta = new Delta(delta);
        this.cursors()
            .filter(function (cursor) { return cursor.range; })
            .forEach(function (cursor) {
            cursor.range.index = delta.transformPosition(cursor.range.index);
            _this._updateCursor(cursor);
        });
    };
    return QuillCursors;
}());
exports.default = QuillCursors;
//# sourceMappingURL=quill-cursors.js.map