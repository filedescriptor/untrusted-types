<script lang="ts">
  import type { SinkDetails } from '../types';

  import Code from './Code.svelte';
  export let show: boolean;
  export let sinkDetails: SinkDetails;

  const copyText = (text: string) => {
    const input = document.createElement('input');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    const result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
  };

  export let maxCodeLength: number = 1024;

  $: codeTruncated = maxCodeLength && sinkDetails.input.length > maxCodeLength;
</script>

{#if show}
  <section id={`record-${sinkDetails.stackId}`}>
    <div class="navigation">
      <span class="id">
        <a
          href={`#record-${sinkDetails.stackId}`}
          class="stackId"
          title="Click to copy stack ID, then open console and find it"
          on:click={() => copyText('#' + sinkDetails.stackId)}
          >#{sinkDetails.stackId}</a>
      </span>
    </div>
    <div
      class="title"
      class:important={sinkDetails.important}
      title="Sink type">{sinkDetails.sink}</div>
    <div class="href">
      {sinkDetails.href}
    </div>
    <div>
      <details>
        <summary>Stack trace</summary>
        <pre>{sinkDetails.stack}</pre>
      </details>
    </div>
    {#if sinkDetails.input.length > 0}
      <Code
        code={codeTruncated
          ? sinkDetails.input.substring(0, maxCodeLength)
          : sinkDetails.input}
        fullCode={sinkDetails.input} />
      {#if codeTruncated}
        <button
          class="textBtn"
          on:click={() => {
            codeTruncated = false;
          }}>Show full code&hellip; ({sinkDetails.input.length})</button>
      {/if}
    {/if}
  </section>
{/if}

<style>
  :target {
    color: #eeeeee;
    background-color: #141414;
  }
  section {
    display: flex;
    padding: 1.25em 1em 1em 1.25em;
    border-bottom: 1px solid #484c50;
    flex-direction: column;
    color: #9aa0a6;
    background-color: #202124;
  }
  pre {
    white-space: pre-wrap;
  }
  .stackId {
    user-select: all;
    cursor: copy;
  }
  .id {
    font-size: 0.75em;
    margin-left: 0.25em;
  }
  .title {
    font-weight: bold;
    margin-bottom: 1em;
    color: #e0e0e0;
  }
  .title.important {
    background: #c62828;
    color: #fff;
    padding: 0.25em;
  }
  .href {
    font-family: monospace;
    word-break: break-all;
    font-size: 1.125em;
    margin-bottom: 0.75em;
  }
  summary {
    outline: none;
    cursor: pointer;
  }
  .navigation {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 1em;
  }
  .navigation a {
    color: inherit;
    text-decoration: none;
    margin-right: 0.5em;
    opacity: 0.5;
  }
  .navigation a:hover {
    opacity: 1;
  }
  .navigation a:focus {
    color: #fff;
  }
</style>
