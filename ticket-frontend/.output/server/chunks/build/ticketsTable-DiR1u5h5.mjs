import { _ as _sfc_main$1 } from './Table-jij3JVau.mjs';
import { b as _sfc_main$2 } from './usePortal-BKdXuyUd.mjs';
import { c as _sfc_main$6 } from './navbar-DByaTdfk.mjs';
import { defineComponent, ref, computed, watch, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as getTickets } from './tickets-BxG6Zsyw.mjs';
import { u as useAsyncData } from './index-Db0gMLsE.mjs';
import { b as useCookie } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ticketsTable",
  __ssrInlineRender: true,
  props: {
    filters: {},
    forceStatus: {}
  },
  setup(__props) {
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
      }
    ];
    const currentPage = ref(1);
    const perPage = ref(20);
    const { data: ticketsRaw, status, refresh } = useAsyncData(
      () => `tickets-page-${currentPage.value}-${props.filters?.status || ""}-${props.filters?.priority || ""}-${props.filters?.category_id || ""}`,
      () => getTickets({ ...props.filters, status: props.filters?.status ?? props.forceStatus, page: currentPage.value, per_page: perPage.value, _raw: true }),
      {
        watch: [() => props.filters?.status, () => props.filters?.priority, () => props.filters?.category_id, () => currentPage.value],
        server: false,
        lazy: false,
        default: () => null
      }
    );
    const data = computed(() => {
      if (!ticketsRaw.value) return [];
      const raw = ticketsRaw.value;
      if (Array.isArray(raw)) return raw;
      if (raw?.data && Array.isArray(raw.data)) return raw.data;
      if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
      if (Array.isArray(raw.tickets)) return raw.tickets;
      return [];
    });
    const total = ref(0);
    const lastPage = ref(1);
    watch(ticketsRaw, (v) => {
      if (!v) {
        total.value = 0;
        lastPage.value = 1;
        return;
      }
      const meta = v?.data?.meta || v?.meta || v?.pagination || v?.data || null;
      if (meta && (meta.total || meta.last_page || meta.current_page || meta.per_page)) {
        total.value = meta.total ?? meta.total_items ?? total.value;
        lastPage.value = meta.last_page ?? meta.lastPage ?? meta.total_pages ?? (meta.total && (meta.per_page ?? perPage.value) ? Math.ceil(meta.total / (meta.per_page ?? perPage.value)) : lastPage.value);
        perPage.value = meta.per_page ?? meta.perPage ?? perPage.value;
        if (meta.current_page && Number(meta.current_page) !== currentPage.value) {
          currentPage.value = Number(meta.current_page);
        }
      } else {
        if (Array.isArray(v) || Array.isArray(v?.data) || Array.isArray(v?.data?.data)) {
          total.value = Array.isArray(v) ? v.length : Array.isArray(v.data) ? v.data.length : Array.isArray(v.data?.data) ? v.data.data.length : 0;
          lastPage.value = 1;
        }
      }
    });
    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };
    const nextPage = () => {
      if (currentPage.value < lastPage.value) currentPage.value++;
    };
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
    const role = useCookie("user_role");
    const link = computed(() => {
      if (role.value === "technician") return "/technician/tickets/";
      if (role.value === "supervisor") return "/supervisor/tickets/";
      if (role.value === "user") return "/user/tickets/";
      return "/";
    });
    watch([
      () => props.filters?.status,
      () => props.filters?.priority,
      () => props.filters?.category_id
    ], () => {
      currentPage.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UTable = _sfc_main$1;
      const _component_UButton = _sfc_main$2;
      const _component_UBadge = _sfc_main$6;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_UTable, {
        data: data.value,
        columns,
        loading: unref(status) === "pending"
      }, {
        "actions-cell": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              size: "xs",
              color: "primary",
              variant: "soft",
              icon: "i-lucide-eye",
              to: `${link.value}${row.original.id}`
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
              createVNode("div", { class: "flex justify-end gap-2" }, [
                createVNode(_component_UButton, {
                  size: "xs",
                  color: "primary",
                  variant: "soft",
                  icon: "i-lucide-eye",
                  to: `${link.value}${row.original.id}`
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
        _: 1
      }, _parent));
      _push(`<div class="mt-4 flex items-center justify-between"><div class="text-sm text-gray-600"> Showing `);
      if (data.value.length) {
        _push(`<span>${ssrInterpolate((currentPage.value - 1) * perPage.value + 1)}-${ssrInterpolate((currentPage.value - 1) * perPage.value + data.value.length)}</span>`);
      } else {
        _push(`<span>0</span>`);
      }
      _push(` of ${ssrInterpolate(total.value)}</div><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "sm",
        variant: "ghost",
        disabled: currentPage.value === 1,
        onClick: prevPage
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Prev`);
          } else {
            return [
              createTextVNode("Prev")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="px-3 text-sm">Page ${ssrInterpolate(currentPage.value)} / ${ssrInterpolate(lastPage.value)}</div>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "sm",
        variant: "ghost",
        disabled: currentPage.value === lastPage.value,
        onClick: nextPage
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Next`);
          } else {
            return [
              createTextVNode("Next")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ticketsTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main, { __name: "TicketsTable" });

export { __nuxt_component_3 as _ };
//# sourceMappingURL=ticketsTable-DiR1u5h5.mjs.map
