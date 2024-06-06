<script context="module">
  /**
   * @typedef {Object} Toast
   * @property {string} msg
   * @property {number} id
   * @property {number} timeoutMs
   */

  export let defaultTimeout = 4000;

  /** @type {Toast[]} */
  let toasts = $state([]);

  let nextId = 0;

  /**
   * @param {number} id
   */
  function removeToast(id) {
    console.log("removeToast:", id);
    let idx = -1;
    for (let i = 0; i < len(toasts); i++) {
      if (toasts[i].id === id) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      // it's ok, can be called by timer but was removed manually
      return;
    }
    toasts.splice(idx, 1);
  }

  export function addToast(msg, timeoutMs = -1) {
    if (timeoutMs < 0) {
      timeoutMs = defaultTimeout;
    }
    nextId++;
    let t = {
      msg: msg,
      id: nextId,
      timeoutMs: timeoutMs,
    };
    toasts.push(t);
    if (timeoutMs > 0) {
      // could remember timer on Toast and clear on manual removal
      // but not necessary
      setTimeout(() => {
        removeToast(t.id);
      }, timeoutMs);
    }
  }
</script>

<script>
  import { len } from "../util";

  if (false) {
    addToast("hello");
    addToast("what is my purpose", 500);
    addToast("this is my ever-lasting love");
    addToast(
      "this is a vary, vyer, very, very long toast of london and munification so why are we even considering this as if this is not concernings on every level",
      0
    );
  }
</script>

{#if len(toasts) > 0}
  <div class="toast-wrap fixed top-10 right-[19px] text-sm">
    {#each toasts as t}
      <div
        class="flex justify-between items-center mb-4 dark:text-gray-300 border-gray-300 dark:border-gray-500 border rounded-md py-2 pl-4 pr-2 min-w-[14ch] bg-white dark:bg-gray-700"
      >
        <div class="">
          {t.msg}
        </div>
        <button
          class="px-2 py-0.5 ml-2 hover:bg-gray-200"
          onclick={() => removeToast(t.id)}>x</button
        >
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-wrap {
    max-width: calc(min(120ch, 40%));
  }
</style>
