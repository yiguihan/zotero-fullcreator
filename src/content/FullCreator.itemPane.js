Zotero.FullCreator.itemPane =
(Zotero["WebPackedFullCreator"] = Zotero["WebPackedFullCreator"] || []).push([["FullCreator.itemPane"],{

/***/ "./debug.ts":
/*!******************!*\
  !*** ./debug.ts ***!
  \******************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function debug(...msg) {
    const str = `FullCreator: ${msg.map(s => s.toString()).join(' ')}`;
    // console.error(str) // tslint:disable-line:no-console
    Zotero.debug(str);
}
exports.debug = debug;


/***/ }),

/***/ "./itemPane.ts":
/*!*********************!*\
  !*** ./itemPane.ts ***!
  \*********************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const monkey_patch_1 = __webpack_require__(/*! ./monkey-patch */ "./monkey-patch.ts");
const debug_1 = __webpack_require__(/*! ./debug */ "./debug.ts");
const states = {
    name: ['neutral', 'priority', 'muted'],
    label: { muted: '\u2612', neutral: '\u2610', priority: '\u2611' },
};
function toggleUser() {
    const user = this.getAttribute('data-user');
    const state = states.name[(states.name.indexOf(this.getAttribute('data-state')) + 1) % states.name.length];
    Zotero.FullCreator.users[user] = state; // bypass TS2322
    this.parentElement.setAttribute('class', `fullcreator-user fullcreator-user-${state}`);
    this.value = states.label[state];
    this.setAttribute('data-state', state);
    Zotero.FullCreator.save();
    // update display panes by issuing a fake item-update notification
    if (PPItemPane.item) {
        Zotero.Notifier.trigger('modify', 'item', [PPItemPane.item.id]);
    }
    else {
        debug_1.debug('toggleUser but no item set?');
    }
}
const xul = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
const PPItemPane = new class {
    constructor() {
        this.item = null;
        this.observer = null;
        this.dom = {
            parser: Components.classes['@mozilla.org/xmlextras/domparser;1'].createInstance(Components.interfaces.nsIDOMParser),
            serializer: Components.classes['@mozilla.org/xmlextras/xmlserializer;1'].createInstance(Components.interfaces.nsIDOMSerializer),
        };
    }
    async notify(action, type, ids) {
        if (!this.item || !ids.includes(this.item.id))
            return;
        switch (action) {
            case 'delete':
            case 'trash':
                this.item = null;
                break;
            case 'add':
            case 'modify':
                break;
        }
        await this.refresh();
    }
    async load() {
        this.observer = Zotero.Notifier.registerObserver(this, ['item'], 'FullCreator');
    }
    async unload() {
        Zotero.Notifier.unregisterObserver(this.observer);
    }
    async refresh() {
        var _a;
        const container = document.getElementById('zotero-editpane-fullcreator');
        for (const hbox of Array.from(container.getElementsByTagNameNS(xul, 'hbox'))) {
            hbox.remove();
        }
        const doi = (_a = this.item) === null || _a === void 0 ? void 0 : _a.getField('DOI');
        let summary = Zotero.FullCreator.getString('itemPane.noComment');
        const feedback = doi && (await Zotero.FullCreator.get([doi]))[0];
        if (feedback) {
            summary = Zotero.FullCreator.getString('itemPane.summary', Object.assign(Object.assign({}, feedback), { users: feedback.users.join(', '), last_commented_at: feedback.last_commented_at.toLocaleString() }), true);
            summary = `<div xmlns:html="http://www.w3.org/1999/xhtml">${summary}</div>`;
            summary = summary.replace(/(<\/?)/g, '$1html:');
            const html = this.dom.parser.parseFromString(summary, 'text/xml');
            for (const a of html.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'a')) {
                if (!a.getAttribute('href'))
                    continue;
                a.setAttribute('onclick', 'Zotero.launchURL(this.getAttribute("href")); return false;');
                a.setAttribute('style', 'color: blue');
            }
            summary = this.dom.serializer.serializeToString(html);
            debug_1.debug(`FullCreator.ZoteroItemPane.refresh: ${JSON.stringify(feedback)}: ${summary}`);
            for (const user of feedback.users) {
                Zotero.FullCreator.users[user] = Zotero.FullCreator.users[user] || 'neutral';
                const hbox = container.appendChild(document.createElementNS(xul, 'hbox'));
                hbox.setAttribute('align', 'center');
                hbox.setAttribute('class', `fullcreator-user fullcreator-user-${Zotero.FullCreator.users[user]}`);
                const cb = hbox.appendChild(document.createElementNS(xul, 'label'));
                const state = Zotero.FullCreator.users[user];
                cb.setAttribute('class', 'fullcreator-checkbox');
                cb.value = states.label[state];
                cb.setAttribute('data-user', user);
                cb.setAttribute('data-state', state);
                cb.onclick = toggleUser;
                const label = hbox.appendChild(document.createElementNS(xul, 'label'));
                label.setAttribute('class', 'fullcreator-username');
                label.setAttribute('value', user);
                label.setAttribute('flex', '8');
            }
        }
        document.getElementById('zotero-editpane-fullcreator-summary').innerHTML = summary;
    }
};
monkey_patch_1.patch(ZoteroItemPane, 'viewItem', original => async function (item, mode, index) {
    let pubPeerIndex = -1;
    try {
        PPItemPane.item = item;
        const tabPanels = document.getElementById('zotero-editpane-tabs');
        pubPeerIndex = Array.from(tabPanels.children).findIndex(child => child.id === 'zotero-editpane-fullcreator-tab');
        PPItemPane.refresh();
    }
    catch (err) {
        Zotero.logError(`FullCreator.ZoteroItemPane.viewItem: ${err}`);
        pubPeerIndex = -1;
    }
    if (index !== pubPeerIndex)
        return await original.apply(this, arguments);
});
window.addEventListener('load', event => {
    PPItemPane.load().catch(err => Zotero.logError(err));
}, false);
window.addEventListener('unload', event => {
    PPItemPane.unload().catch(err => Zotero.logError(err));
}, false);
delete __webpack_require__.c[module.i];


/***/ }),

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


/***/ })

},[["./itemPane.ts","webpack"]]]);