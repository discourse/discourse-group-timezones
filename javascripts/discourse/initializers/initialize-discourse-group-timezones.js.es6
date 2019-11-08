import WidgetGlue from "discourse/widgets/glue";
import { getRegister } from "discourse-common/lib/get-owner";
import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "discourse-group-timezones",

  initialize() {
    withPluginApi("0.8.7", api => {
      const register = getRegister(api);
      const usersOnHoliday =
        api.container.lookup("site:main").users_on_holiday || [];
      let _glued = [];

      function attachGroupTimezones($elem, helper) {
        const $groupTimezones = $(".d-wrap[data-wrap=group-timezones]", $elem);

        if (!$groupTimezones.length) {
          return;
        }

        let id = 1;
        if (helper) {
          const post = helper.getModel();
          api.preventCloak(post.id);
          id = post.id;
        }

        $groupTimezones.each((idx, groupTimezone) => {
          const group = groupTimezone.getAttribute("data-group");
          if (!group) {
            throw "[group] attribute is necessary when using group-timezones.";
          }

          const size = groupTimezone.getAttribute("data-size") || "medium";

          groupTimezone.innerHTML = "<div class='spinner'></div>";

          ajax(`/groups/${group}/members.json?limit=50`, {
            type: "GET",
            cache: false
          }).then(groupResult => {
            if (groupResult && groupResult.members) {
              const glue = new WidgetGlue(
                "discourse-group-timezones",
                register,
                {
                  id: `${id}-${idx}`,
                  members: groupResult.members,
                  usersOnHoliday,
                  size,
                  group
                }
              );
              glue.appendTo(groupTimezone);
              _glued.push(glue);
            }
          });
        });
      }

      function cleanUp() {
        _glued.forEach(g => g.cleanUp());
        _glued = [];
      }

      api.decorateCooked(attachGroupTimezones, {
        id: "discourse-group-timezones"
      });

      api.onPageChange(url => {
        const match = url.match(/\/g\/(\w+)/);
        if (match && match.length && match[1]) {
          const $elem = $(".group-bio");
          if ($elem.length) {
            attachGroupTimezones($elem);
          }
        }
      });

      api.cleanupStream(cleanUp);
    });
  }
};
