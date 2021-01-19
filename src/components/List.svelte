<script lang="ts">
  import { ChromeSetting } from '../helpers/chromeSettings';

  import type { SinkDetails } from '../types';

  import Record from './Record.svelte';

  let maxCodeLength: number;
  const maxCodeLengthSetting = new ChromeSetting(
    'maxCodeLength',
    (newValue) => {
      maxCodeLength = Math.max(0, parseInt(newValue));
    }
  );

  export let records: SinkDetails[] = [];
  export let filters: boolean[] = [];
</script>

{#each records as sinkDetails, i (sinkDetails.stackId)}
  <Record {sinkDetails} show={filters[i]} {maxCodeLength} />
{/each}
