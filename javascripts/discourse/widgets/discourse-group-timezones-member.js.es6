import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { emojiUrlFor } from "discourse/lib/text";

export default createWidget("discourse-group-timezones-member", {
  tagName: "li.group-timezones-member",

  buildClasses(attrs) {
    return attrs.member.onHoliday ? "on-holiday" : "not-on-holiday";
  },

  transform(attrs) {
    return {
      emojiUrl: Discourse.getURL(emojiUrlFor("desert_island"))
    };
  },

  template: hbs`
    {{#if attrs.member.onHoliday}}
      <img src={{transformed.emojiUrl}} class="emoji" alt="on-holiday">
    {{/if}}
    {{attrs.member.userLink}}
  `
});
