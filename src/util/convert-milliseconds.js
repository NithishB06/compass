export function millisecondsToTimeStamp(milliseconds) {
  return new Date(milliseconds).toISOString().slice(11, 19);
}
