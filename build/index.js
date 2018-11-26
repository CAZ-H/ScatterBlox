(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _request = require("./utility/request");

var _page = require("./utility/page");

var container = document.querySelector('.left-wrapper .section-content');

if (container) {
  var MAX_ACCESSORIES = 10;
  var USER_ID = (0, _page.getUserId)();
  var options = {
    randomizeHead: true,
    randomizeTorso: true,
    randomizeArms: true,
    randomizeLegs: true
  };

  var getOwnedAssets = function getOwnedAssets(userId, assetType) {
    var url = "https://inventory.roblox.com/v1/users/".concat(userId, "/inventory/").concat(assetType, "?itemsPerPage=1000");
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
        console.log(error.stack);
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
      console.log(error.stack);
    });
  };

  var randomizeAvatar = function randomizeAvatar() {
    var randomBodyParts = [];
    options.randomizeArms && randomBodyParts.push("RightArm", "LeftArm");
    options.randomizeLegs && randomBodyParts.push("RightLeg", "LeftLeg");
    options.randomizeTorso && randomBodyParts.push("Torso");
    options.randomizeHead && randomBodyParts.push("Head", "Face");
    var bodyAssets = getOwnedAccessories(randomBodyParts);
    var accessoryAssets = getOwnedAccessories(["HairAccessory", "FaceAccessory", "NeckAccessory", "ShoulderAccessory", "FrontAccessory", "BackAccessory", "WaistAccessory"]);
    var frozenBodyParts = [];
    !options.randomizeArms && frozenBodyParts.push("Right Arm", "Left Arm");
    !options.randomizeLegs && frozenBodyParts.push("Right Leg", "Left Leg");
    !options.randomizeTorso && frozenBodyParts.push("Torso");
    !options.randomizeHead && frozenBodyParts.push("Head", "Face");
    var frozenAssets = getWornAccessories(frozenBodyParts);
    Promise.all([bodyAssets, accessoryAssets, frozenAssets]).then(function (values) {
      var list = {
        assetIds: []
      }; // Select body parts

      list.assetIds = list.assetIds.concat(values[0].map(function (assetList) {
        return assetList.data[~~(Math.random() * assetList.total)];
      })); // Select accessories

      for (var i = 0; i < MAX_ACCESSORIES; i++) {
        var randomAssetList = values[1][~~(Math.random() * values[1].length)];
        list.assetIds.push(randomAssetList.data[~~(Math.random() * randomAssetList.total)]);
      } // Select frozen body parts


      list.assetIds = list.assetIds.concat(values[2]); // Wear all

      wearAssets(list);
    }).catch(function (error) {
      console.log(error.stack);
    });
  };

  var setOption = function setOption(value, optionName) {
    console.log("Set ".concat(optionName, " to ").concat(value));
    options[optionName] = value;
  };

  var createCheckboxOption = function createCheckboxOption(internalName, textName, onChange) {
    var optionContainer = document.createElement('div');
    optionContainer.setAttribute('style', 'display: flex; margin: 2px 0');
    var text = document.createTextNode(textName);
    var textContainer = document.createElement('div');
    textContainer.setAttribute('style', 'flex: 0 0 100px');
    textContainer.appendChild(text);
    var option = document.createElement('input');
    option.setAttribute('type', 'checkbox');
    option.setAttribute('style', 'flex-grow: 1');
    option.setAttribute('checked', options[internalName]);
    option.addEventListener('change', onChange);
    optionContainer.appendChild(textContainer);
    optionContainer.appendChild(option);
    return optionContainer;
  };

  var createOptions = function createOptions() {
    var optionsContainer = document.createElement('div');
    var bodyHeader = document.createElement('div');
    bodyHeader.setAttribute('style', 'padding-bottom: 2px; margin-bottom: 4px; text-align: center; padding: 0 auto; border-bottom: 1px solid rgba(0,0,0,0.2)');
    bodyHeader.textContent = 'Body';
    var randomizeHead = createCheckboxOption("randomizeHead", "Head", function (e) {
      setOption(e.target.checked, "randomizeHead");
    });
    var randomizeTorso = createCheckboxOption("randomizeTorso", "Torso", function (e) {
      setOption(e.target.checked, "randomizeTorso");
    });
    var randomizeArms = createCheckboxOption("randomizeArms", "Arms", function (e) {
      setOption(e.target.checked, "randomizeArms");
    });
    var randomizeLegs = createCheckboxOption("randomizeLegs", "Legs", function (e) {
      setOption(e.target.checked, "randomizeLegs");
    });
    optionsContainer.appendChild(bodyHeader);
    optionsContainer.appendChild(randomizeHead);
    optionsContainer.appendChild(randomizeTorso);
    optionsContainer.appendChild(randomizeArms);
    optionsContainer.appendChild(randomizeLegs);
    return optionsContainer;
  };

  var createPanel = function createPanel() {
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
  };

  createPanel();
  console.log('ScatterBlox loaded');
} else {
  console.log('ScatterBlox could not find button container');
}

},{"./utility/page":2,"./utility/request":3}],2:[function(require,module,exports){
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
  return script.stringValue.match(/(?<=')([A-Za-z0-9!@#$%^&*()/\\]+)(?=')/)[0]; // Positive lookbehind may not be supported?
};

exports.getCSRFToken = getCSRFToken;

},{}],3:[function(require,module,exports){
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

},{"./page":2}]},{},[1]);
