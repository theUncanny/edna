<script>
  /** @type { {
    class: string,
    formatTime?: (date: Date) => string,
  } } */
  let { class: className = "", formatTime = formatTimeMyStyle } = $props();

  let formattedTime = $state(formatTime(new Date()));

  function formatTimeMyStyle(dt) {
    return dt.toLocaleString("en-US", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  let intervalId;

  $effect(() => {
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Initial timeout to sync with minute start
    const initialTimeoutId = setTimeout(() => {
      formattedTime = formatTime(new Date());

      // Start the regular interval once synchronized
      intervalId = setInterval(() => {
        formattedTime = formatTime(new Date());
      }, 60 * 1000);
    }, msUntilNextMinute);

    // Cleanup function
    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  });
</script>

<div class={className}>{formattedTime}</div>
