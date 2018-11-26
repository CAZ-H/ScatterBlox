const createCheckboxOption = (internalName, textName, defaultValue, onChange) => {
    const optionContainer = document.createElement('div');
    optionContainer.setAttribute('style', 'display: flex; margin: 2px 0');

    const textContainer = document.createElement('div');
    textContainer.setAttribute('style', 'flex: 0 0 100px');
    textContainer.textContent = textName;

    const option = document.createElement('input');
    option.setAttribute('type', 'checkbox');
    option.setAttribute('style', 'flex-grow: 1');
    defaultValue ? option.checked = true : option.checked = false;
    option.addEventListener('change', onChange);

    optionContainer.appendChild(textContainer);
    optionContainer.appendChild(option);
    return optionContainer;
};

const createNumberInput = (internalName, textName, defaultValue, min='0', max='10', onChange) => {
    const optionContainer = document.createElement('div');
    optionContainer.setAttribute('style', 'display: flex; margin: 2px 0');

    const textContainer = document.createElement('div');
    textContainer.setAttribute('style', 'flex: 0 0 100px');
    textContainer.textContent = textName;

    const option = document.createElement('input');
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

const createHeader = (text) => {
    const header = document.createElement('div');
    header.setAttribute('style', 'padding-bottom: 2px; margin-bottom: 4px; text-align: center; padding: 0 auto; border-bottom: 1px solid rgba(0,0,0,0.2)');
    header.textContent = text;
    return header;
};

const massAppend = (container, children) => {
    children.map(child => {
        container.appendChild(child);
    });
} ;

export {
    createCheckboxOption,
    createNumberInput,
    createHeader,
    massAppend
};
