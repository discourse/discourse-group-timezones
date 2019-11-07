import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-time-traveler", {
  tagName: "div.group-timezones-time-traveler",

  transform(attrs) {
    const offsetedTime = moment().add(attrs.localTimeOffset, "minutes");

    if (attrs.localTimeOffset) {
      offsetedTime.minutes((Math.round(offsetedTime.minutes() / 15) * 15) % 60);
    }

    return {
      localTimeWithOffset: offsetedTime.format("HH:mm")
    };
  },

  template: hbs`
    {{attach
      widget="discourse-group-timezones-reset"
      attrs=(hash
        id=attrs.id
        localTimeOffset=attrs.localTimeOffset
      )
    }}
    <span class="time">
      {{transformed.localTimeWithOffset}}
    </span>
    {{attach
      widget="discourse-group-timezones-slider"
    }}
  `
});
