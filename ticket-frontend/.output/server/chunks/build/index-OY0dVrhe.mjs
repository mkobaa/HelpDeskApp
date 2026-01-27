import { _ as _sfc_main$e, a as __nuxt_component_1, b as __nuxt_component_2 } from './navbar-DByaTdfk.mjs';
import { _ as _sfc_main$1 } from './Select-Dv6KDMrI.mjs';
import { b as _sfc_main$2 } from './usePortal-BKdXuyUd.mjs';
import { _ as __nuxt_component_3 } from './ticketsTable-DiR1u5h5.mjs';
import { defineComponent, reactive, computed, resolveComponent, withCtx, unref, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { a as getCategories } from './categories-nlYrqBCy.mjs';
import { u as useAsyncData } from './index-Db0gMLsE.mjs';
import 'reka-ui';
import './server.mjs';
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
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import '@vueuse/core';
import 'vaul-vue';
import 'reka-ui/namespaced';
import './nuxt-link-Bj7IzWuU.mjs';
import 'tailwind-variants';
import './Table-jij3JVau.mjs';
import '@tanstack/vue-table';
import '@tanstack/vue-virtual';
import './tickets-BxG6Zsyw.mjs';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const filters = reactive({
      status: "",
      priority: "",
      category_id: ""
    });
    const { data: categories, refresh: refreshCategories } = useAsyncData(
      "categories",
      () => getCategories(),
      {
        default: () => [],
        server: false,
        lazy: true
      }
    );
    const statusOptions = ["open", "pending", "closed"];
    const priorityOptions = ["low", "medium", "high"];
    const categoryOptions = computed(() => {
      return (categories.value || []).map((c) => ({ label: c.name, value: String(c.id) }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardGroup = _sfc_main$e;
      const _component_Sidebar = __nuxt_component_1;
      const _component_UDashboardPage = resolveComponent("UDashboardPage");
      const _component_Navbar = __nuxt_component_2;
      const _component_UDashboardPageHeader = resolveComponent("UDashboardPageHeader");
      const _component_UFormGroup = resolveComponent("UFormGroup");
      const _component_USelect = _sfc_main$1;
      const _component_UButton = _sfc_main$2;
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
                  _push3(`</div><div class="flex gap-4 items-end"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Status",
                    class: "w-40"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(filters).status,
                          "onUpdate:modelValue": ($event) => unref(filters).status = $event,
                          items: statusOptions,
                          placeholder: "All Status"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(filters).status,
                            "onUpdate:modelValue": ($event) => unref(filters).status = $event,
                            items: statusOptions,
                            placeholder: "All Status"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Priority",
                    class: "w-40"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(filters).priority,
                          "onUpdate:modelValue": ($event) => unref(filters).priority = $event,
                          items: priorityOptions,
                          placeholder: "All Priorities"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(filters).priority,
                            "onUpdate:modelValue": ($event) => unref(filters).priority = $event,
                            items: priorityOptions,
                            placeholder: "All Priorities"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Category",
                    class: "w-40"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(filters).category_id,
                          "onUpdate:modelValue": ($event) => unref(filters).category_id = $event,
                          items: unref(categoryOptions),
                          "option-attribute": "label",
                          placeholder: "All Categories"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(filters).category_id,
                            "onUpdate:modelValue": ($event) => unref(filters).category_id = $event,
                            items: unref(categoryOptions),
                            "option-attribute": "label",
                            placeholder: "All Categories"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    color: "gray",
                    variant: "ghost",
                    icon: "i-lucide-x",
                    onClick: ($event) => Object.assign(unref(filters), { status: "", priority: "", category_id: "" }),
                    disabled: !unref(filters).status && !unref(filters).priority && !unref(filters).category_id
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Clear `);
                      } else {
                        return [
                          createTextVNode(" Clear ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_TicketsTable, {
                    class: "flex-1 w-full",
                    filters: unref(filters)
                  }, null, _parent3, _scopeId2));
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
                      createVNode("div", { class: "flex gap-4 items-end" }, [
                        createVNode(_component_UFormGroup, {
                          label: "Status",
                          class: "w-40"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(filters).status,
                              "onUpdate:modelValue": ($event) => unref(filters).status = $event,
                              items: statusOptions,
                              placeholder: "All Status"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormGroup, {
                          label: "Priority",
                          class: "w-40"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(filters).priority,
                              "onUpdate:modelValue": ($event) => unref(filters).priority = $event,
                              items: priorityOptions,
                              placeholder: "All Priorities"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormGroup, {
                          label: "Category",
                          class: "w-40"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(filters).category_id,
                              "onUpdate:modelValue": ($event) => unref(filters).category_id = $event,
                              items: unref(categoryOptions),
                              "option-attribute": "label",
                              placeholder: "All Categories"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UButton, {
                          color: "gray",
                          variant: "ghost",
                          icon: "i-lucide-x",
                          onClick: ($event) => Object.assign(unref(filters), { status: "", priority: "", category_id: "" }),
                          disabled: !unref(filters).status && !unref(filters).priority && !unref(filters).category_id
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" Clear ")
                          ]),
                          _: 1
                        }, 8, ["onClick", "disabled"])
                      ]),
                      createVNode(_component_TicketsTable, {
                        class: "flex-1 w-full",
                        filters: unref(filters)
                      }, null, 8, ["filters"])
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
                    createVNode("div", { class: "flex gap-4 items-end" }, [
                      createVNode(_component_UFormGroup, {
                        label: "Status",
                        class: "w-40"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(filters).status,
                            "onUpdate:modelValue": ($event) => unref(filters).status = $event,
                            items: statusOptions,
                            placeholder: "All Status"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormGroup, {
                        label: "Priority",
                        class: "w-40"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(filters).priority,
                            "onUpdate:modelValue": ($event) => unref(filters).priority = $event,
                            items: priorityOptions,
                            placeholder: "All Priorities"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormGroup, {
                        label: "Category",
                        class: "w-40"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(filters).category_id,
                            "onUpdate:modelValue": ($event) => unref(filters).category_id = $event,
                            items: unref(categoryOptions),
                            "option-attribute": "label",
                            placeholder: "All Categories"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UButton, {
                        color: "gray",
                        variant: "ghost",
                        icon: "i-lucide-x",
                        onClick: ($event) => Object.assign(unref(filters), { status: "", priority: "", category_id: "" }),
                        disabled: !unref(filters).status && !unref(filters).priority && !unref(filters).category_id
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Clear ")
                        ]),
                        _: 1
                      }, 8, ["onClick", "disabled"])
                    ]),
                    createVNode(_component_TicketsTable, {
                      class: "flex-1 w-full",
                      filters: unref(filters)
                    }, null, 8, ["filters"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/supervisor/tickets/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-OY0dVrhe.mjs.map
