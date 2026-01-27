import { _ as _sfc_main$e, a as __nuxt_component_1, b as __nuxt_component_2 } from './navbar-DByaTdfk.mjs';
import { _ as _sfc_main$1 } from './Input-u_sFkXpR.mjs';
import { _ as _sfc_main$2 } from './Select-Dv6KDMrI.mjs';
import { b as _sfc_main$3 } from './usePortal-BKdXuyUd.mjs';
import { defineComponent, reactive, ref, resolveComponent, withCtx, createVNode, createTextVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { e as useRouter, b as useCookie } from './server.mjs';
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

const createUser = async ({ username, email, password, role, department }) => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const allowedRoles = ["user", "technician", "supervisor", "admin"];
  if (role && !allowedRoles.includes(role)) {
    throw new Error("Invalid role. Allowed roles: user, technician, supervisor, admin");
  }
  const response = await fetch("http://localhost:8000/api/users", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify({
      username,
      email,
      password,
      role,
      department
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  setup(__props) {
    const form = reactive({
      username: "",
      email: "",
      password: "",
      role: "",
      department: ""
    });
    const roles = ref(["user", "technician", "supervisor", "admin"]);
    const isSubmitting = ref(false);
    const router = useRouter();
    const handleCreate = async () => {
      if (isSubmitting.value)
        return;
      isSubmitting.value = true;
      try {
        await createUser({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role || void 0,
          department: form.department || void 0
        });
        await router.push("/admin/users");
      } catch (error) {
        console.error("Failed to create user", error);
      } finally {
        isSubmitting.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UDashboardGroup = _sfc_main$e;
      const _component_Sidebar = __nuxt_component_1;
      const _component_UDashboardPage = resolveComponent("UDashboardPage");
      const _component_Navbar = __nuxt_component_2;
      const _component_UFormGroup = resolveComponent("UFormGroup");
      const _component_UInput = _sfc_main$1;
      const _component_USelect = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      _push(ssrRenderComponent(_component_UDashboardGroup, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Sidebar, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UDashboardPage, { class: "flex flex-col flex-1 min-w-0 overflow-hidden" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_Navbar, {
                    title: "Create user",
                    icon: "i-lucide-user-plus",
                    class: "w-full"
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="flex flex-col flex-1 gap-6 p-6 overflow-auto"${_scopeId2}><form class="flex flex-col gap-4 max-w-3xl w-full"${_scopeId2}><div class="grid grid-cols-1 gap-4 sm:grid-cols-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Username",
                    name: "username"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: form.username,
                          "onUpdate:modelValue": ($event) => form.username = $event,
                          placeholder: "jane.doe",
                          required: "",
                          maxlength: "255"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: form.username,
                            "onUpdate:modelValue": ($event) => form.username = $event,
                            placeholder: "jane.doe",
                            required: "",
                            maxlength: "255"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Email",
                    name: "email"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: form.email,
                          "onUpdate:modelValue": ($event) => form.email = $event,
                          type: "email",
                          placeholder: "jane@example.com",
                          required: "",
                          maxlength: "255"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: form.email,
                            "onUpdate:modelValue": ($event) => form.email = $event,
                            type: "email",
                            placeholder: "jane@example.com",
                            required: "",
                            maxlength: "255"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Password",
                    name: "password"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: form.password,
                          "onUpdate:modelValue": ($event) => form.password = $event,
                          type: "password",
                          placeholder: "min 8 characters",
                          required: "",
                          minlength: "8"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: form.password,
                            "onUpdate:modelValue": ($event) => form.password = $event,
                            type: "password",
                            placeholder: "min 8 characters",
                            required: "",
                            minlength: "8"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Role (optional)",
                    name: "role"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: form.role,
                          "onUpdate:modelValue": ($event) => form.role = $event,
                          items: roles.value,
                          placeholder: "Select role"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: form.role,
                            "onUpdate:modelValue": ($event) => form.role = $event,
                            items: roles.value,
                            placeholder: "Select role"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormGroup, {
                    label: "Department (optional)",
                    name: "department"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: form.department,
                          "onUpdate:modelValue": ($event) => form.department = $event,
                          placeholder: "IT Support",
                          maxlength: "255"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: form.department,
                            "onUpdate:modelValue": ($event) => form.department = $event,
                            placeholder: "IT Support",
                            maxlength: "255"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="flex justify-end gap-3 pt-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UButton, {
                    color: "neutral",
                    variant: "ghost",
                    to: "/admin/users"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Cancel`);
                      } else {
                        return [
                          createTextVNode("Cancel")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UButton, {
                    loading: isSubmitting.value,
                    disabled: isSubmitting.value,
                    type: "submit",
                    color: "primary",
                    icon: "i-lucide-check"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Create`);
                      } else {
                        return [
                          createTextVNode("Create")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></form></div>`);
                } else {
                  return [
                    createVNode(_component_Navbar, {
                      title: "Create user",
                      icon: "i-lucide-user-plus",
                      class: "w-full"
                    }),
                    createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                      createVNode("form", {
                        class: "flex flex-col gap-4 max-w-3xl w-full",
                        onSubmit: withModifiers(handleCreate, ["prevent"])
                      }, [
                        createVNode("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2" }, [
                          createVNode(_component_UFormGroup, {
                            label: "Username",
                            name: "username"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: form.username,
                                "onUpdate:modelValue": ($event) => form.username = $event,
                                placeholder: "jane.doe",
                                required: "",
                                maxlength: "255"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UFormGroup, {
                            label: "Email",
                            name: "email"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_UInput, {
                                modelValue: form.email,
                                "onUpdate:modelValue": ($event) => form.email = $event,
                                type: "email",
                                placeholder: "jane@example.com",
                                required: "",
                                maxlength: "255"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        createVNode(_component_UFormGroup, {
                          label: "Password",
                          name: "password"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: form.password,
                              "onUpdate:modelValue": ($event) => form.password = $event,
                              type: "password",
                              placeholder: "min 8 characters",
                              required: "",
                              minlength: "8"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormGroup, {
                          label: "Role (optional)",
                          name: "role"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: form.role,
                              "onUpdate:modelValue": ($event) => form.role = $event,
                              items: roles.value,
                              placeholder: "Select role"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormGroup, {
                          label: "Department (optional)",
                          name: "department"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: form.department,
                              "onUpdate:modelValue": ($event) => form.department = $event,
                              placeholder: "IT Support",
                              maxlength: "255"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "flex justify-end gap-3 pt-2" }, [
                          createVNode(_component_UButton, {
                            color: "neutral",
                            variant: "ghost",
                            to: "/admin/users"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_UButton, {
                            loading: isSubmitting.value,
                            disabled: isSubmitting.value,
                            type: "submit",
                            color: "primary",
                            icon: "i-lucide-check"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Create")
                            ]),
                            _: 1
                          }, 8, ["loading", "disabled"])
                        ])
                      ], 32)
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
                    title: "Create user",
                    icon: "i-lucide-user-plus",
                    class: "w-full"
                  }),
                  createVNode("div", { class: "flex flex-col flex-1 gap-6 p-6 overflow-auto" }, [
                    createVNode("form", {
                      class: "flex flex-col gap-4 max-w-3xl w-full",
                      onSubmit: withModifiers(handleCreate, ["prevent"])
                    }, [
                      createVNode("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2" }, [
                        createVNode(_component_UFormGroup, {
                          label: "Username",
                          name: "username"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: form.username,
                              "onUpdate:modelValue": ($event) => form.username = $event,
                              placeholder: "jane.doe",
                              required: "",
                              maxlength: "255"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormGroup, {
                          label: "Email",
                          name: "email"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: form.email,
                              "onUpdate:modelValue": ($event) => form.email = $event,
                              type: "email",
                              placeholder: "jane@example.com",
                              required: "",
                              maxlength: "255"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormGroup, {
                        label: "Password",
                        name: "password"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: form.password,
                            "onUpdate:modelValue": ($event) => form.password = $event,
                            type: "password",
                            placeholder: "min 8 characters",
                            required: "",
                            minlength: "8"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormGroup, {
                        label: "Role (optional)",
                        name: "role"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: form.role,
                            "onUpdate:modelValue": ($event) => form.role = $event,
                            items: roles.value,
                            placeholder: "Select role"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormGroup, {
                        label: "Department (optional)",
                        name: "department"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: form.department,
                            "onUpdate:modelValue": ($event) => form.department = $event,
                            placeholder: "IT Support",
                            maxlength: "255"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "flex justify-end gap-3 pt-2" }, [
                        createVNode(_component_UButton, {
                          color: "neutral",
                          variant: "ghost",
                          to: "/admin/users"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UButton, {
                          loading: isSubmitting.value,
                          disabled: isSubmitting.value,
                          type: "submit",
                          color: "primary",
                          icon: "i-lucide-check"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Create")
                          ]),
                          _: 1
                        }, 8, ["loading", "disabled"])
                      ])
                    ], 32)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-5uFG1o2C.mjs.map
