<template>
  <mu-snackbar :color="color.color" :open.sync="color.open">
    {{color.message}}
  </mu-snackbar>
</template>

<script>
  export default {
    name: "MySsnakbar",
    props: {
      color: {
        type: Object,
        default: () => {
          return {
            color: 'success',
            message: 'Hello World, Snackbar !',
            open: false,
            timeout: 2000
          }
        }
      }
    },
    watch: {
      color: {
        handler(val) {
          console.log(val)
          setTimeout(() => {
            val.open = false
          }, val.timeout)
        },
        deep: true
      }
    },
  }
</script>

<style scoped>

</style>
