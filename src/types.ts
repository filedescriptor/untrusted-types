import type { SettingType } from './helpers/chromeSettings';

export type SinkDetails = {
    href: string;
    sink: string;
    stack: string;
    stackId: string;
    input: string;
    important?: boolean;
};

export type Settings = {
    key: string;
    label: string;
    defaultValue: any;
    value?: any;
    type: SettingType;
    placeholder?: string;
}