import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-header", {
  tagName: "div.group-timezones-header",

  template: hbs`
    {{attach
      widget="discourse-group-timezones-time-traveler"
      attrs=(hash
        id=attrs.id
        localTimeOffset=attrs.localTimeOffset
        localTime=attrs.localTime
      )
    }}
    <span class="title">{{attrs.group}} Availability</span>
    {{attach
      widget="discourse-group-timezones-filter"
      attrs=(hash
        id=attrs.id
      )
    }}
  `
});
