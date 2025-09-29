// next-i18next.config.js
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
