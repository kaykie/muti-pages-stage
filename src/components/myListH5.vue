<template>
  <mu-list-item button :ripple="false" @click="isFaceCatch = !isFaceCatch">
    <mu-list-item-title>
      人脸抓拍
    </mu-list-item-title>
    <mu-list-item-action>
      <mu-switch v-model="isFaceCatch" readonly></mu-switch>
    </mu-list-item-action>
  </mu-list-item>
</template>

<script>
  export default {
    name: "myListH5",
    props:{
      items:[
        {
          title:'人脸',
          rightType:'switch',
          
        }
      ]
    }
  }
</script>

<style scoped>

</style>
