<template>

  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <main>
    <router-view />
  </main>
</template>

<style>
body {
  font-family: Roboto, sans-serif;
}
footer > p, footer  a {
  font-size: 12px;
  margin: 0;
  padding: 1rem;
  color: #fff;
  background-color: #000;
  text-decoration: none;
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

