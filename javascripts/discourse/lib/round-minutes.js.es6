export default function roundMinutes(minutes, step = 15) {
  return (Math.round(minutes / step) * step) % 60;
}
