<script lang="ts">
  import { atomOneDark } from 'svelte-highlight/styles';
  import List from './List.svelte';
  import Settings from './Settings.svelte';
  import type { SinkDetails } from '../types';
  import { ChromeSetting, defaultSettings } from '../helpers/chromeSettings';

  let records: SinkDetails[] = [];

  let sinkFilter = '';
  let codeFilter = '';

  let preserveLog: boolean = defaultSettings['preserveLog'];
  const preserveLogSetting = new ChromeSetting(
    'preserveLog',
    (newValue) => {
      preserveLog = newValue;
    },
    false
  );

  let onlyShowHighlighted: boolean = defaultSettings['onlyShowHighlighted'];
  const onlyShowHighlightedSetting = new ChromeSetting(
    'onlyShowHighlighted',
    (newValue) => {
      onlyShowHighlighted = newValue;
    },
    false
  );

  let recordsFiltered: boolean[] = [];

  const filterRecord = (record: SinkDetails) =>
    (onlyShowHighlighted ? record.important : true) &&
    (sinkFilter && sinkFilter.length > 2
      ? record.sink.indexOf(sinkFilter) !== -1
      : true) &&
    (codeFilter && codeFilter.length > 2
      ? record.input.indexOf(codeFilter) !== -1
      : true);

  const refilterRecords = () => {
    let recordsFilteredNew: boolean[] = [];
    for (const record of records) {
      recordsFilteredNew.push(filterRecord(record));
    }
    recordsFiltered = recordsFilteredNew;
  };

  const highlightText = (keyword: string, backgroundColor = 'yellow') => {
    if ((window as any).find && window.getSelection) {
      document.designMode = 'on';
      const sel = window.getSelection();
      sel.collapse(document.body, 0);

      while ((window as any).find(keyword)) {
        document.execCommand('HiliteColor', false, backgroundColor);
        sel.collapseToEnd();
      }
      document.designMode = 'off';
    }
  };

  let newRecords: SinkDetails[] = [];

  let keywords: string[] = defaultSettings['keywords'];
  const keywordsSetting = new ChromeSetting('keywords', (newValue) => {
    keywords = newValue;
  });

  let highlightKeywordMatches: boolean = true;
  const highlightKeywordMatchesSetting = new ChromeSetting(
    'highlightKeywordMatches',
    (newValue) => {
      highlightKeywordMatches = newValue;
    }
  );

  let debounceNewRecordsTimeout: number;
  let highlightKeywordsTimeout: number;
  const addNewRecord = (sinkDetails: SinkDetails) => {
    newRecords.push(sinkDetails);
    clearTimeout(debounceNewRecordsTimeout);
    debounceNewRecordsTimeout = setTimeout(() => {
      let keywordsToHighlight: string[] = [];
      for (const record of newRecords) {
        record.stack &&= record.stack.split('\n').slice(2).join('\n');

        for (const keyword of keywords) {
          if (keyword.length > 1 && record.input.indexOf(keyword) !== -1) {
            record.important = true;
            keywordsToHighlight.push(keyword);
          }
        }

        records.unshift(record);
        recordsFiltered.unshift(filterRecord(record));
      }

      newRecords = [];
      records = records;

      if (
        highlightKeywordMatches &&
        recordsFiltered.filter((val) => val).length < 128
      ) {
        keywordsToHighlight = [...new Set(keywordsToHighlight)];
        clearTimeout(highlightKeywordsTimeout);
        highlightKeywordsTimeout = setTimeout(() => {
          for (const keyword of keywordsToHighlight) {
            highlightText(keyword, 'yellow');
          }
        }, 75);
      }
    }, 350);
  };

  const clearRecords = () => {
    newRecords = [];
    clearTimeout(debounceNewRecordsTimeout);
    records = [];
    recordsFiltered = [];
  };

  // send a message to the tab
  /*
  const sendMessage = (type: string, value: any) => {
    chrome.tabs.sendMessage(
      chrome.devtools.inspectedWindow.tabId,
      {
        type,
        value,
      },
      (response) => {}
    );
  };
  */

  // received a message from the tab
  const receivedMessage = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse?: (response?: any) => void
  ) => {
    // process messages only from the same tab
    if (sender.tab?.id !== chrome.devtools.inspectedWindow.tabId) return;

    switch (message.type) {
      case 'sinkFound':
        addNewRecord(message.value);
        break;
      case 'pageNavigation':
        if (!preserveLog) {
          clearRecords();
        }
        break;
    }
  };
  chrome.runtime.onMessage.addListener(receivedMessage);

  let sinkTypes: { sink: string; count: number }[] = [];
  $: sinkTypes = records
    .reduce((acc, d) => {
      const found = acc.find((a) => a.sink === d.sink);
      if (!found) {
        acc.push({ sink: d.sink, count: 1 });
      } else {
        found.count++;
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count);

  let codeFilterPrevious = codeFilter;

  const highlightCodeFilter = (keyword: string, previousKeyword: string) => {
    if (recordsFiltered.filter((val) => val).length > 128) return;
    if (previousKeyword.length > 0) {
      highlightText(previousKeyword, 'transparent');
    }
    if (keyword.length > 2) {
      highlightText(keyword, 'green');
    }
  };

  let highlightCodeSearchResults: boolean;
  const highlightCodeSearchResultsSetting = new ChromeSetting(
    'highlightCodeSearchResults',
    (newValue) => {
      highlightCodeSearchResults = newValue;
    }
  );
  let debounceCodeFilterTimeout: number;
  const codeFilterInput = (event) => {
    if (codeFilter === codeFilterPrevious) return;
    clearTimeout(debounceCodeFilterTimeout);
    debounceCodeFilterTimeout = setTimeout(() => {
      if (codeFilter !== codeFilterPrevious) {
        if (codeFilter.length === 0 || codeFilter.length >= 2) {
          refilterRecords();
          if (highlightCodeSearchResults) {
            setTimeout(() => {
              highlightCodeFilter(codeFilter, codeFilterPrevious);
            });
          }
        }
        codeFilterPrevious = codeFilter;
        (event.target as HTMLInputElement).focus();
      }
    }, 500);
  };

  let showSettings = false;
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>
<main>
  <div id="toolbar">
    <div id="options">
      <button class="textBtn" on:click={clearRecords}
        ><span class="icon">&#x1F6C7;</span> Clear log</button>
      <span class="divider" />
      <div id="optionsCheckboxes">
        <div>
          <input
            type="checkbox"
            id="preserveLog"
            bind:checked={preserveLog}
            on:change={() => {
              preserveLogSetting.update(preserveLog);
            }} />
          <label
            for="preserveLog"
            title="Do not clear log on page reload / navigation"
            >Preserve log</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="onlyShowHighlighted"
            bind:checked={onlyShowHighlighted}
            on:change={() => {
              onlyShowHighlightedSetting.update(onlyShowHighlighted);

              refilterRecords();
            }} />
          <label
            for="onlyShowHighlighted"
            title="Hide results that don't contain any keywords"
            >Only show highlighted</label>
        </div>
      </div>
      <div class="spacer" />
      <button
        class="textBtn"
        on:click={() => {
          showSettings = !showSettings;
        }}><span class="icon">&#x26ED;</span> Settings</button>
    </div>
    <div id="settings" hidden={!showSettings}>
      <Settings />
    </div>
    <div class="row top">
      <input
        type="text"
        list="sinks"
        class="toolbarTextInput"
        placeholder="Filter by sink"
        bind:value={sinkFilter}
        on:input={refilterRecords} />
      <!-- 
      Bug: datalists currently don't work in devtools
      https://crbug.com/1139135
      -->
      <datalist id="sinks">
        {#each sinkTypes as { sink, count }}
          <option value={sink}>Found {count} time{count > 1 ? 's' : ''}</option>
        {/each}
      </datalist>
      <!-- Filtering buttons as a workaround for datalists -->
      <button
        title="Clear"
        class="clearBtn"
        on:click={() => {
          sinkFilter = '';
          refilterRecords();
        }}>&times;</button>
      {#each sinkTypes as { sink, count }}
        <button
          title={`Found ${count} times`}
          on:click={() => {
            sinkFilter = sink;
            refilterRecords();
          }}>{sink}</button>
      {/each}
    </div>
    <div class="row">
      <input
        type="text"
        class="toolbarTextInput"
        placeholder="Filter code"
        bind:value={codeFilter}
        on:input={codeFilterInput} />
      <button
        title="Clear"
        class="clearBtn"
        on:click={() => {
          codeFilter = '';
          refilterRecords();
        }}>&times;</button>
    </div>
  </div>
  <div id="list">
    <List {records} filters={recordsFiltered} />
  </div>
  {#if records.length === 0}
    <div id="intro">
      {#if !recordingEnabled}
        Enable recording (by clicking the button in the top left) to start
        listening for new DOM sink events.
      {:else}
        Listening for new DOM sink events... You might need to reload the page.
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #9aa0a6;
  }
  #toolbar {
    border-bottom: 1px solid #484c50;
    background-color: #242424;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }
  #toolbar #options {
    padding: 0.25em 0.75em 0.25em 0.75em;
    margin-left: -0.125em;
    border-bottom: 1px solid #484c50;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  #toolbar #options #optionsCheckboxes {
    display: flex;
    flex-wrap: wrap;
  }
  #toolbar #options #optionsCheckboxes > div {
    margin-right: 0.6em;
  }
  #toolbar #options #optionsCheckboxes label {
    margin: 0;
  }
  #toolbar #settings {
    border-bottom: 1px solid #484c50;
    padding: 1em 0.5em;
  }
  #toolbar .spacer {
    flex: 1;
  }
  @media only screen and (min-width: 700px) {
    #toolbar #settings {
      column-count: 2;
    }
  }
  @media only screen and (min-width: 1000px) {
    #toolbar #settings {
      column-count: 3;
    }
  }
  #toolbar .divider {
    background-color: #3d3d3d;
    width: 1px;
    margin: 0px 0.4em;
    height: 1.4em;
  }
  #toolbar .clearBtn {
    border-left: none;
    margin-left: -3px;
  }
  #toolbar .row {
    margin: 0 0.5em 0.25em 0.5em;
  }
  #toolbar .row.top {
    margin-top: 0.25em;
  }
  .toolbarTextInput {
    width: 16em;
  }
  #list {
    overflow: auto;
  }
  #intro {
    display: flex;
    align-self: center;
    align-items: center;
    flex: 1;
  }
</style>
