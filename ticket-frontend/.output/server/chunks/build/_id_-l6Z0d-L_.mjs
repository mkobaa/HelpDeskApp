import { _ as _sfc_main$e, a as __nuxt_component_1, b as __nuxt_component_2, c as _sfc_main$6 } from './navbar-DByaTdfk.mjs';
import { _ as _sfc_main$2 } from './Card-o7xn3WFg.mjs';
import { defineComponent, computed, ref, reactive, watch, resolveComponent, withCtx, createBlock, createCommentVNode, openBlock, createVNode, toDisplayString, withAsyncContext, mergeProps, unref, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { c as getTechnician } from './users-DRTWlAv4.mjs';
import { _ as _sfc_main$3 } from './Table-jij3JVau.mjs';
import { b as _sfc_main$4 } from './usePortal-BKdXuyUd.mjs';
import { b as getAssignedTickets } from './tickets-BxG6Zsyw.mjs';
import { u as useAsyncData } from './index-Db0gMLsE.mjs';
import { d as useRoute, e as useRouter, b as useCookie } from './server.mjs';
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
  __name: "TechnicianTickets",
  __ssrInlineRender: true,
  props: {
    technicianId: {},
    filters: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const columns = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "priority", header: "Priority" },
      { accessorKey: "category.name", header: "Category" },
      { accessorKey: "created_at", header: "Created At" },
      {
        accessorKey: "actions",
        header: "Actions"
        // cell: () => null
      }
    ];
    const { data: tickets, status, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "tickets",
      () => props.technicianId ? getAssignedTickets(props.technicianId) : getAssignedTickets(""),
      {
        watch: [() => props.filters, () => props.technicianId],
        server: false,
        lazy: false,
        default: () => []
      }
    )), __temp = await __temp, __restore(), __temp);
    const data = computed(() => {
      if (!tickets.value) return [];
      if (Array.isArray(tickets.value)) return tickets.value;
      if (tickets.value.data && Array.isArray(tickets.value.data)) return tickets.value.data;
      if (tickets.value.data && tickets.value.data.data && Array.isArray(tickets.value.data.data)) return tickets.value.data.data;
      return [];
    });
    const prioritiesClass = (s) => {
      const map = {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-orange-100 text-orange-800",
        critical: "bg-red-100 text-red-800"
      };
      return map[String(s)] || "bg-gray-50 text-gray-700";
    };
    const statusClass = (s) => {
      const map = {
        open: "bg-green-100 text-green-800",
        in_progress: "bg-yellow-100 text-yellow-800",
        pending: "bg-orange-100 text-orange-800",
        resolved: "bg-blue-100 text-blue-800",
        closed: "bg-gray-100 text-gray-600"
      };
      return map[String(s)] || "bg-gray-50 text-gray-700";
    };
    const statusLabel = (s) => {
      if (!s) return "";
      if (s === "in_progress") return "In Progress";
      return String(s).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };
    const role = useCookie("role");
    let link = "";
    if (role.value === "technician") {
      link = "/technician/tickets/";
    } else if (role.value === "supervisor") {
      link = "/supervisor/tickets/";
    } else if (role.value === "user") {
      link = "/user/tickets/";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UTable = _sfc_main$3;
      const _component_UButton = _sfc_main$4;
      const _component_UBadge = _sfc_main$6;
      _push(ssrRenderComponent(_component_UTable, mergeProps({
        data: unref(data),
        columns,
        loading: unref(status) === "pending"
      }, _attrs), {
        "actions-cell": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              size: "xs",
              color: "primary",
              variant: "soft",
              icon: "i-lucide-eye",
              to: `${unref(link)}${row.original.id}`
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
              createVNode("div", { class: "flex gap-2" }, [
                createVNode(_component_UButton, {
                  size: "xs",
                  color: "primary",
                  variant: "soft",
                  icon: "i-lucide-eye",
                  to: `${unref(link)}${row.original.id}`
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
        "status-cell": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UBadge, {
              color: "neutral",
              variant: "soft",
              class: `${statusClass(row.original.status)} px-2 py-1 text-xs font-semibold`
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(statusLabel(row.original.status))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(statusLabel(row.original.status)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center" }, [
                createVNode(_component_UBadge, {
                  color: "neutral",
                  variant: "soft",
                  class: `${statusClass(row.original.status)} px-2 py-1 text-xs font-semibold`
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(statusLabel(row.original.status)), 1)
                  ]),
                  _: 2
                }, 1032, ["class"])
              ])
            ];
          }
        }),
        "priority-cell": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UBadge, {
              color: "neutral",
              variant: "soft",
              class: `${prioritiesClass(row.original.priority)} px-2 py-1 text-xs font-semibold`
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(statusLabel(row.original.priority))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(statusLabel(row.original.priority)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center" }, [
                createVNode(_component_UBadge, {
                  color: "neutral",
                  variant: "soft",
                  class: `${prioritiesClass(row.original.priority)} px-2 py-1 text-xs font-semibold`
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(statusLabel(row.original.priority)), 1)
                  ]),
                  _: 2
                }, 1032, ["class"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TechnicianTickets.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const TechnicianTickets = Object.assign(_sfc_main$1, { __name: "TechnicianTickets" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const userId = computed(() => route.params.id);
    const isEditing = ref(false);
    ref(false);
    const form = reactive({
      username: "",
      email: "",
      password: "",
      role: "",
      department: ""
    });
    const user = ref(null);
    const status = ref("idle");
    const error = ref(null);
    const loadUser = async () => {
      if (!userId.value) return;
      status.value = "pending";
      error.value = null;
      try {
        const data = await getTechnician(userId.value);
        user.value = data;
        form.username = data?.username || "";
        form.email = data?.email || "";
        form.role = data?.role || "";
        form.department = data?.department || "";
        status.value = "success";
      } catch (err) {
        error.value = err;
        status.value = "error";
      }
    };
    watch(userId, (v, ov) => {
      if (v && v !== ov) loadUser();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardGroup = _sfc_main$e;
      const _component_Sidebar = __nuxt_component_1;
      const _component_UDashboardPage = resolveComponent("UDashboardPage");
      const _component_Navbar = __nuxt_component_2;
      const _component_UDashboardPageHeader = resolveComponent("UDashboardPageHeader");
      const _component_UCard = _sfc_main$2;
      _push(ssrRenderComponent(_component_UDashboardGroup, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Sidebar, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UDashboardPage, { class: "flex flex-col flex-1 min-w-0 overflow-hidden" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_Navbar, {
                    title: "User details",
                    icon: "i-lucide-user",
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto"${_scopeId2}><div class="flex items-center justify-between gap-3"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UDashboardPageHeader, {
                    title: user.value?.username || "User",
                    description: user.value?.email || ""
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UCard, null, {
                    header: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex items-center justify-between"${_scopeId3}><p class="text-sm font-semibold text-highlighted"${_scopeId3}>Profile</p>`);
                        if (status.value === "pending") {
                          _push4(`<div class="text-xs text-muted"${_scopeId3}>Loading...</div>`);
                        } else {
                          _push4(`<!---->`);
                        }
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "flex items-center justify-between" }, [
                            createVNode("p", { class: "text-sm font-semibold text-highlighted" }, "Profile"),
                            status.value === "pending" ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs text-muted"
                            }, "Loading...")) : createCommentVNode("", true)
                          ])
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (!isEditing.value) {
                          _push4(`<div class="grid grid-cols-1 gap-4 sm:grid-cols-2"${_scopeId3}><div${_scopeId3}><p class="text-xs text-muted"${_scopeId3}>Username</p><p class="text-sm text-highlighted"${_scopeId3}>${ssrInterpolate(user.value?.username || "—")}</p></div><div${_scopeId3}><p class="text-xs text-muted"${_scopeId3}>Email</p><p class="text-sm text-highlighted"${_scopeId3}>${ssrInterpolate(user.value?.email || "—")}</p></div><div${_scopeId3}><p class="text-xs text-muted"${_scopeId3}>Role</p><p class="text-sm text-highlighted"${_scopeId3}>${ssrInterpolate(user.value?.role || "—")}</p></div><div${_scopeId3}><p class="text-xs text-muted"${_scopeId3}>Department</p><p class="text-sm text-highlighted"${_scopeId3}>${ssrInterpolate(user.value?.department || "—")}</p></div></div>`);
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          !isEditing.value ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "grid grid-cols-1 gap-4 sm:grid-cols-2"
                          }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Username"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.username || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Email"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.email || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Role"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.role || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Department"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.department || "—"), 1)
                            ])
                          ])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="mt-6"${_scopeId2}><p class="text-sm font-semibold text-highlighted mb-2"${_scopeId2}>Assigned Tickets</p>`);
                  if (user.value?.id) {
                    _push3(ssrRenderComponent(TechnicianTickets, {
                      technicianId: user.value.id
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode(_component_Navbar, {
                      title: "User details",
                      icon: "i-lucide-user",
                      class: "w-full"
                    }),
                    createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                      createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                        createVNode(_component_UDashboardPageHeader, {
                          title: user.value?.username || "User",
                          description: user.value?.email || ""
                        }, null, 8, ["title", "description"])
                      ]),
                      createVNode(_component_UCard, null, {
                        header: withCtx(() => [
                          createVNode("div", { class: "flex items-center justify-between" }, [
                            createVNode("p", { class: "text-sm font-semibold text-highlighted" }, "Profile"),
                            status.value === "pending" ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs text-muted"
                            }, "Loading...")) : createCommentVNode("", true)
                          ])
                        ]),
                        default: withCtx(() => [
                          !isEditing.value ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "grid grid-cols-1 gap-4 sm:grid-cols-2"
                          }, [
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Username"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.username || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Email"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.email || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Role"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.role || "—"), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "text-xs text-muted" }, "Department"),
                              createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.department || "—"), 1)
                            ])
                          ])) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "mt-6" }, [
                        createVNode("p", { class: "text-sm font-semibold text-highlighted mb-2" }, "Assigned Tickets"),
                        user.value?.id ? (openBlock(), createBlock(TechnicianTickets, {
                          key: 0,
                          technicianId: user.value.id
                        }, null, 8, ["technicianId"])) : createCommentVNode("", true)
                      ])
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
                    title: "User details",
                    icon: "i-lucide-user",
                    class: "w-full"
                  }),
                  createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                    createVNode("div", { class: "flex items-center justify-between gap-3" }, [
                      createVNode(_component_UDashboardPageHeader, {
                        title: user.value?.username || "User",
                        description: user.value?.email || ""
                      }, null, 8, ["title", "description"])
                    ]),
                    createVNode(_component_UCard, null, {
                      header: withCtx(() => [
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode("p", { class: "text-sm font-semibold text-highlighted" }, "Profile"),
                          status.value === "pending" ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "text-xs text-muted"
                          }, "Loading...")) : createCommentVNode("", true)
                        ])
                      ]),
                      default: withCtx(() => [
                        !isEditing.value ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "grid grid-cols-1 gap-4 sm:grid-cols-2"
                        }, [
                          createVNode("div", null, [
                            createVNode("p", { class: "text-xs text-muted" }, "Username"),
                            createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.username || "—"), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("p", { class: "text-xs text-muted" }, "Email"),
                            createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.email || "—"), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("p", { class: "text-xs text-muted" }, "Role"),
                            createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.role || "—"), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("p", { class: "text-xs text-muted" }, "Department"),
                            createVNode("p", { class: "text-sm text-highlighted" }, toDisplayString(user.value?.department || "—"), 1)
                          ])
                        ])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "mt-6" }, [
                      createVNode("p", { class: "text-sm font-semibold text-highlighted mb-2" }, "Assigned Tickets"),
                      user.value?.id ? (openBlock(), createBlock(TechnicianTickets, {
                        key: 0,
                        technicianId: user.value.id
                      }, null, 8, ["technicianId"])) : createCommentVNode("", true)
                    ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/supervisor/technicians/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-l6Z0d-L_.mjs.map
