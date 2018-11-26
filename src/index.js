import { sendReq } from './utility/request';
import { getUserId } from "./utility/page";

const container = document.querySelector('.left-wrapper .section-content');

if (container) {
    const MAX_ACCESSORIES = 10;
    const USER_ID = getUserId();

    const options = {
        randomizeHead: true,
        randomizeTorso: true,
        randomizeArms: true,
        randomizeLegs: true
    };

    const getOwnedAssets = (userId, assetType) => {
        const url = `https://inventory.roblox.com/v1/users/${userId}/inventory/${assetType}?itemsPerPage=1000`;
        return sendReq(url, null, 'GET');
    };

    const getWornAssets = (userId) => {
        const url = `https://avatar.roblox.com/v1/users/${userId}/avatar`;
        return sendReq(url, null, 'GET');
    };

    const getOwnedAccessories = (assetTypes) => {
        const promises = assetTypes.map(assetType => (
            getOwnedAssets(USER_ID, assetType)
        ));

        return Promise.all(promises);
    };

    const getWornAccessories = (assetTypeNames) => {
        return new Promise ((resolve, reject) => {
            getWornAssets(USER_ID).then(assets => {
                resolve(assets.assets.filter(asset => assetTypeNames.includes(asset.assetType.name)).map(asset => asset.id));
            }).catch(error => {
                console.log(error.stack);
                reject([]);
            });
        })
    };

    const wearAssets = (list) => {
        const url = 'https://avatar.roblox.com/v1/avatar/set-wearing-assets';
        const body = JSON.stringify(list);
        sendReq(url, body, 'POST').then(() => {
            location.reload();
        }).catch(error => {
            console.log(error.stack);
        });
    };

    const randomizeAvatar = () => {
        const randomBodyParts = [];
        options.randomizeArms && randomBodyParts.push("RightArm", "LeftArm");
        options.randomizeLegs && randomBodyParts.push("RightLeg", "LeftLeg");
        options.randomizeTorso && randomBodyParts.push("Torso");
        options.randomizeHead && randomBodyParts.push("Head", "Face");
        const bodyAssets = getOwnedAccessories(randomBodyParts);

        const accessoryAssets = getOwnedAccessories(["HairAccessory", "FaceAccessory", "NeckAccessory", "ShoulderAccessory", "FrontAccessory", "BackAccessory", "WaistAccessory"]);

        const frozenBodyParts = [];
        !options.randomizeArms && frozenBodyParts.push("Right Arm", "Left Arm");
        !options.randomizeLegs && frozenBodyParts.push("Right Leg", "Left Leg");
        !options.randomizeTorso && frozenBodyParts.push("Torso");
        !options.randomizeHead && frozenBodyParts.push("Head", "Face");
        const frozenAssets = getWornAccessories(frozenBodyParts);

        Promise.all([bodyAssets, accessoryAssets, frozenAssets]).then((values) => {
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
            // Select frozen body parts
            list.assetIds = list.assetIds.concat(values[2]);
            // Wear all
            wearAssets(list);
        }).catch((error) => {
            console.log(error.stack);
        });
    };

    const setOption = (value, optionName) => {
        console.log(`Set ${optionName} to ${value}`);
        options[optionName] = value;
    };

    const createCheckboxOption = (internalName, textName, onChange) => {
        const optionContainer = document.createElement('div');
        optionContainer.setAttribute('style', 'display: flex; margin: 2px 0');

        const text = document.createTextNode(textName);
        const textContainer = document.createElement('div');
        textContainer.setAttribute('style', 'flex: 0 0 100px');
        textContainer.appendChild(text);

        const option = document.createElement('input');
        option.setAttribute('type', 'checkbox');
        option.setAttribute('style', 'flex-grow: 1');
        option.setAttribute('checked', options[internalName]);
        option.addEventListener('change', onChange);

        optionContainer.appendChild(textContainer);
        optionContainer.appendChild(option);
        return optionContainer;
    };

    const createOptions = () => {
        const optionsContainer = document.createElement('div');

        const bodyHeader = document.createElement('div');
        bodyHeader.setAttribute('style', 'padding-bottom: 2px; margin-bottom: 4px; text-align: center; padding: 0 auto; border-bottom: 1px solid rgba(0,0,0,0.2)');
        bodyHeader.textContent = 'Body';

        const randomizeHead = createCheckboxOption("randomizeHead", "Head", (e) => {setOption(e.target.checked, "randomizeHead")});
        const randomizeTorso = createCheckboxOption("randomizeTorso", "Torso", (e) => {setOption(e.target.checked, "randomizeTorso")});
        const randomizeArms = createCheckboxOption("randomizeArms", "Arms", (e) => {setOption(e.target.checked, "randomizeArms")});
        const randomizeLegs = createCheckboxOption("randomizeLegs", "Legs", (e) => {setOption(e.target.checked, "randomizeLegs")});

        optionsContainer.appendChild(bodyHeader);
        optionsContainer.appendChild(randomizeHead);
        optionsContainer.appendChild(randomizeTorso);
        optionsContainer.appendChild(randomizeArms);
        optionsContainer.appendChild(randomizeLegs);
        return optionsContainer;
    };

    const createPanel = () => {
        const buttonContainer = document.createElement('div');
        const button = document.createElement('button');

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

