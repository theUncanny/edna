<script>
  let { loadingNoteName = "" } = $props();
  let showing = $state(false);

  let timerID;
  /** @type {HTMLElement} */
  let btn = $state(null);

  $effect(() => {
    // to prevent flashing when loading is fast, delay showing the message
    timerID = setTimeout(() => {
      showing = true;
    }, 300);
    return () => {
      clearTimeout(timerID);
    };
  });
  $effect(() => {
    if (btn) {
      console.log("focused btn");
      btn.focus();
    }
  });
</script>

{#if showing}
  <form
    tabindex="-1"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999] pointer-events-none select-none"
  >
    <button class="bg-white focus:outline-none" bind:this={btn}>
      <div class="text-lg text-black px-4 py-2">
        Loading <span class="font-bold">{loadingNoteName}</span>...
      </div>
    </button>
  </form>
{/if}
