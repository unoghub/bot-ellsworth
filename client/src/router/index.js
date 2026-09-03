import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'
import LoginView from '@/views/Login.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        }
    ],
});

router.beforeEach(async (to, from) => {

    const response = await fetch("/api/user");
    const data = await response.json();

    if (to.name == "home" && data == 401) {
        return { name: "login" };
    }
    if (to.name == "login" && data != 401) {
        return { name: "home" };
    }
});

export default router
