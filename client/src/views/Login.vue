<script setup>
import { Discord, SignOut } from "@primeicons/vue";
</script>
<template>
    <main>
        <h1>Hayda... önce giriş yapman gerekiyor.</h1>
        <p>Discord hesabının gerekli yetkili rollerine sahip olduğuna emin olmalısın.</p>
        <a href="api/auth/login" class="login">
            <Discord />Login with Discord
        </a>
        <a href="api/auth/logout" class="logout">
            <SignOut />Logout
        </a>
    </main>
</template>
<style scoped>
a {
    text-decoration: none;

    padding: 1rem;

    display: flex;
    justify-content: space-around;
    align-items: center;
}

a.login {
    width: 13rem;

    color: var(--light);
    background-color: var(--dark);
}

a.logout {
    width: 8rem;

    color: var(--light);
    background-color: var(--danger);
}
</style>