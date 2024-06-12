import { createRouter, createWebHistory } from "vue-router";
import TimePage from "../views/TimePage.vue";
import LocationPage from "../views/LocationPage.vue";
import RsvpPage from "../views/RsvpPage.vue";
import CountingPage from "../views/CountingPage.vue";

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
    {
        path: "/rsvp",
        name: "Rsvp",
        component: RsvpPage,
    },
    {
        path: "/counting",
        name: "Counting",
        component: CountingPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
