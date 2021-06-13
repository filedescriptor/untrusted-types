import type { Settings } from '../types';

export const setChromeSetting = (key: string, value: any) => {
    chrome.storage.sync.set({ [key]: value });
};


export const getChromeSetting = (key: string) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, resolve);
    });
};

export const getAllChromeSettings = () => getChromeSetting(null);

export enum SettingType {
    Text,
    TextList,
    Number,
    Boolean
};

export class ChromeSetting {
    key: string;
    value: any;
    valueChanged?: (newValue: any) => void;
    constructor(key: string, valueChanged?: (newValue: any) => void, listenForUpdates = true) {
        this.key = key;
        this.valueChanged = valueChanged;
        getChromeSetting(key).then((setting: any) => {
            if (setting[key] === undefined) return;
            this.value = setting[key] as any;
            this.valueChanged(this.value);
        });
        if (listenForUpdates) {
            chrome.storage.onChanged.addListener((changes) => {
                if (changes[key]?.newValue !== undefined) {
                    this.value = changes[key].newValue;
                    this.valueChanged(this.value);
                }
            });
        }
    }
    update(value: any) {
        this.value = value;
        setChromeSetting(this.key, value);
    }
};

export const settings: Settings[] = [
    {
        key: 'keywords',
        label: 'Keywords to highlight',
        placeholder: `Enter each keyword to highlight on a new line`,
        defaultValue: ['d0mxss', ''],
        type: SettingType.TextList,
    },
    {
        key: 'ignored',
        label: 'Files/domains to ignore',
        placeholder: `Do not log results with stack traces that match one of these values`,
        defaultValue: [''],
        type: SettingType.TextList,
    },
    {
        key: 'ignoredIfFirst',
        label: 'Source files/domains to ignore',
        placeholder: `Ignore only if it is the source of the sink (last function in stack trace)`,
        defaultValue: [''],
        type: SettingType.TextList,
    },
    {
        key: 'maxCodeLength',
        label: `Truncate long code (number of characters)`,
        placeholder: '0 = disabled',
        defaultValue: 1024,
        type: SettingType.Number,
    },
    {
        key: 'traceLimit',
        label: `Trace limit (ignore if sink passes by more than x functions)`,
        placeholder: '0 = disabled',
        defaultValue: 1024,
        type: SettingType.Number,
    },
    {
        key: 'onlyLogHighlighted',
        label: 'Only log highlighted results',
        placeholder: `Completely ignore results that don't contain any keywords`,
        defaultValue: false,
        type: SettingType.Boolean,
    },
    {
        key: 'highlightKeywordMatches',
        label: 'Highlight keyword matches',
        placeholder: `Might be slow if there's a large number of results or keywords`,
        defaultValue: true,
        type: SettingType.Boolean,
    },
    {
        key: 'highlightCodeSearchResults',
        label: 'Highlight code search results',
        placeholder: `Might be slow if there's a large number of results`,
        defaultValue: false,
        type: SettingType.Boolean,
    },
    {
        key: 'groupMessagesInConsole',
        label: 'Group messages in console',
        placeholder: `Put messages in console from the same page under a group`,
        defaultValue: false,
        type: SettingType.Boolean,
    },
];

export let defaultSettings = {
    recordingEnabled: true
};
for (const setting of settings) {
    defaultSettings[setting.key] = setting.defaultValue;
}
