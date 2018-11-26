let options = {
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

const optionsLoaded = new Promise((resolve) => {
    chrome.storage.local.get('scatterblox', (result) => {
        if (result.scatterblox) {
            options = result.scatterblox;
            console.log('[ScatterBlox] Loaded preferences', options);
            resolve();
        } else {
            chrome.storage.local.set({
                scatterblox: {...options}
            }, () => {
                resolve();
                console.log('[ScatterBlox] Saved preferences', options);
            });
        }
    });
});

const setOption = (value, optionName) => {
    options[optionName] = value;

    chrome.storage.local.set({
        scatterblox: options
    }, () => {
        console.log(`[ScatterBlox] Set ${optionName} to ${value}`);
    });
};

const getOption = (optionName) => {
    return options[optionName];
};

export {
    optionsLoaded,
    getOption,
    setOption
}
