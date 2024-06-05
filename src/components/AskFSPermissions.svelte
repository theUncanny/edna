<script>
  import {
    dbGetDirHandle,
    dbDelDirHandle,
    pickAnotherDirectory,
    setStorageFS,
    preLoadAllNotes,
  } from "../notes";
  import { requestHandlePermission } from "../fileutil";
  import { boot } from "../webapp-boot";

  let dirName = $state("");

  async function requestPermissions() {
    let dh = await dbGetDirHandle();
    let ok = await requestHandlePermission(dh, true);
    if (ok) {
      console.log("trying to mount app now");
      await boot();
    } else {
      setStorageFS(null);
    }
  }

  async function pickAnotherDirectory() {
    let ok = await pickAnotherDirectory();
    if (!ok) {
      return;
    }
    await boot();
    await preLoadAllNotes();
  }

  async function switchToBrowserStorage() {
    await dbDelDirHandle();
    await boot();
  }
</script>
