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
      <span class="time">{{attrs.groupedTimezone.formatedTime}}</span>
      <span class="offset">
        {{{attrs.groupedTimezone.formatedOffset}}}
      </span>
    </div>
    <ul class="members">
      {{#each attrs.groupedTimezone.members as |member|}}
        {{attach
          widget="discourse-group-timezones-member"
          attrs=(hash
            member=member
          )
        }}
      {{/each}}
    </ul>
  `
});
