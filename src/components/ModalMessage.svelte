<script context="module">
  let modalMessageHTML = $state("");
  /** @type {Timer} */
  let timerID;

  class ModalMessageState {
    isShowing = $state(false);
  }

  export let modalMessageState = new ModalMessageState();

  /**
   * @param {string} msgHTML
   * @param {number} delay
   */
  export function setModalMessageHTML(msgHTML, delay) {
    clearTimeout(timerID);
    timerID = null;
    if (delay <= 0) {
      modalMessageHTML = msgHTML;
      modalMessageState.isShowing = msgHTML != "";
      return;
    }
    timerID = setTimeout(() => {
      modalMessageHTML = msgHTML;
      modalMessageState.isShowing = msgHTML != "";
    }, delay);
  }

  export function clearModalMessage() {
    modalMessageHTML = "";
    clearTimeout(timerID);
    timerID = null;
    modalMessageState.isShowing = false;
  }
</script>

<script>
  /** @type {HTMLElement} */
  let btn = $state(null);

  $effect(() => {
    if (btn) {
      btn.focus();
    }
  });
</script>

<form
  tabindex="-1"
  class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999] pointer-events-none select-none"
>
  <button class="bg-white focus:outline-none" bind:this={btn}>
    <div class="text-lg text-black px-4 py-2">
      {@html modalMessageHTML}
    </div>
  </button>
</form>
