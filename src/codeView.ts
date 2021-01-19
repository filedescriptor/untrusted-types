import CodeView from './components/CodeView.svelte';

const codeView = new CodeView({
    target: document.body,
    props: {
        code: (window as any).code
    },
});
export default codeView;