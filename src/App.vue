<template>
  <div id="app">
    <RenderView/>
  </div>
</template>

<script>
import RenderView from './pages/RenderView'
export default {
  name: 'app',
  components: {
    RenderView
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}
</style>
