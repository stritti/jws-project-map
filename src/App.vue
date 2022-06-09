<template>
  <main>
    <router-view />
  </main>
</template>

<style lang="scss">
body {
  font-family: Roboto, sans-serif;
}
h1 {
  color: rgb(61, 94, 158);
  font-size: 48px;
  font-weight: 300;

  @media screen and (max-width: 768px) {
    font-size: 24px;
  }

}
p {
  font-size: 16px;
  font-weight: 300;

  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
}
</style>

