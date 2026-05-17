<template>
  <footer role="contentinfo">
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
import { defineComponent } from "vue";

export default defineComponent({
  name: "SiteFooter",
});
</script>

<style lang="scss" scoped>
@use "@/assets/design-tokens.scss" as *;

footer {
  margin: 0;
  padding: var(--spacing-gutter-md) var(--spacing-gutter-md)
    calc(72px + env(safe-area-inset-bottom, 0px));
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-outline-variant);
  
  p {
    margin: 0;
    font-size: var(--font-size-label-sm);
    color: var(--color-on-surface-variant);
    
    strong {
      font-weight: var(--font-weight-label-md);
      color: var(--color-on-surface);
      
      a {
        color: var(--color-on-surface);
        text-decoration: none;
        
        &:hover,
        &:focus {
          color: var(--color-primary);
          text-decoration: underline;
        }
      }
    }
    
    a {
      color: var(--color-on-surface-variant);
      text-decoration: none;
      
      &:hover,
      &:focus {
        color: var(--color-primary);
        text-decoration: underline;
      }
    }
  }
  
  p + p {
    margin-top: var(--spacing-unit);
  }
}
</style>
