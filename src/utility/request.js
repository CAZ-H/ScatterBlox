import { getCSRFToken } from './page';

const sendReq = (url, body, method) => {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState === 4 && req.status === 200)
            {
                try {
                    resolve(JSON.parse(req.responseText));
                } catch (e) {
                    reject(e)
                }
            }
        };
        req.open(method, url);
        req.setRequestHeader("Content-type", "application/json");
        req.setRequestHeader('X-CSRF-TOKEN', getCSRFToken());
        req.send(body);
    })
};

export {
    sendReq
};
