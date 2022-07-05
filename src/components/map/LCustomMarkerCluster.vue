<script>
// Copied from : https://raw.githubusercontent.com/Donatbov/vue-leaflet-markercluster/master/src/components/LCustomMarkerCluster.vue

// import 'leaflet.markercluster/dist/MarkerCluster.css' // TODO: To make it works (if imported, animations seems works but single markers move weirdly on zoom...)
import { onMounted, ref, inject, nextTick } from 'vue'
import { render } from '@vue-leaflet/vue-leaflet/src/functions/layer'
import { setup as layerGroupSetup } from '@vue-leaflet/vue-leaflet/src/functions/layerGroup'
import { propsBinder, remapEvents } from '@vue-leaflet/vue-leaflet/src/utils'
import { MarkerClusterGroup } from 'leaflet.markercluster'

export default {
  name: 'LCustomMarkerCluster',
  props: {
    options: {
      type: Object,
      default () { return {} }
    }
  },
  emits: ['ready'],
  setup (props, context) {
    const leafletRef = ref({})
    const ready = ref(false)
    const addLayer = inject('addLayer')
    const { methods: layerMethods } = layerGroupSetup(props, leafletRef, context)

    onMounted(async () => {
      const { DomEvent } = await import('leaflet/dist/leaflet-src.esm')
      if (!props.iconCreateFunction) {
        await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
      }
      leafletRef.value = new MarkerClusterGroup(props.options)

      const listeners = remapEvents(context.attrs)
      DomEvent.on(leafletRef.value, listeners)
      propsBinder(layerMethods, leafletRef.value, props)

      addLayer({
        ...props,
        ...layerMethods,
        leafletObject: leafletRef.value
      })
      ready.value = true
      nextTick(() => context.emit('ready', leafletRef.value))
    })

    return { ready, leafletObject: leafletRef, addLayer, context }
  },
  render () {
    return render(this.ready, this.$slots)
  }
}
</script>