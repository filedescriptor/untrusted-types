import { defaultSettings, getAllChromeSettings } from './helpers/chromeSettings';
import { settingsValue, injected } from './injected';

let settings: { [key: string]: any } = JSON.parse(settingsValue);

if (settings.recordingEnabled) {
    const updateNewestSettings = () => {
        getAllChromeSettings().then((chromeSettings: object) => {
            settings = {
                ...defaultSettings, ...chromeSettings
            };
            window.postMessage({
                untrustedTypes: true,
                type: 'settingsChanged',
                value: settings
            }, '*');
        });
    };
    chrome.storage.onChanged.addListener(updateNewestSettings);
    updateNewestSettings();

    window.addEventListener('message', event => {
        const message = event.data;
        if (!message.untrustedTypes) return;
        if (event.source !== window) return;
        if (message.type === 'getSettings') {
            event.source.postMessage({
                untrustedTypes: true,
                type: 'settingsChanged',
                value: settings
            }, event.origin);
            return;
        }

        chrome.runtime.sendMessage(message);
    });

    // listen for messages from the devtools panel
    /*
    const receivedMessage = (
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse?: (response?: any) => void
    ) => {
        if (top !== self) return;
        switch (message.type) {
    
        }
    };
    chrome.runtime.onMessage.addListener(receivedMessage);
    */

    // send message to the devtools panel
    const sendMessageToInjected = (type: string, value: any) => {
        window.postMessage({
            untrustedTypes: true,
            type,
            value
        }, '*');
    };


    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "require-trusted-types-for 'script'";

    const script = document.createElement('script');
    script.innerHTML = injected;

    const head = document.createElement('head');
    head.appendChild(meta);
    head.appendChild(script);
    document.documentElement.appendChild(head);
    head.remove();
}
