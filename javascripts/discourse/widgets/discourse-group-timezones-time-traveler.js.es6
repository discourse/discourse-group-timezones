import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import roundMinutes from "discourse/lib/round-minutes";

export default createWidget("discourse-group-timezones-time-traveler", {
  tagName: "div.group-timezones-time-traveler",

  transform(attrs) {
    const date = moment().add(attrs.localTimeOffset, "minutes");

    if (attrs.localTimeOffset) {
      date.minutes(roundMinutes(date.minutes()));
    }

    return {
      localTimeWithOffset: date.format("HH:mm")
    };
  },

  template: hbs`
    <span class="time">
      {{transformed.localTimeWithOffset}}
    </span>
    {{attach
      widget="discourse-group-timezones-slider"
    }}
    {{attach
      widget="discourse-group-timezones-reset"
      attrs=(hash
        id=attrs.id
        localTimeOffset=attrs.localTimeOffset
      )
    }}
  `
});
