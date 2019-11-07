import throttle from "discourse/lib/throttle";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-filter", {
  tagName: "input.group-timezones-filter",

  input(event) {
    this.changeFilterThrottler(event.target.value);
  },

  changeFilterThrottler: throttle(function(filter) {
    this.sendWidgetAction("onChangeFilter", filter);
  }, 100),

  buildAttributes(attrs) {
    return {
      type: "text",
      placeholder: I18n.t(themePrefix("search"))
    };
  }
});
