// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "url";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', "@vueuse/nuxt"],
  alias: {
    "@components": "./components",
    "socker": fileURLToPath(new URL("../tmp/socker", import.meta.url)),
  }
})
