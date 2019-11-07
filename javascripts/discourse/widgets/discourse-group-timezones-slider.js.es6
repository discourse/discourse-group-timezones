import throttle from "discourse/lib/throttle";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-slider", {
  tagName: "input.group-timezones-slider",

  input(event) {
    const value = parseInt(event.target.value, 10);
    const offset = value * 15;
    this.changOffsetThrottler(offset);
  },

  changOffsetThrottler: throttle(function(offset) {
    this.sendWidgetAction("onChangeLocalTime", offset);
  }, 100),

  buildAttributes(attrs) {
    return {
      step: 1,
      value: 0,
      min: -48,
      max: 48,
      type: "range"
    };
  }
});
