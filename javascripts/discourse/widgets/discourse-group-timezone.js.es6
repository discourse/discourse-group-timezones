import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezone", {
  tagName: "div.group-timezone",

  buildClasses(attrs) {
    let classes = [];

    if (attrs.groupedTimezone.closeToWorkingHours) {
      classes.push("close-to-working-hours");
    }

    if (attrs.groupedTimezone.inWorkingHours) {
      classes.push("in-working-hours");
    }

    return classes.join(" ");
  },

  template: hbs`
    <div class="info">
      <span class="time">
        {{attrs.groupedTimezone.formatedTime}}
      </span>
      <span class="offset" title="UTC offset">
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
