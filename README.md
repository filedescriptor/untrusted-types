# Untrusted Types for DevTools
Untrusted Types is a Chrome extension that abuses [Trusted Types](https://w3c.github.io/webappsec-trusted-types/dist/spec/) to log DOMXSS sinks. 

It's based on [filedescriptor](https://github.com/filedescriptor)'s [Untrusted Types](https://github.com/filedescriptor/untrusted-types) extension and adds a DevTools panel that allows for easier filtering/searching of found sinks.

![Untrusted Types for DevTools](docs/ui.png)

## Installation
1. `npm i`
2. `npm run build`
3. Go to `chrome://extensions`, enable Developer mode
4. `Load unpacked`, choose the `public` folder

## Settings
![Settings](docs/settings.png)

## Based on
- [untrusted-types](https://github.com/filedescriptor/untrusted-types)
- [chrome-extension-svelte-typescript-boilerplate](https://github.com/NekitCorp/chrome-extension-svelte-typescript-boilerplate)