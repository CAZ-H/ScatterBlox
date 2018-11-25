const container = document.querySelector('.left-wrapper .section-content');

if (container) {
    const MAX_ACCESSORIES = 10;

    const getCSRFToken = () => {
        let script = document.evaluate('//text()[contains(., "Roblox.XsrfToken.setToken(")]', document, null, XPathResult.STRING_TYPE, null );
        return script.stringValue.match(/(?<=')([A-Za-z0-9!@#$%^&*()/\\]+)(?=')/)[0]; // Positive lookbehind may not be supported?
    };

    const sendReq = (url, body, method, callback, errorCallback) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200)
            {
                try {
                    callback(JSON.parse(req.responseText));
                } catch (e) {
                    errorCallback(e)
                }
            }
        };
        req.open(method, url);
        req.setRequestHeader("Content-type", "application/json");
        req.setRequestHeader('X-CSRF-TOKEN', getCSRFToken());
        req.send(body);
    };

    const getAssets = (userId, assetType, callback, errorCallback) => {
        const url = `https://inventory.roblox.com/v1/users/${userId}/inventory/${assetType}?itemsPerPage=1000`;
        sendReq(url, null, 'GET', callback, errorCallback);
    };

    const getUserId = () => {
        const meta = document.querySelector('[name="user-data"]');
        if (meta) {
            return meta.getAttribute('data-userid');
        }
        return null;
    };

    const getAccessories = (assetTypes, callback) => {
        const promises = assetTypes.map(assetType => (
            new Promise((resolve, reject) => {
                getAssets(getUserId(), assetType, resolve, reject);
            })
        ));

        Promise.all(promises).then((values) => {
            callback(values);
        }).catch((error) => {
            console.log(error.stack);
            callback([]);
        });
    };

    const wearAssets = (list) => {
        const url = 'https://avatar.roblox.com/v1/avatar/set-wearing-assets';
        const body = JSON.stringify(list);
        sendReq(url, body, 'POST', () => {
            location.reload();
        }, (error) => {
            console.log(error.stack);
        });
    };

    const randomizeAvatar = () => {
        const bodyAssets = new Promise((resolve) => {
            getAccessories(["Face", "Head", "Torso", "RightArm", "LeftArm", "RightLeg", "LeftLeg"], resolve);
        });

        const accessoryAssets = new Promise((resolve) => {
            getAccessories(["HairAccessory", "FaceAccessory", "NeckAccessory", "ShoulderAccessory", "FrontAccessory", "BackAccessory", "WaistAccessory"], resolve);
        });

        Promise.all([bodyAssets, accessoryAssets]).then((values) => {
            let list = {
                assetIds: []
            };
            // Select body parts
            list.assetIds = list.assetIds.concat(values[0].map(assetList => assetList.data[~~(Math.random() * assetList.total)]));
            // Select accessories
            for (let i = 0; i < MAX_ACCESSORIES; i++) {
                const randomAssetList = values[1][~~(Math.random() * values[1].length)];
                list.assetIds.push(randomAssetList.data[~~(Math.random() * randomAssetList.total)]);
            }
            // Wear all
            wearAssets(list);
        }).catch((error) => {
            console.log(error.stack);
        });
    };

    const buttonContainer = document.createElement('div');
    const button = document.createElement('button');
    const text = document.createTextNode('Randomize');
    buttonContainer.setAttribute('style', 'display: flex');
    buttonContainer.appendChild(button);
    button.appendChild(text);
    button.setAttribute('class', '.btn-control.btn-control-small');
    button.setAttribute('style', 'margin: auto');
    button.addEventListener('click', randomizeAvatar);

    container.appendChild(buttonContainer);
    console.log('ScatterBlox loaded');
} else {
    console.log('ScatterBlox could not find button container');
}

