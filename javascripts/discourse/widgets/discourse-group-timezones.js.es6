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
    let groupedTimezones = [];

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
          type: "discourse-group-timezone",
          moment: moment.tz(timezone),
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

    groupedTimezones = groupedTimezones.sortBy("offset");

    let newDayIndex = 0;
    groupedTimezones.forEach((groupedTimezone, index) => {
      if (index > 0) {
        if (
          groupedTimezones[index - 1].moment.format("dddd") !==
          groupedTimezone.moment.format("dddd")
        ) {
          newDayIndex = index;
        }
      }
    });

    if (groupedTimezones[newDayIndex - 1]) {
      groupedTimezones.splice(newDayIndex, 0, {
        type: "discourse-group-timezone-new-day",
        beforeDate: groupedTimezones[newDayIndex - 1].moment.format("dddd"),
        afterDate: groupedTimezones[newDayIndex].moment.format("dddd")
      });
    }

    return {
      groupedTimezones
    };
  },

  template: hbs`
    {{#each this.state.groupedTimezones as |groupedTimezone|}}
      {{attach
        widget=groupedTimezone.type
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
    const sign = Math.sign(offset) === 1 ? "+" : "-";
    offset = Math.abs(offset);
    let hours = Math.floor(offset / 60).toString();
    hours = hours.length === 1 ? `0${hours}` : hours;
    let minutes = (offset % 60).toString();
    minutes = minutes.length === 1 ? `${minutes}0` : minutes;
    return `${sign}${hours}:${minutes}`;
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
