import throttle from "discourse/lib/throttle";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-slider", {
  tagName: "input.group-timezones-slider",

  input(event) {
    this._handleSliderEvent(event);
  },

  change(event) {
    this._handleSliderEvent(event);
  },

  changOffsetThrottler: throttle(function(offset) {
    this.sendWidgetAction("onChangeCurrentUserTimeOffset", offset);
  }, 75),

  buildAttributes(attrs) {
    return {
      step: 1,
      value: 0,
      min: -48,
      max: 48,
      type: "range"
    };
  },

  _handleSliderEvent(event) {
    const value = parseInt(event.target.value, 10);
    const offset = value * 15;
    this.changOffsetThrottler(offset);
  }
});
