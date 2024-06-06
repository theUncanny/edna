<script>
  import {
    kDefaultFontFamily,
    kDefaultFontSize,
    getVersion,
    saveSettings,
    setSetting,
  } from "../settings";
  import { platform } from "../util";

  /** @type {{
    close: () => void,
}}*/
  let { close } = $props();

  /** @type {HTMLElement} */
  let container;

  $effect(() => {
    if (container) {
      container.focus();
    }
  });

  function onfocusout(ev) {
    console.log("onfocusout");
    if (
      container !== ev.relatedTarget &&
      !container.contains(ev.relatedTarget)
    ) {
      close();
    }
  }
</script>

<div class="fixed inset-0">
  <form
    bind:this={container}
    {onfocusout}
    tabindex="-1"
    class="selector absolute center-x-with-translate top-[2rem] z-20 flex flex-col max-w-full p-3"
  >
    <div>Those are settings</div>
  </form>
</div>
