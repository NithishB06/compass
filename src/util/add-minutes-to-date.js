export function addMinutes(date, minutes) {
	date.setMinutes(date.getMinutes() + minutes);

	return date;
}
