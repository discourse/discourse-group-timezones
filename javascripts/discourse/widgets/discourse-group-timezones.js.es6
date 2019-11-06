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

  buildClasses(attrs) {
    return attrs.size;
  },

  defaultState(attrs) {
    return {
      localTimeOffset: 0,
      localTime: moment()
    };
  },

  onChangeLocalTime(offset) {
    this.state.localTimeOffset = offset;
  },

  transform(attrs, state) {
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
      member.onHoliday = attrs.usersOnHoliday.includes(member.username);

      if (groupedTimezone) {
        groupedTimezone.members.push(member);
      } else {
        const offset = moment.tz(moment.utc(), timezone).utcOffset();
        const momentTimezone = moment.tz(timezone);
        const enMoment = moment().locale("en");
        const getIsoWeekday = day =>
          enMoment.localeData()._weekdays.indexOf(day) || 7;
        const workingDays = settings.working_days
          .split("|")
          .filter(Boolean)
          .map(x => getIsoWeekday(x));

        groupedTimezones.push({
          type: "discourse-group-timezone",
          moment: momentTimezone.add(state.localTimeOffset, "minutes"),
          identifier,
          formatedTime: momentTimezone.format("LT"),
          timezone,
          offset,
          closeToWorkingHours:
            ((momentTimezone.hours() >
              Math.max(settings.working_day_start_hour - 2, 0) &&
              momentTimezone.hours() < settings.working_day_start_hour) ||
              (momentTimezone.hours() <
                Math.min(settings.working_day_end_hour + 2, 23) &&
                momentTimezone.hours() > settings.working_day_end_hour)) &&
            workingDays.includes(momentTimezone.isoWeekday()),
          inWorkingHours:
            momentTimezone.hours() > settings.working_day_start_hour &&
            momentTimezone.hours() < settings.working_day_end_hour &&
            workingDays.includes(momentTimezone.isoWeekday()),
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
      groupedTimezones,
      localTime: moment()
    };
  },

  template: hbs`
    {{attach
      widget="discourse-group-timezones-header"
      attrs=(hash
        group=attrs.group
        localTime=this.transformed.localTime
        localTimeOffset=state.localTimeOffset
      )
    }}
    <div class="group-timezones-body">
      {{#each this.transformed.groupedTimezones as |groupedTimezone|}}
        {{attach
          widget=groupedTimezone.type
          attrs=(hash
            groupedTimezone=groupedTimezone
          )
        }}
      {{/each}}
    </div>
  `,

  _formatOffset(offset) {
    const sign = Math.sign(offset) === 1 ? "+" : "-";
    offset = Math.abs(offset);
    let hours = Math.floor(offset / 60).toString();
    hours = hours.length === 1 ? `0${hours}` : hours;
    let minutes = (offset % 60).toString();
    minutes = minutes.length === 1 ? `:${minutes}0` : `:${minutes}`;
    return `${sign}${hours.replace(/^0(\d)/, "$1")}${minutes.replace(
      /:00$/,
      ""
    )}`.replace(/-0/, "&nbsp;");
  },

  _userLink({ avatar_template, usernameUrl, username } = member) {
    return h(
      "a",
      {
        attributes: {
          href: usernameUrl,
          title: username,
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
