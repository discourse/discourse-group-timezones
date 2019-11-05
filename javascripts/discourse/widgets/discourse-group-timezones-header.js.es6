import { h } from "virtual-dom";
import { formatUsername } from "discourse/lib/utilities";
import { userPath } from "discourse/lib/url";
import { avatarImg } from "discourse/widgets/post";
import hbs from "discourse/widgets/hbs-compiler";
import { cookAsync } from "discourse/lib/text";
import { getOwner } from "discourse-common/lib/get-owner";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-header", {
  tagName: "div.group-timezones-header",

  template: hbs`
    <span class="title">{{attrs.group}} Availability</span>
    {{attach
      widget="discourse-group-timezones-time-traveler"
      attrs=(hash
        localTimeOffset=attrs.localTimeOffset
        localTime=attrs.localTime
      )
    }}
  `
});
