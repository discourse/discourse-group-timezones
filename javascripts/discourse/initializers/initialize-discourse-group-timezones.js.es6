import WidgetGlue from "discourse/widgets/glue";
import { getRegister } from "discourse-common/lib/get-owner";
import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default {
  name: "discourse-group-timezones",

  initialize() {
    withPluginApi("0.8.7", api => {
      const register = getRegister(api);
      let _glued = [];
      let _interval = null;

      function attachGroupTimezones($elem, helper) {
        const $groupTimezones = $(".d-wrap[data-wrap=group-timezones]", $elem);
        if (!$groupTimezones.length) {
          return;
        }

        if (!helper) {
          return;
        }

        const post = helper.getModel();
        api.preventCloak(post.id);

        $groupTimezones.each((idx, groupTimezone) => {
          const group = groupTimezone.getAttribute("data-group");
          ajax(`/groups/${group}/members.json?limit=50`, {
            type: "GET",
            cache: false
          }).then(group => {
            if (group && group.members) {
              const glue = new WidgetGlue(
                "discourse-group-timezones",
                register,
                {
                  id: post.id,
                  members: group.members
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

      api.cleanupStream(cleanUp);
    });
  }
};
