// https://vitepress.dev/guide/custom-theme
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import LabList from "./components/LabList.vue";
import HomeExitDetector from "./components/HomeExitDetector.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => h(HomeExitDetector)
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...
    app.component("LabList", LabList);
  },
} satisfies Theme;
