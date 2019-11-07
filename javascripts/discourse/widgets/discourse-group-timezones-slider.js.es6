import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-slider", {
  tagName: "input.group-timezones-slider",

  input(event) {
    const value = parseInt(event.target.value, 10);
    const offset = value * 15;
    this.sendWidgetAction("onChangeLocalTime", offset);
  },

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
