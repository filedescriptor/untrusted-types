<script lang="ts">
    import Code from './Code.svelte';
    import { atomOneDark } from 'svelte-highlight/styles';
    export let code: string;
</script>

<svelte:head>
    {@html atomOneDark}
</svelte:head>
<Code {code} inline={false} />

<style>
    :global(pre) {
        margin: 0;
        height: 100%;
        box-sizing: border-box;
    }
</style>
