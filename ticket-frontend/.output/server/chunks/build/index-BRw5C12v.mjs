import { _ as _sfc_main$e, a as __nuxt_component_1, b as __nuxt_component_2 } from './navbar-DByaTdfk.mjs';
import { _ as _sfc_main$2 } from './Table-jij3JVau.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-Bj7IzWuU.mjs';
import { resolveComponent, withCtx, createVNode, defineComponent, withAsyncContext, computed, watchEffect, mergeProps, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, b as useCookie } from './server.mjs';
import { a as getUsers } from './users-DRTWlAv4.mjs';
import { u as useAsyncData } from './index-Db0gMLsE.mjs';
import 'reka-ui';
import './usePortal-BKdXuyUd.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import '@vueuse/core';
import 'tailwind-variants';
import 'vaul-vue';
import 'reka-ui/namespaced';
import '@tanstack/vue-table';
import '@tanstack/vue-virtual';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';

const getHistory = async (criteria = {}) => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const params = new URLSearchParams();
  if (criteria.status) params.append("status", criteria.status);
  if (criteria.priority) params.append("priority", criteria.priority);
  if (criteria.category_id) params.append("category_id", criteria.category_id);
  if (typeof criteria === "string") {
    params.append("name", criteria);
  } else if (criteria.name) {
    params.append("name", criteria.name);
  }
  let url = "http://localhost:8000/api/history/logs";
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`
    }
  });
  const raw = await response.json();
  if (!response.ok) {
    throw raw;
  }
  if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.tickets)) return raw.tickets;
  return [];
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "historyTable",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: history, status, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "history-list",
      () => getHistory(),
      { server: false, lazy: false }
    )), __temp = await __temp, __restore(), __temp);
    const data = computed(() => {
      if (!history.value) return [];
      if (Array.isArray(history.value)) return history.value;
      if (history.value.data && Array.isArray(history.value.data)) return history.value.data;
      if (history.value.data && history.value.data.data && Array.isArray(history.value.data.data)) return history.value.data.data;
      return [];
    });
    const { data: users } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("all-users", () => getUsers(), { server: false, lazy: false })), __temp = await __temp, __restore(), __temp);
    const usersMap = computed(() => {
      const map = {};
      const usersArr = users.value && (Array.isArray(users.value) ? users.value : users.value.data) || [];
      (usersArr || []).forEach((u) => {
        if (u && u.id != null) map[String(u.id)] = u.username || u.name || u.email || `User ${u.id}`;
      });
      return map;
    });
    const getActorName = (row) => {
      const orig = row?.original || {};
      const id = orig.actor_id || orig.user_id || orig.causer_id || orig.actor && orig.actor.id || orig.causer && orig.causer.id;
      if (id != null) return usersMap.value[String(id)] || `User ${id}`;
      return orig.actor_username || orig.causer_username || orig.username || "Unknown";
    };
    watchEffect(() => {
      if (history.value) ;
      if (users.value) ;
    });
    const columns = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "ticket_id", header: "Ticket ID" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "actor_username", header: "Actor Username" },
      { accessorKey: "notes", header: "Notes" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UTable = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_UTable, mergeProps({
        data: data.value,
        columns,
        loading: unref(status) === "pending",
        class: "flex-1"
      }, _attrs), {
        "actor_username-cell": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/users/${row.original.id}`,
              class: "text-primary underline hover:text-primary-600"
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(getActorName(row))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(getActorName(row)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/admin/users/${row.original.id}`,
                class: "text-primary underline hover:text-primary-600"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(getActorName(row)), 1)
                ]),
                _: 2
              }, 1032, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/historyTable.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "HistoryTable" });
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_UDashboardGroup = _sfc_main$e;
  const _component_Sidebar = __nuxt_component_1;
  const _component_UDashboardPage = resolveComponent("UDashboardPage");
  const _component_Navbar = __nuxt_component_2;
  const _component_UDashboardPageHeader = resolveComponent("UDashboardPageHeader");
  const _component_HistoryTable = __nuxt_component_3;
  _push(ssrRenderComponent(_component_UDashboardGroup, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_Sidebar, null, null, _parent2, _scopeId));
        _push2(ssrRenderComponent(_component_UDashboardPage, { class: "flex flex-col flex-1 min-w-0 overflow-hidden" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_Navbar, {
                title: "Dashboard",
                icon: "i-lucide-house",
                class: "w-full"
              }, null, _parent3, _scopeId2));
              _push3(`<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto"${_scopeId2}>`);
              _push3(ssrRenderComponent(_component_UDashboardPageHeader, {
                title: "Dashboard",
                description: "Welcome to your dashboard."
              }, null, _parent3, _scopeId2));
              _push3(ssrRenderComponent(_component_HistoryTable, { class: "flex-1 w-full" }, null, _parent3, _scopeId2));
              _push3(`</div>`);
            } else {
              return [
                createVNode(_component_Navbar, {
                  title: "Dashboard",
                  icon: "i-lucide-house",
                  class: "w-full"
                }),
                createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                  createVNode(_component_UDashboardPageHeader, {
                    title: "Dashboard",
                    description: "Welcome to your dashboard."
                  }),
                  createVNode(_component_HistoryTable, { class: "flex-1 w-full" })
                ])
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_Sidebar),
          createVNode(_component_UDashboardPage, { class: "flex flex-col flex-1 min-w-0 overflow-hidden" }, {
            default: withCtx(() => [
              createVNode(_component_Navbar, {
                title: "Dashboard",
                icon: "i-lucide-house",
                class: "w-full"
              }),
              createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                createVNode(_component_UDashboardPageHeader, {
                  title: "Dashboard",
                  description: "Welcome to your dashboard."
                }),
                createVNode(_component_HistoryTable, { class: "flex-1 w-full" })
              ])
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/history/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-BRw5C12v.mjs.map
