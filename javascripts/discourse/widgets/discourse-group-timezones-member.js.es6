import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-member", {
  tagName: "li.group-timezones-member",

  buildClasses(attrs) {
    return attrs.member.onHoliday ? "on-holiday" : "not-on-holiday";
  },

  template: hbs`
    {{attrs.member.userLink}}
  `
});
