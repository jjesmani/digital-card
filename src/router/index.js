import { createRouter, createWebHistory } from "vue-router";
import TimePage from "../views/TimePage.vue";
import LocationPage from "../views/LocationPage.vue";

const routes = [
  {
    path: "/time",
    name: "Time",
    component: TimePage,
  },
  {
    path: "/location",
    name: "Location",
    component: LocationPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
