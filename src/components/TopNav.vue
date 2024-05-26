<script>

export default {
  props: [
    "noteName",
    "shortcut",
  ],

}
</script>
<template>
  <div class="topnav">
    <div class="title">
      {{ noteName }}
    </div>
    <div class="shortcut">
      {{ shortcut }}
    </div>
    <div class="grow"></div>
    <a class="help" href="/help" target="_blank">Help</a>
  </div>
</template>

<style scoped>
.topnav {
  display: flex;
  flex-direction: row;
  align-items: center;

  background: lightgrey;
  background-color: white;
  /* background-color: #e8e8e8; */
  /* background-color: #557db618; */
  /* background-color: #557db6; */
  color: #333;
  /* color: white; */
  font-size: 12pt;
  line-height: 1.5;
  user-select: none;
  padding: 2px 1rem;
  /* border-bottom: 1px lightgray solid; */
}

.title {
  padding: 2px 4px;
  /* border-left: 1px solid lightgray;
  border-right: 1px solid lightgray;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray; */
}

.shortcut {
  padding: 2px 4px;
  font-size: 12px;
  color: #939393;
}

.help {
  padding: 2px 8px;
}

.help:hover {
  background-color: #f3f3f3;
}
</style>