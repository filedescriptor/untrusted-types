// chrome.storage is too slow to allow custom options
// edit the settings here instead

options = {
    "keyword" : 'd0mxss',
    "traceLimit" : 5, // 9999 = no limit
    "onlyLogHighlighted" : false,
    "ignoredDomains" : [], // Regex list of domains to ignore
    "ignoredFiles" : [] // Regex list of files to ignore
}

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
        let options = ${JSON.stringify(options)};
        if (options.keyword && input.includes(options.keyword)) {
            let highlightedInput = input.replaceAll(options.keyword, '%c$&%c');
            let args = [
                location.href + '\\n%c' + sink + '\\n%c' + highlightedInput, 
                'background: red; color: white; font-size: 16px',
                'background: unset; color: unset; font-size: unset;'
            ];
            for (let i = 0; i < input.split(options.keyword).length - 1; i++) {
                args.push('color: red; border: 1px dotted red; background: yellow;');
                args.push('color: unset; border: reset;background: unset');
            }
            console.trace.apply(console, args);
        } else if (!options.onlyLogHighlighted) {
            e = new Error();
            trace_n = (e.stack.match(/\\sat\\s/g) || []).length ; // bugged ?
            if ( trace_n < options.traceLimit ) {
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
