import { sendReq } from './utility/request';
import { getUserId } from "./utility/page";
import {createCheckboxOption, createHeader, createNumberInput, massAppend} from "./utility/create";
import { optionsLoaded, getOption, setOption } from "./utility/storage";

const rootContainer = document.querySelector('.left-wrapper');

if (rootContainer) {
    const MAX_ACCESSORIES = 10;
    const USER_ID = getUserId();

    const getOwnedAssets = (userId, assetType) => {
        const url = `https://inventory.roblox.com/v1/users/${userId}/inventory/${assetType}?itemsPerPage=5000`;
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
                console.log('[ScatterBlox]\n', error.stack);
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
            console.log('[ScatterBlox]\n', error.stack);
        });
    };

    const randomizeAvatar = () => {
        const randomBodyParts = [];
        getOption('randomizeArms') && randomBodyParts.push("RightArm", "LeftArm");
        getOption('randomizeLegs') && randomBodyParts.push("RightLeg", "LeftLeg");
        getOption('randomizeTorso') && randomBodyParts.push("Torso");
        getOption('randomizeHead') && randomBodyParts.push("Head", "Face");
        const bodyAssets = getOwnedAccessories(randomBodyParts);

        const randomAccessories = [];
        getOption('randomizeHair') && randomAccessories.push("HairAccessory");
        getOption('randomizeFace') && randomAccessories.push("FaceAccessory");
        getOption('randomizeNeck') && randomAccessories.push("NeckAccessory");
        getOption('randomizeShoulder') && randomAccessories.push("ShoulderAccessory");
        getOption('randomizeFront') && randomAccessories.push("FrontAccessory");
        getOption('randomizeBack') && randomAccessories.push("BackAccessory");
        getOption('randomizeWaist') && randomAccessories.push("WaistAccessory");

        const accessoryAssets = getOwnedAccessories(randomAccessories);

        const frozenBodyParts = [];
        !getOption('randomizeArms') && frozenBodyParts.push("Right Arm", "Left Arm");
        !getOption('randomizeLegs') && frozenBodyParts.push("Right Leg", "Left Leg");
        !getOption('randomizeTorso') && frozenBodyParts.push("Torso");
        !getOption('randomizeHead') && frozenBodyParts.push("Head", "Face");
        const frozenAssets = getWornAccessories(frozenBodyParts);

        Promise.all([bodyAssets, accessoryAssets, frozenAssets]).then((values) => {
            let list = {
                assetIds: []
            };
            // Select body parts
            list.assetIds = list.assetIds.concat(values[0].map(assetList => assetList.data[~~(Math.random() * assetList.total)]));
            // Select accessories
            for (let i = 0; i < getOption('numAccessories'); i++) {
                const randomAssetList = values[1][~~(Math.random() * values[1].length)];
                list.assetIds.push(randomAssetList.data[~~(Math.random() * randomAssetList.total)]);
            }
            // Select frozen body parts
            list.assetIds = list.assetIds.concat(values[2]);
            // Wear all
            wearAssets(list);
        }).catch((error) => {
            console.log('[ScatterBlox]\n', error.stack);
        });
    };

    const createOptions = () => {
        const optionsContainer = document.createElement('div');

        const bodyHeader = createHeader('Body');
        const accessoryHeader = createHeader('Accessories');
        // Body options
        const randomizeHead = createCheckboxOption("randomizeHead", "Head", getOption('randomizeHead'),
            e => {setOption(e.target.checked, "randomizeHead")});
        const randomizeTorso = createCheckboxOption("randomizeTorso", "Torso", getOption('randomizeTorso'),
            e => {setOption(e.target.checked, "randomizeTorso")});
        const randomizeArms = createCheckboxOption("randomizeArms", "Arms", getOption('randomizeArms'),
            e => {setOption(e.target.checked, "randomizeArms")});
        const randomizeLegs = createCheckboxOption("randomizeLegs", "Legs", getOption('randomizeLegs'),
            e => {setOption(e.target.checked, "randomizeLegs")});
        // Accessory options
        const numAccessories = createNumberInput("numAccessories", "How Many", getOption('numAccessories'), 0, MAX_ACCESSORIES,
            e => {setOption(e.target.value, "numAccessories")});
        const randomizeHair = createCheckboxOption("randomizeHair", "Hair", getOption('randomizeHair'),
            e => {setOption(e.target.checked, "randomizeHair")});
        const randomizeFace = createCheckboxOption("randomizeFace", "Face", getOption('randomizeFace'),
            e => {setOption(e.target.checked, "randomizeFace")});
        const randomizeNeck = createCheckboxOption("randomizeNeck", "Neck", getOption('randomizeNeck'),
            e => {setOption(e.target.checked, "randomizeNeck")});
        const randomizeShoulder = createCheckboxOption("randomizeShoulder", "Shoulder", getOption('randomizeShoulder'),
            e => {setOption(e.target.checked, "randomizeShoulder")});
        const randomizeFront = createCheckboxOption("randomizeFront", "Front", getOption('randomizeFront'),
            e => {setOption(e.target.checked, "randomizeFront")});
        const randomizeBack = createCheckboxOption("randomizeBack", "Back", getOption('randomizeBack'),
            e => {setOption(e.target.checked, "randomizeBack")});
        const randomizeWaist = createCheckboxOption("randomizeWaist", "Waist", getOption('randomizeWaist'),
            e => {setOption(e.target.checked, "randomizeWaist")});

        massAppend(optionsContainer, [
            bodyHeader,
            randomizeHead,
            randomizeTorso,
            randomizeArms,
            randomizeLegs,

            accessoryHeader,
            numAccessories,
            randomizeHair,
            randomizeFace,
            randomizeNeck,
            randomizeShoulder,
            randomizeFront,
            randomizeBack,
            randomizeWaist
        ]);

        return optionsContainer;
    };

    const createPanel = () => {
        const container = document.createElement('div');
        container.setAttribute('style', 'margin: auto; height: 150px; overflow-y: scroll; width: 100%');

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
        rootContainer.appendChild(container);
    };

    optionsLoaded.then(() => {
        createPanel();
        console.log('[ScatterBlox] Loaded');
    });
} else {
    console.log('[ScatterBlox] Could not find mount in DOM');
}

