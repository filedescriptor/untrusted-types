# Untrusted Types

Untrusted Types is a Chrome extension that abuses [Trusted Types](https://w3c.github.io/webappsec-trusted-types/dist/spec/) to log DOMXSS sinks. Requires Chrome v85+.

A simple tutorial: https://www.youtube.com/watch?v=CNNCCgDkt5k

## Installation

1. Download this repo
2. Go to Extension in Chrome
3. Enable Developer mode
4. Load unpacked and choose the repo directory

## Usage

Untrusted Types works by logging DOM manipulations that could lead to XSS. Simply open DevTools and start debugging. It supports two types of sink discovery.


### Sinks -> Sources

This is the standward way which is to simply log all sinks and the corresponding changes to the DOM. You start tracing from the sinks back to the sources.

![](https://github.com/filedescriptor/untrusted-types/blob/main/sinks_to_sources.png)

### Sources -> Sinks

This is useful when there are too many sinks but few sources. Insert the keyword `d0mxss` in sources and sinks that contain this string will be highlighted. You start tracing from the sources to the sinks.

Additionally, you can change the keyword and configure whether to only show highlighted sinks in content.js.

![](https://github.com/filedescriptor/untrusted-types/blob/main/sources_to_sinks.png)

### Settings

Edit the `settings.json` file to change the options. No need to reload the extension.

Name|Default value|Description
----|-------------|-----------
keyword|d0mxss|String to be inserted on sources, sinks that contain this string will be highlighted.
traceLimit|9999|If a sink passes by more than 'traceLimit'-functions, it will not be logged. Default is no limit.
onlyLogHighlighted|false|Only show highlighted sinks.
ignored|[]|List of strings of files/domains to be ignored, if a sink pass by one of them it will not be logged.
ignoredIfFirst|[]|List of strings of files/domains to be ignored ONLY IF is the source of the sink.

## Limitation & Known Issues
1. While it covers a majority of sinks, it doesn't cover navigation sinks like `location = user_input` unless it's `location = 'javascript:' + user_input`. 
2. It doesn't work in websites that are already using Trusted Types. This is not a problem for now because even Google themselves don't use it a lot
3. If console logs are not showing the stack trace, refresh the page.
4. It will fail on web pages with `<iframe src="javascript:...">` (but fine if dynamically inserted). Check [issue #1](https://github.com/filedescriptor/untrusted-types/issues/1)
