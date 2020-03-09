Zotero.FullCreator.zoteroPane =
(Zotero["WebPackedFullCreator"] = Zotero["WebPackedFullCreator"] || []).push([["FullCreator.zoteroPane"],{

/***/ "./monkey-patch.ts":
/*!*************************!*\
  !*** ./monkey-patch.ts ***!
  \*************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const marker = 'FullCreatorMonkeyPatched';
function repatch(object, method, patcher) {
    object[method] = patcher(object[method]);
    object[method][marker] = true;
}
exports.repatch = repatch;
function patch(object, method, patcher) {
    if (object[method][marker])
        throw new Error(`${method} re-patched`);
    repatch(object, method, patcher);
}
exports.patch = patch;


/***/ }),

/***/ "./zoteroPane.ts":
/*!***********************!*\
  !*** ./zoteroPane.ts ***!
  \***********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const monkey_patch_1 = __webpack_require__(/*! ./monkey-patch */ "./monkey-patch.ts");
// import { debug } from './debug'
const PPZoteroPane = new class {
    async load() {
        document.getElementById('zotero-itemmenu').addEventListener('popupshowing', this, false);
        await Zotero.FullCreator.start();
    }
    async unload() {
        document.getElementById('zotero-itemmenu').removeEventListener('popupshowing', this, false);
    }
    handleEvent(event) {
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        this.selectedItem = selectedItems.length ? selectedItems[0] : null;
        if (selectedItems.length !== 1 || !this.selectedItem || !this.selectedItem.isRegularItem() || !this.selectedItem.getField('DOI')) {
            this.selectedItem = null;
        }
        document.getElementById('menu-fullcreator-get-link').hidden = !this.selectedItem;
    }
    run(method, ...args) {
        this[method].apply(this, args).catch(err => Zotero.logError(`${method}: ${err}`));
    }
    async getFullCreatorLink() {
        const doi = this.selectedItem ? this.selectedItem.getField('DOI') : '';
        if (!doi)
            return;
        const feedback = (await Zotero.FullCreator.get([doi]))[0];
        if (feedback) {
            let output = `The selected item has ${feedback.total_comments} ${feedback.total_comments === 1 ? 'comment' : 'comments'} on FullCreator`;
            if (feedback.total_comments)
                output += ` ${feedback.url}`;
            alert(output);
        }
    }
};
// Monkey patch because of https://groups.google.com/forum/#!topic/zotero-dev/zy2fSO1b0aQ
monkey_patch_1.patch(Zotero.getActiveZoteroPane(), 'serializePersist', original => function () {
    original.apply(this, arguments);
    let persisted;
    if (Zotero.FullCreator.uninstalled && (persisted = Zotero.Prefs.get('pane.persist'))) {
        persisted = JSON.parse(persisted);
        delete persisted['zotero-items-column-fullcreator'];
        Zotero.Prefs.set('pane.persist', JSON.stringify(persisted));
    }
});
window.addEventListener('load', event => {
    PPZoteroPane.load().catch(err => Zotero.logError(err));
}, false);
window.addEventListener('unload', event => {
    PPZoteroPane.unload().catch(err => Zotero.logError(err));
}, false);
// otherwise this entry point won't be reloaded: https://github.com/webpack/webpack/issues/156
delete __webpack_require__.c[module.i];
module.exports = PPZoteroPane;


/***/ })

},[["./zoteroPane.ts","webpack"]]]);