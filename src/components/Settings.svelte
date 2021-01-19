<script lang="ts">
    import {
        getAllChromeSettings,
        setChromeSetting,
        SettingType,
    } from '../helpers/chromeSettings';
    import { onMount } from 'svelte';

    import { settings } from '../helpers/chromeSettings';

    const transformValue = (type: SettingType, value: any) => {
        if (type === SettingType.TextList) {
            return value.join('\n');
        }
        return value;
    };

    let loadedSettings = [];
    const loadSettings = async () => {
        const chromeSettings = await getAllChromeSettings();
        for (const setting of settings) {
            setting.value = chromeSettings[setting.key];
            if (setting.value == undefined) {
                setting.value = setting.defaultValue;
            }
            setting.value = transformValue(setting.type, setting.value);

            chrome.storage.onChanged.addListener((changes) => {
                if (changes[setting.key]) {
                    setting.value = transformValue(
                        setting.type,
                        changes[setting.key].newValue
                    );
                    loadedSettings = settings;
                }
            });
        }
        return settings;
    };
    onMount(async () => {
        loadedSettings = await loadSettings();
    });
</script>

{#each loadedSettings as { key, label, placeholder, value, type } (key)}
    <div class="formGroup">
        {#if type === SettingType.Text}
            <label for={`settings-${key}`}>{label}:</label>
            <input
                type="text"
                id={`settings-${key}`}
                {placeholder}
                title={placeholder}
                bind:value
                on:change={(e) => {
                    setChromeSetting(key, e.target.value);
                }} />
        {:else if type === SettingType.Number}
            <label for={`settings-${key}`}>{label}:</label>
            <input
                type="number"
                id={`settings-${key}`}
                {placeholder}
                title={placeholder}
                bind:value
                on:change={(e) => {
                    setChromeSetting(key, e.target.value);
                }} />
        {:else if type === SettingType.TextList}
            <label for={`settings-${key}`}>{label}:</label>
            <textarea
                id={`settings-${key}`}
                {placeholder}
                title={placeholder}
                bind:value
                on:change={(e) => {
                    setChromeSetting(key, e.target.value.split('\n'));
                }} />
        {:else if type === SettingType.Boolean}
            <input
                type="checkbox"
                id={`settings-${key}`}
                title={placeholder}
                bind:checked={value}
                on:change={(e) => {
                    setChromeSetting(key, e.target.checked);
                }} />
            <label
                for={`settings-${key}`}
                class="label-checkbox"
                title={placeholder}>{label}</label>
        {/if}
    </div>
{/each}

<style>
    .formGroup {
        vertical-align: middle;
        padding: 0.5em;
        break-inside: avoid;
    }
    input[type='text'] {
        width: 16em;
    }
    input[type='text'],
    input[type='number'] {
        display: inline-block;
        margin-right: 0.25em;
    }
    label:not(.label-checkbox) {
        margin-left: 0;
        margin-bottom: 0.4em;
        display: block;
        user-select: none;
    }
    label.label-checkbox {
        margin: 0;
    }
    textarea {
        width: 24em;
        max-width: 100%;
        height: 6em;
        min-height: 3em;
        resize: vertical;
    }
</style>
