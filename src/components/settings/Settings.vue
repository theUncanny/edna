<script>
</script>

<template>
  <div class="fixed inset-0">
    <div
      class="dialog gray-700 absolute top-[2rem] z-20 flex flex-col bg-white max-w-full max-h-full rounded shadow-xl w-[640px] h-[460px] center-x-with-translate overflow-y-auto no-border-outline">
      <div class="flex grow">
        <div class="settings-content flex-grow overflow-y-auto p-[40px]">
          <TabContent tab="general" :activeTab="activeTab">
            <div class="row">
              <div class="entry">
              </div>

            </div>
          </TabContent>

          <TabContent tab="editing" :activeTab="activeTab">
            <div class="row">
            </div>
          </TabContent>

          <TabContent tab="appearance" :activeTab="activeTab">
            <div class="row flex">
            </div>
            <div class="row flex">
              <div class="entry">
              </div>
            </div>
            <div class="row flex">
              <div class="entry">
              </div>
            </div>
          </TabContent>

          <TabContent tab="updates" :activeTab="activeTab">
            <div class="row">
            </div>
          </TabContent>
        </div>
      </div>

      <div class="bottom-bar text-right py-[10px] px-[20px] bg-gray-100">
        <button @click="$emit('close')" class="close border-gray-500 px-4 border">Close</button>
      </div>
    </div>
    <div class="bg-black opacity-50 absolute inset-0 z-10"></div>
  </div>
</template>

<style scoped>
html.dark .dialog {
  background: #333;
  color: #eee;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.3);
}

html.dark .sidebar {
  border-right: 1px solid #222;
}

.settings-content select {
  height: 22px;
}

html.dark .settings-content select {
  background: #222;
  color: #eee;
}

.settings-content .row {
  display: flex;
}

.settings-content .row .entry {
  margin-bottom: 24px;
  margin-right: 20px;
}

.settings-content .row .entry:last-child {
  margin-right: 0;
}

.settings-content .row .entry h2 {
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 14px;
}

.settings-content .row .entry select {
  width: 200px;
}

.settings-content .row .entry select:focus {
  outline: none;
}

.settings-content .row .entry label {
  display: block;
  user-select: none;
}

.settings-content .row .entry label>input[type=checkbox] {
  position: relative;
  top: 2px;
  left: -3px;
}

html.dark .bottom-bar {
  background: #222;
}

.bottom-bar .close {
  height: 28px;
}

.bottom-bar .close:hover {
  background-color: lightgray;
}

html.dark .bottom-bar .close:hover {
  background: #333;
  color: #eee;
}
</style>
