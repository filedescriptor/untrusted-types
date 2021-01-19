<script lang="ts">
  import { Highlight } from 'svelte-highlight';
  import { xml } from 'svelte-highlight/languages';

  export let code = '';
  export let inline = true;
  export let fullCode = '';

  import { ExternalLinkIcon } from 'svelte-feather-icons';

  const openCodePopup = () => {
    const codeWindow = window.open(
      '/codeView.html',
      'codeWindow',
      'width=1024,height=512'
    );
    codeWindow.code = fullCode;
  };
</script>

<!--
TODO: Autodetect language syntax
https://github.com/metonym/svelte-highlight/issues/135
-->
<main>
  {#if inline}
    <button
      id="popupIcon"
      title="Open code in a popup window"
      on:click={openCodePopup}>
      <ExternalLinkIcon />
    </button>
  {/if}
  <Highlight language={xml} {code} />
</main>

<style>
  main {
    position: relative;
    height: 100%;
  }
  #popupIcon {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0.85em 0 0.25em 0.25em;
    padding: 0.25em 0.35em 0.1em 0.25em;
    border-bottom-left-radius: 0.5em;
    background-color: #282c34;
    filter: none;
    border: none;
    cursor: pointer;
    appearance: none;
    color: #9aa0a6;
  }
  #popupIcon:hover {
    color: #d5dbe2;
  }
  :global(#popupIcon svg) {
    width: 1em;
  }
</style>
