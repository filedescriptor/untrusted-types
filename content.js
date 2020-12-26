// chrome.storage is too slow to allow custom options
// edit the settings on settings.json instead

const settingsUrl = chrome.runtime.getURL('settings.json');

// loads the settings.json file, so you don't need to reload the extension with every edit
var request = new XMLHttpRequest();
request.open('GET', settingsUrl, false);
request.send(null);

// keyword = string to be inserted on sources, sinks that contain this string will be highlighted.
// traceLimit = If a sink passes by more than 'traceLimit' functions, it will not be logged. Default is no limit.
// onlyLogHighlighted = Only show highlighted sinks.
// ignored = List of strings of files/domains to be ignored, if a sink pass by one of them it will not log.
// ignoredIfFirst = List of strings of files/domains to be ignored ONLY IF is on the first function of the trace.
settings = JSON.parse(request.responseText) ;

// creating a policy in the content script context will result in Chrome crashing
// therefore we need to run the code in the website's context
const head = document.createElement('head');
const meta = document.createElement('meta');
const script = document.createElement('script');
script.innerHTML = `
(() => {
    let _open = open;
    open = function() {
        log(arguments[0], 0, 'Window open');
        _open.apply(window, arguments);
    }
    function log(input, type, sink) {
        let settings = ${JSON.stringify(settings)};
        if (settings.keyword && input.includes(settings.keyword)) {
            let highlightedInput = input.replaceAll(settings.keyword, '%c$&%c');
            let args = [
                location.href + '\\n%c' + sink + '\\n%c' + highlightedInput, 
                'background: red; color: white; font-size: 16px',
                'background: unset; color: unset; font-size: unset;'
            ];
            for (let i = 0; i < input.split(settings.keyword).length - 1; i++) {
                args.push('color: red; border: 1px dotted red; background: yellow;');
                args.push('color: unset; border: reset;background: unset');
            }
            console.trace.apply(console, args);
        } else if (!settings.onlyLogHighlighted) {
            e = new Error();
            trace_n = (e.stack.match(/\\sat\\s/g) || []).length ; // bugged ?
            trace = e.stack.split("\\n") ; 
            trace_last_line = trace[trace.length-1] ;
            ignored = false ;
            for (var i = settings.ignored.length - 1; i >= 0; i--) {
                if ( e.stack.includes(settings.ignored[i]) ) {
                    ignored = true ;
                    break ;
                }
            }
            for (var i = settings.ignoredIfFirst.length - 1; i >= 0; i--) {
                if ( trace_last_line.includes(settings.ignoredIfFirst[i]) ) {
                    ignored = true ;
                    break ;
                }
            }
            if ( trace_n < settings.traceLimit && !ignored ) {
                console.trace(location.href + '\\n%c' + sink, 'background: #222; color: #bada55; font-size: 16px', '\\n' + input);
            }
        }
        return input;
    }
    if (!trustedTypes.defaultPolicy) {
        trustedTypes.createPolicy('default', {
            createHTML: log,
            createScript: log,
            createScriptURL: log
        });
    } else {
        console.warn('One or more documents are using Trusted Types. Untrusted Types is disabled.')
    }
})();
//@ sourceURL=UNTRUSTED_TYPES_CHECK_STACK_BELOW
`;

meta.httpEquiv = 'Content-Security-Policy';
meta.content = "require-trusted-types-for 'script'";
head.appendChild(script);
head.appendChild(meta);
document.documentElement.appendChild(head);
head.remove();
