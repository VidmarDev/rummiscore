// In your boot/i18n.js
import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";

export default boot(({ app }) => {
  const i18n = createI18n({
    legacy: false,
    locale: "sv-SE",
    fallbackLocale: "sv-SE",
    messages,
    missingWarn: false,
    fallbackWarn: false,
    warnHtmlMessage: false,
    silentTranslationWarn: true,
    silentFallbackWarn: true,
    preserveDirectiveContent: true,
    runtimeOnly: false,
  });

  app.use(i18n);
  return i18n;
});
