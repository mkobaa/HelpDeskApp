import { _ as _sfc_main$e, a as __nuxt_component_1, b as __nuxt_component_2 } from './navbar-DByaTdfk.mjs';
import { _ as __nuxt_component_3 } from './ticketsTable-DiR1u5h5.mjs';
import { resolveComponent, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
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
import './index-Db0gMLsE.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './nuxt-link-Bj7IzWuU.mjs';
import 'vaul-vue';
import 'reka-ui/namespaced';
import './Table-jij3JVau.mjs';
import '@tanstack/vue-table';
import '@tanstack/vue-virtual';
import './tickets-BxG6Zsyw.mjs';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_UDashboardGroup = _sfc_main$e;
  const _component_Sidebar = __nuxt_component_1;
  const _component_UDashboardPage = resolveComponent("UDashboardPage");
  const _component_Navbar = __nuxt_component_2;
  const _component_UDashboardPageHeader = resolveComponent("UDashboardPageHeader");
  const _component_TicketsTable = __nuxt_component_3;
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
              _push3(`<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto"${_scopeId2}><div class="flex items-center justify-between gap-3"${_scopeId2}>`);
              _push3(ssrRenderComponent(_component_UDashboardPageHeader, {
                title: "Dashboard",
                description: "Welcome to your dashboard."
              }, null, _parent3, _scopeId2));
              _push3(`</div>`);
              _push3(ssrRenderComponent(_component_TicketsTable, { class: "flex-1 w-full" }, null, _parent3, _scopeId2));
              _push3(`</div>`);
            } else {
              return [
                createVNode(_component_Navbar, {
                  title: "Dashboard",
                  icon: "i-lucide-house",
                  class: "w-full"
                }),
                createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                  createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                    createVNode(_component_UDashboardPageHeader, {
                      title: "Dashboard",
                      description: "Welcome to your dashboard."
                    })
                  ]),
                  createVNode(_component_TicketsTable, { class: "flex-1 w-full" })
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
                createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                  createVNode(_component_UDashboardPageHeader, {
                    title: "Dashboard",
                    description: "Welcome to your dashboard."
                  })
                ]),
                createVNode(_component_TicketsTable, { class: "flex-1 w-full" })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/technician/tickets/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-Bwgt2XUd.mjs.map
