const getUserId = () => {
    const meta = document.querySelector('[name="user-data"]');
    if (meta) {
        return meta.getAttribute('data-userid');
    }
    return null;
};

const getCSRFToken = () => {
    let script = document.evaluate('//text()[contains(., "Roblox.XsrfToken.setToken(")]', document, null, XPathResult.STRING_TYPE, null );
    return script.stringValue.match(/(?<=')([A-Za-z0-9+!@#$%^&*()/\\]+)(?=')/)[0]; // Positive lookbehind may not be supported?
};

export {
    getUserId,
    getCSRFToken
}
