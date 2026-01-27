import { defineComponent, withAsyncContext, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { b as useCookie, n as navigateTo } from './server.mjs';
import { u as useToast } from './useToast-CPJFKRUV.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "logout",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const authToken = useCookie("auth_token");
    const toast = useToast();
    const user_role = useCookie("user_role");
    authToken.value = null;
    user_role.value = null;
    toast.add({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    [__temp, __restore] = withAsyncContext(() => navigateTo("/login")), await __temp, __restore();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center h-screen" }, _attrs))}><p class="text-gray-500">Logging out...</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=logout-CkIkYetq.mjs.map
