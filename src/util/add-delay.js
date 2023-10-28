export function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time * 1000);
  });
}
