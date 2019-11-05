import { h } from "virtual-dom";
import { formatUsername } from "discourse/lib/utilities";
import { userPath } from "discourse/lib/url";
import { avatarImg } from "discourse/widgets/post";
import hbs from "discourse/widgets/hbs-compiler";
import { cookAsync } from "discourse/lib/text";
import { getOwner } from "discourse-common/lib/get-owner";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones-time-traveler", {
  tagName: "div.group-timezones-slider",

  transform(attrs) {
    return {
      localTimeWithOffset: attrs.localTime
        .add(attrs.localTimeOffset, "minutes")
        .format("llll")
    };
  },

  onChangeOffset(offset) {
    this.sendWidgetAction(
      "onChangeLocalTime",
      this.attrs.localTimeOffset + offset
    );
  },

  onResetOffset() {
    this.sendWidgetAction("onChangeLocalTime", 0);
  },

  template: hbs`
    {{#if attrs.localTimeOffset}}
      {{attach
        widget="button"
        attrs=(hash
          action="onResetOffset"
          icon="undo"
        )
      }}
    {{/if}}
    {{attach
      widget="button"
      attrs=(hash
        action="onChangeOffset"
        actionParam=-60
        icon="angle-double-left"
      )
    }}
    {{attach
      widget="button"
      attrs=(hash
        action="onChangeOffset"
        actionParam=-30
        icon="chevron-left"
      )
    }}
    <span>
      {{transformed.localTimeWithOffset}}
    </span>
    {{attach
      widget="button"
      attrs=(hash
        action="onChangeOffset"
        actionParam=30
        icon="chevron-right"
      )
    }}
    {{attach
      widget="button"
      attrs=(hash
        action="onChangeOffset"
        actionParam=60
        icon="angle-double-right"
      )
    }}
  `
});
