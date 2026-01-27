import { A as executeAsync } from '../nitro/nitro.mjs';
import { l as defineNuxtPlugin, b as useCookie, n as navigateTo } from './server.mjs';
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
import 'vue';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'vue/server-renderer';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const auth_client = defineNuxtPlugin(async () => {
  let __temp, __restore;
  const authToken = useCookie("auth_token");
  useCookie("user_role");
  if (!authToken.value) return;
  try {
    ;
    [__temp, __restore] = executeAsync(() => $fetch("http://localhost:8000/api/auth/check", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        Accept: "application/json"
      }
    })), await __temp, __restore();
  } catch (error) {
    useCookie("auth_token", { path: "/" }).value = null;
    useCookie("user_role", { path: "/" }).value = null;
    [__temp, __restore] = executeAsync(() => navigateTo("/login")), await __temp, __restore();
  }
});

export { auth_client as default };
//# sourceMappingURL=auth.client-D7VHPuIF.mjs.map
