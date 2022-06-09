<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>

<style>
body {
  font-family: Roboto, sans-serif;
}
h1 {
  color: rgb(61, 94, 158);
  font-size: 48px;
  font-weight: 300;
}
p {
  font-size: 16px;
  font-weight: 300;
}
</style>

