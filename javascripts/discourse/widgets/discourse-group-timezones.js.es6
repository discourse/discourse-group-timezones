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

  buildAttributes(attrs) {
    return {
      id: attrs.id
    };
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

  _addMemberToGroup(member, groupedTimezone) {
    let filter = this.state.filter;

    if (filter) {
      filter = filter.toLowerCase();
      if (
        member.username.toLowerCase().indexOf(filter) > -1 ||
        (member.name && member.name.toLowerCase().indexOf(filter) > -1)
      ) {
        groupedTimezone.members.push(member);
      }
    } else {
      groupedTimezone.members.push(member);
    }
  },

  _roundMoment(date) {
    if (this.state.localTimeOffset) {
      date.minutes((Math.round(date.minutes() / 15) * 15) % 60);
    }
    return date;
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
      let groupedTimezone = groupedTimezones.findBy("identifier", identifier);

      member.userLink = this._userLink(member);
      member.onHoliday = attrs.usersOnHoliday.includes(member.username);

      if (groupedTimezone) {
        this._addMemberToGroup(member, groupedTimezone);
      } else {
        const offset = moment.tz(moment.utc(), timezone).utcOffset();
        const momentTimezone = this._roundMoment(moment.tz(timezone));
        const enMoment = moment().locale("en");
        const getIsoWeekday = day =>
          enMoment.localeData()._weekdays.indexOf(day) || 7;
        const workingDays = settings.working_days
          .split("|")
          .filter(Boolean)
          .map(x => getIsoWeekday(x));

        const groupedTimezone = {
          type: "discourse-group-timezone",
          moment: momentTimezone.add(state.localTimeOffset, "minutes"),
          identifier,
          formatedTime: momentTimezone.format("LT"),
          timezone,
          offset,
          closeToWorkingHours:
            ((momentTimezone.hours() >=
              Math.max(settings.working_day_start_hour - 2, 0) &&
              momentTimezone.hours() <= settings.working_day_start_hour) ||
              (momentTimezone.hours() <=
                Math.min(settings.working_day_end_hour + 2, 23) &&
                momentTimezone.hours() >= settings.working_day_end_hour)) &&
            workingDays.includes(momentTimezone.isoWeekday()),
          inWorkingHours:
            momentTimezone.hours() > settings.working_day_start_hour &&
            momentTimezone.hours() < settings.working_day_end_hour &&
            workingDays.includes(momentTimezone.isoWeekday()),
          formatedOffset: this._formatOffset(offset),
          members: []
        };
        groupedTimezones.push(groupedTimezone);
        this._addMemberToGroup(member, groupedTimezone);
      }
    });

    groupedTimezones = groupedTimezones
      .sortBy("offset")
      .filter(group => group.members.length);

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

  onChangeFilter(filter) {
    this.state.filter = filter && filter.length ? filter : null;
  },

  template: hbs`
    {{attach
      widget="discourse-group-timezones-header"
      attrs=(hash
        id=attrs.id
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

  _userLink({ avatar_template, usernameUrl, username, name } = member) {
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
        username: name || username
      })
    );
  }
});
