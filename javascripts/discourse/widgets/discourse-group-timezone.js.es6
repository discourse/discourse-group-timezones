import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezone", {
  tagName: "div.group-timezone",

  buildClasses(attrs) {
    if (!attrs.groupedTimezone.inWorkingHours) {
      return "not-in-working-hours";
    }
  },

  template: hbs`
    <div class="info">
      <span class="time">{{this.attrs.groupedTimezone.formatedTime}}</span>
      <span class="timezone">{{this.attrs.groupedTimezone.formatedTimezone}}</span>
      <span class="offset">{{this.attrs.groupedTimezone.formatedOffset}}</span>
    </div>
    <ul class="members">
      {{#each this.attrs.groupedTimezone.members as |member|}}
        <li class="member">
          {{member.userLink}}
        </li>
      {{/each}}
    </ul>
  `
});
