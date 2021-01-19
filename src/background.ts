import { defaultSettings, getAllChromeSettings } from './helpers/chromeSettings';

let settings = defaultSettings;
const updateNewestSettings = () => {
    getAllChromeSettings().then((chromeSettings: object) => {
        settings = {
            ...defaultSettings, ...chromeSettings
        };

        // broadcast changes to injected scripts
        window.postMessage({
            untrustedTypes: true,
            type: 'settingsChanged',
            value: settings
        }, '*');
    });
};
chrome.storage.onChanged.addListener(updateNewestSettings);
updateNewestSettings();

// dynamically return current settings
chrome.webRequest.onBeforeRequest.addListener(
    () => ({
        redirectUrl: 'data:application/json,' + JSON.stringify(settings)
    }),
    {
        urls: [chrome.runtime.getURL('settings.json')]
    },
    ['blocking']
);
