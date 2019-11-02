import { h } from "virtual-dom";
import { formatUsername } from "discourse/lib/utilities";
import { userPath } from "discourse/lib/url";
import { avatarImg } from "discourse/widgets/post";
import hbs from "discourse/widgets/hbs-compiler";
import { cookAsync } from "discourse/lib/text";
import { getOwner } from "discourse-common/lib/get-owner";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-timezones", {
  tagName: "div.group-timezones",

  buildKey: attrs => `group-timezones-${attrs.id}`,

  defaultState(attrs) {
    const members = attrs.members || [];
    const groupedTimezones = [];

    members.forEach(member => {
      const timezone = member.timezone;

      if (!timezone) {
        return;
      }

      const identifier = parseInt(moment.tz(timezone).format("YYYYMDHm"), 10);
      const groupedTimezone = groupedTimezones.findBy("identifier", identifier);

      member.userLink = this._userLink(member);

      if (groupedTimezone) {
        groupedTimezone.members.push(member);
      } else {
        const offset = moment.tz(moment.utc(), timezone).utcOffset();

        groupedTimezones.push({
          identifier,
          formatedTime: moment.tz(timezone).format("LT"),
          formatedTimezone: this._formatTimezone(timezone),
          timezone,
          offset,
          inWorkingHours:
            moment.tz(timezone).hours() >= 8 &&
            moment.tz(timezone).hours() <= 17 &&
            moment.tz(timezone).isoWeekday() !== 6 &&
            moment.tz(timezone).isoWeekday() !== 7,
          formatedOffset: this._formatOffset(offset),
          members: [member]
        });
      }
    });

    return {
      groupedTimezones: groupedTimezones.sortBy("offset")
    };
  },

  template: hbs`
    {{#each this.state.groupedTimezones as |groupedTimezone|}}
      {{attach
        widget="discourse-group-timezone"
        attrs=(hash
          groupedTimezone=groupedTimezone
        )
      }}
    {{/each}}
  `,

  _formatTimezone(timezone) {
    const zones = timezone.replace("_", " ").split("/");
    return zones.length === 2 ? zones[1] : zones[0];
  },

  _formatOffset(offset) {
    if (offset > 0) {
      offset = (offset / 60).toString();
      return `${offset.padStart("0")}:00`;
    } else {
      offset = Math.abs(offset / 60).toString();
      return `-${offset.padStart("0")}:00`;
    }
  },

  _userLink({ avatar_template, usernameUrl, username } = member) {
    return h(
      "a",
      {
        attributes: {
          href: usernameUrl,
          "data-user-card": username
        }
      },
      avatarImg("small", {
        template: avatar_template,
        membername: username
      })
    );
  }
});
