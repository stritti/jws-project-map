<template>
  <footer>
    <b-container>
      <p>
        <strong
          ><a href="https://www.joerg-wolff-stiftung.de/"
            >Jörg Wolff Stiftung</a
          ></strong
        >, Kölner Straße 8, 70376 Stuttgart, Germany
      </p>
      <p>
        Tel. +49 (0) 711/540 04-10,
        <a href="mailto:info@joerg-wolff-stiftung.de"
          >info@joerg-wolff-stiftung.de</a
        >
      </p>
    </b-container>
  </footer>
</template>

<script lang="ts">
export default {
  name: 'SiteFooter',
};
</script>

<style lang="scss" scoped>
footer {
  margin: 0;
  padding: 1rem;
  height: 7rem;
  background-color: #000;
  color: #fff;
  p {
    font-size: 12px;
  }
  a {
    background-color: #000;
    color: #fff;
    text-decoration: none;
  }
}
</style>
