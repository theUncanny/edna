<script>
  /**
   * @type {{
   onclose: () => void,
   klass?: string,
   style?: string,
   children: Function,
}} */
  let { onclose, klass = "", style="", children } = $props();

  /**
   * @param {MouseEvent} ev
   */
  function onclick(ev) {
    console.log("onclick", ev);
    ev.preventDefault();
    ev.stopImmediatePropagation();
    onclose();
  }

  function onkeydown(ev) {
    console.log("onkeydown:", ev);
    let key = ev.key;
    if (key === "Escape") {
    ev.preventDefault();
    ev.stopImmediatePropagation();
      onclose();
      return;
    }
  }

  /** @type {HTMLElement} */
  let wrapper;
  $effect( () => {
    console.log("focused wrapper")
    wrapper.focus();
  })
</script>

<div class="fixed inset-0 overflow-hidden">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="z-20 {klass}" {style} onkeydown={onkeydown} bind:this={wrapper}>
    {@render children()}
  </div>
  <!-- this captures the click outside of the actual element -->
  <button onclick={onclick} class="absolute inset-0 z-10"></button>
</div>
