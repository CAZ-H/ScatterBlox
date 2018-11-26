(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _request = require("./utility/request");

var _page = require("./utility/page");

var _create = require("./utility/create");

var _storage = require("./utility/storage");

var rootContainer = document.querySelector('.left-wrapper .section-content');

if (rootContainer) {
  var MAX_ACCESSORIES = 10;
  var USER_ID = (0, _page.getUserId)();

  var getOwnedAssets = function getOwnedAssets(userId, assetType) {
    var url = "https://inventory.roblox.com/v1/users/".concat(userId, "/inventory/").concat(assetType, "?itemsPerPage=5000");
    return (0, _request.sendReq)(url, null, 'GET');
  };

  var getWornAssets = function getWornAssets(userId) {
    var url = "https://avatar.roblox.com/v1/users/".concat(userId, "/avatar");
    return (0, _request.sendReq)(url, null, 'GET');
  };

  var getOwnedAccessories = function getOwnedAccessories(assetTypes) {
    var promises = assetTypes.map(function (assetType) {
      return getOwnedAssets(USER_ID, assetType);
    });
    return Promise.all(promises);
  };

  var getWornAccessories = function getWornAccessories(assetTypeNames) {
    return new Promise(function (resolve, reject) {
      getWornAssets(USER_ID).then(function (assets) {
        resolve(assets.assets.filter(function (asset) {
          return assetTypeNames.includes(asset.assetType.name);
        }).map(function (asset) {
          return asset.id;
        }));
      }).catch(function (error) {
        console.log('[ScatterBlox]\n', error.stack);
        reject([]);
      });
    });
  };

  var wearAssets = function wearAssets(list) {
    var url = 'https://avatar.roblox.com/v1/avatar/set-wearing-assets';
    var body = JSON.stringify(list);
    (0, _request.sendReq)(url, body, 'POST').then(function () {
      location.reload();
    }).catch(function (error) {
      console.log('[ScatterBlox]\n', error.stack);
    });
  };

  var randomizeAvatar = function randomizeAvatar() {
    var randomBodyParts = [];
    (0, _storage.getOption)('randomizeArms') && randomBodyParts.push("RightArm", "LeftArm");
    (0, _storage.getOption)('randomizeLegs') && randomBodyParts.push("RightLeg", "LeftLeg");
    (0, _storage.getOption)('randomizeTorso') && randomBodyParts.push("Torso");
    (0, _storage.getOption)('randomizeHead') && randomBodyParts.push("Head", "Face");
    var bodyAssets = getOwnedAccessories(randomBodyParts);
    var randomAccessories = [];
    (0, _storage.getOption)('randomizeHair') && randomAccessories.push("HairAccessory");
    (0, _storage.getOption)('randomizeFace') && randomAccessories.push("FaceAccessory");
    (0, _storage.getOption)('randomizeNeck') && randomAccessories.push("NeckAccessory");
    (0, _storage.getOption)('randomizeShoulder') && randomAccessories.push("ShoulderAccessory");
    (0, _storage.getOption)('randomizeFront') && randomAccessories.push("FrontAccessory");
    (0, _storage.getOption)('randomizeBack') && randomAccessories.push("BackAccessory");
    (0, _storage.getOption)('randomizeWaist') && randomAccessories.push("WaistAccessory");
    var accessoryAssets = getOwnedAccessories(randomAccessories);
    var frozenBodyParts = [];
    !(0, _storage.getOption)('randomizeArms') && frozenBodyParts.push("Right Arm", "Left Arm");
    !(0, _storage.getOption)('randomizeLegs') && frozenBodyParts.push("Right Leg", "Left Leg");
    !(0, _storage.getOption)('randomizeTorso') && frozenBodyParts.push("Torso");
    !(0, _storage.getOption)('randomizeHead') && frozenBodyParts.push("Head", "Face");
    var frozenAssets = getWornAccessories(frozenBodyParts);
    Promise.all([bodyAssets, accessoryAssets, frozenAssets]).then(function (values) {
      var list = {
        assetIds: []
      }; // Select body parts

      list.assetIds = list.assetIds.concat(values[0].map(function (assetList) {
        return assetList.data[~~(Math.random() * assetList.total)];
      })); // Select accessories

      for (var i = 0; i < (0, _storage.getOption)('numAccessories'); i++) {
        var randomAssetList = values[1][~~(Math.random() * values[1].length)];
        list.assetIds.push(randomAssetList.data[~~(Math.random() * randomAssetList.total)]);
      } // Select frozen body parts


      list.assetIds = list.assetIds.concat(values[2]); // Wear all

      wearAssets(list);
    }).catch(function (error) {
      console.log('[ScatterBlox]\n', error.stack);
    });
  };

  var createOptions = function createOptions() {
    var optionsContainer = document.createElement('div');
    var bodyHeader = (0, _create.createHeader)('Body');
    var accessoryHeader = (0, _create.createHeader)('Accessories'); // Body options

    var randomizeHead = (0, _create.createCheckboxOption)("randomizeHead", "Head", (0, _storage.getOption)('randomizeHead'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeHead");
    });
    var randomizeTorso = (0, _create.createCheckboxOption)("randomizeTorso", "Torso", (0, _storage.getOption)('randomizeTorso'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeTorso");
    });
    var randomizeArms = (0, _create.createCheckboxOption)("randomizeArms", "Arms", (0, _storage.getOption)('randomizeArms'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeArms");
    });
    var randomizeLegs = (0, _create.createCheckboxOption)("randomizeLegs", "Legs", (0, _storage.getOption)('randomizeLegs'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeLegs");
    }); // Accessory options

    var numAccessories = (0, _create.createNumberInput)("numAccessories", "How Many", (0, _storage.getOption)('numAccessories'), 0, MAX_ACCESSORIES, function (e) {
      (0, _storage.setOption)(e.target.value, "numAccessories");
    });
    var randomizeHair = (0, _create.createCheckboxOption)("randomizeHair", "Hair", (0, _storage.getOption)('randomizeHair'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeHair");
    });
    var randomizeFace = (0, _create.createCheckboxOption)("randomizeFace", "Face", (0, _storage.getOption)('randomizeFace'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeFace");
    });
    var randomizeNeck = (0, _create.createCheckboxOption)("randomizeNeck", "Neck", (0, _storage.getOption)('randomizeNeck'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeNeck");
    });
    var randomizeShoulder = (0, _create.createCheckboxOption)("randomizeShoulder", "Shoulder", (0, _storage.getOption)('randomizeShoulder'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeShoulder");
    });
    var randomizeFront = (0, _create.createCheckboxOption)("randomizeFront", "Front", (0, _storage.getOption)('randomizeFront'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeFront");
    });
    var randomizeBack = (0, _create.createCheckboxOption)("randomizeBack", "Back", (0, _storage.getOption)('randomizeBack'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeBack");
    });
    var randomizeWaist = (0, _create.createCheckboxOption)("randomizeWaist", "Waist", (0, _storage.getOption)('randomizeWaist'), function (e) {
      (0, _storage.setOption)(e.target.checked, "randomizeWaist");
    });
    (0, _create.massAppend)(optionsContainer, [bodyHeader, randomizeHead, randomizeTorso, randomizeArms, randomizeLegs, accessoryHeader, numAccessories, randomizeHair, randomizeFace, randomizeNeck, randomizeShoulder, randomizeFront, randomizeBack, randomizeWaist]);
    return optionsContainer;
  };

  var createPanel = function createPanel() {
    var container = document.createElement('div');
    container.setAttribute('style', 'margin: auto; height: 150px; overflow-y: scroll; width: 100%');
    var buttonContainer = document.createElement('div');
    var button = document.createElement('button');
    buttonContainer.setAttribute('style', 'display: flex');
    buttonContainer.appendChild(button);
    button.textContent = 'Randomize';
    button.setAttribute('class', '.btn-control.btn-control-small');
    button.setAttribute('style', 'margin: 8px auto');
    button.addEventListener('click', randomizeAvatar);
    container.appendChild(buttonContainer);
    container.appendChild(createOptions());
    rootContainer.appendChild(container);
  };

  _storage.optionsLoaded.then(function () {
    createPanel();
    console.log('[ScatterBlox] Loaded');
  });
} else {
  console.log('[ScatterBlox] Could not find mount in DOM');
}

},{"./utility/create":2,"./utility/page":3,"./utility/request":4,"./utility/storage":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.massAppend = exports.createHeader = exports.createNumberInput = exports.createCheckboxOption = void 0;

var createCheckboxOption = function createCheckboxOption(internalName, textName, defaultValue, onChange) {
  var optionContainer = document.createElement('div');
  optionContainer.setAttribute('style', 'display: flex; margin: 2px 0');
  var textContainer = document.createElement('div');
  textContainer.setAttribute('style', 'flex: 0 0 100px');
  textContainer.textContent = textName;
  var option = document.createElement('input');
  option.setAttribute('type', 'checkbox');
  option.setAttribute('style', 'flex-grow: 1');
  defaultValue ? option.checked = true : option.checked = false;
  option.addEventListener('change', onChange);
  optionContainer.appendChild(textContainer);
  optionContainer.appendChild(option);
  return optionContainer;
};

exports.createCheckboxOption = createCheckboxOption;

var createNumberInput = function createNumberInput(internalName, textName, defaultValue) {
  var min = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '0';
  var max = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '10';
  var onChange = arguments.length > 5 ? arguments[5] : undefined;
  var optionContainer = document.createElement('div');
  optionContainer.setAttribute('style', 'display: flex; margin: 2px 0');
  var textContainer = document.createElement('div');
  textContainer.setAttribute('style', 'flex: 0 0 100px');
  textContainer.textContent = textName;
  var option = document.createElement('input');
  option.setAttribute('type', 'number');
  option.setAttribute('style', 'flex-grow: 1; width: 100%');
  option.setAttribute('value', defaultValue);
  option.setAttribute('min', min);
  option.setAttribute('max', max);
  option.addEventListener('change', onChange);
  optionContainer.appendChild(textContainer);
  optionContainer.appendChild(option);
  return optionContainer;
};

exports.createNumberInput = createNumberInput;

var createHeader = function createHeader(text) {
  var header = document.createElement('div');
  header.setAttribute('style', 'padding-bottom: 2px; margin-bottom: 4px; text-align: center; padding: 0 auto; border-bottom: 1px solid rgba(0,0,0,0.2)');
  header.textContent = text;
  return header;
};

exports.createHeader = createHeader;

var massAppend = function massAppend(container, children) {
  children.map(function (child) {
    container.appendChild(child);
  });
};

exports.massAppend = massAppend;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCSRFToken = exports.getUserId = void 0;

var getUserId = function getUserId() {
  var meta = document.querySelector('[name="user-data"]');

  if (meta) {
    return meta.getAttribute('data-userid');
  }

  return null;
};

exports.getUserId = getUserId;

var getCSRFToken = function getCSRFToken() {
  var script = document.evaluate('//text()[contains(., "Roblox.XsrfToken.setToken(")]', document, null, XPathResult.STRING_TYPE, null);
  return script.stringValue.match(/(?<=')([A-Za-z0-9+!@#$%^&*()/\\]+)(?=')/)[0]; // Positive lookbehind may not be supported?
};

exports.getCSRFToken = getCSRFToken;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendReq = void 0;

var _page = require("./page");

var sendReq = function sendReq(url, body, method) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function () {
      if (req.readyState === 4 && req.status === 200) {
        try {
          resolve(JSON.parse(req.responseText));
        } catch (e) {
          reject(e);
        }
      }
    };

    req.open(method, url);
    req.setRequestHeader("Content-type", "application/json");
    req.setRequestHeader('X-CSRF-TOKEN', (0, _page.getCSRFToken)());
    req.send(body);
  });
};

exports.sendReq = sendReq;

},{"./page":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setOption = exports.getOption = exports.optionsLoaded = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var options = {
  randomizeHead: true,
  randomizeTorso: true,
  randomizeArms: true,
  randomizeLegs: true,
  randomizeHair: true,
  randomizeFace: true,
  randomizeNeck: true,
  randomizeShoulder: true,
  randomizeFront: true,
  randomizeBack: true,
  randomizeWaist: true,
  numAccessories: 10
};
var optionsLoaded = new Promise(function (resolve) {
  chrome.storage.local.get('scatterblox', function (result) {
    if (result.scatterblox) {
      options = result.scatterblox;
      console.log('[ScatterBlox] Loaded preferences', options);
      resolve();
    } else {
      chrome.storage.local.set({
        scatterblox: _objectSpread({}, options)
      }, function () {
        resolve();
        console.log('[ScatterBlox] Saved preferences', options);
      });
    }
  });
});
exports.optionsLoaded = optionsLoaded;

var setOption = function setOption(value, optionName) {
  options[optionName] = value;
  chrome.storage.local.set({
    scatterblox: options
  }, function () {
    console.log("[ScatterBlox] Set ".concat(optionName, " to ").concat(value));
  });
};

exports.setOption = setOption;

var getOption = function getOption(optionName) {
  return options[optionName];
};

exports.getOption = getOption;

},{}]},{},[1]);
