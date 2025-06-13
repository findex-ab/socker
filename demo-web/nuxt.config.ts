// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "url";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxtjs/tailwindcss'],
  alias: {
    "@components": "./components",
    "~shared": fileURLToPath(new URL("../shared", import.meta.url)),
    "#/shared": fileURLToPath(new URL("../shared/src", import.meta.url)),
    "~client": fileURLToPath(new URL("../client", import.meta.url))
  }
})
