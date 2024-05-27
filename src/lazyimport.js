let lazyZipJs;
export async function lazyLoadZipJs() {
  if (!lazyZipJs) {
    let m = await import("@zip.js/zip.js");
    console.log("lazyLoadZipJs:", m);
    lazyZipJs = m;
  }
  return lazyZipJs;
}
