import { _ as _sfc_main$e, a as __nuxt_component_1, b as __nuxt_component_2 } from './navbar-DByaTdfk.mjs';
import { _ as _sfc_main$2 } from './Table-jij3JVau.mjs';
import { b as _sfc_main$3 } from './usePortal-BKdXuyUd.mjs';
import { resolveComponent, withCtx, createVNode, defineComponent, withAsyncContext, computed, mergeProps, unref, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { c as getTechniciansWorkload } from './tickets-BxG6Zsyw.mjs';
import { u as useAsyncData } from './index-Db0gMLsE.mjs';
import { _ as _export_sfc } from './server.mjs';
import 'reka-ui';
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
import 'vaul-vue';
import 'reka-ui/namespaced';
import './nuxt-link-Bj7IzWuU.mjs';
import '@tanstack/vue-table';
import '@tanstack/vue-virtual';
import 'tailwind-variants';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "techniciansWorkload",
  __ssrInlineRender: true,
  props: {
    filters: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const columns = [
      { accessorKey: "technician.id", header: "ID" },
      { accessorKey: "technician.username", header: "Username" },
      { accessorKey: "technician.email", header: "Email" },
      { accessorKey: "open_count", header: "Open" },
      { accessorKey: "in_progress_count", header: "In Progress" },
      { accessorKey: "ticket_count", header: "Total Tickets" },
      {
        accessorKey: "actions",
        header: "Actions"
      }
    ];
    const { data: workload, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "workload",
      () => getTechniciansWorkload(),
      {
        watch: [() => props.filters],
        server: false,
        lazy: false,
        default: () => []
      }
    )), __temp = await __temp, __restore(), __temp);
    const data = computed(() => workload.value || []);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UTable = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      _push(ssrRenderComponent(_component_UTable, mergeProps({
        data: unref(data),
        columns,
        loading: unref(status) === "pending"
      }, _attrs), {
        "actions-cell": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              size: "xs",
              color: "primary",
              variant: "soft",
              icon: "i-lucide-eye",
              to: `/supervisor/technicians/${row.original.technician.id}`
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` View `);
                } else {
                  return [
                    createTextVNode(" View ")
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex" }, [
                createVNode(_component_UButton, {
                  size: "xs",
                  color: "primary",
                  variant: "soft",
                  icon: "i-lucide-eye",
                  to: `/supervisor/technicians/${row.original.technician.id}`
                }, {
                  default: withCtx(() => [
                    createTextVNode(" View ")
                  ]),
                  _: 1
                }, 8, ["to"])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/techniciansWorkload.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "TechniciansWorkload" });
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_UDashboardGroup = _sfc_main$e;
  const _component_Sidebar = __nuxt_component_1;
  const _component_UDashboardPage = resolveComponent("UDashboardPage");
  const _component_Navbar = __nuxt_component_2;
  const _component_UDashboardPageHeader = resolveComponent("UDashboardPageHeader");
  const _component_TechniciansWorkload = __nuxt_component_3;
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
              _push3(ssrRenderComponent(_component_TechniciansWorkload, { class: "flex-1 w-full" }, null, _parent3, _scopeId2));
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
                  createVNode(_component_TechniciansWorkload, { class: "flex-1 w-full" })
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
                createVNode(_component_TechniciansWorkload, { class: "flex-1 w-full" })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/supervisor/technicians/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-BX8A9_Pt.mjs.map
