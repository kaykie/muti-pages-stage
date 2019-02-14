<template>
  <mu-bottom-sheet :open="open" class="com-bottom" overlay-close @close="clickHandle('close')">
    <mu-button full-width v-for="(item,index) in array" :key="index" :color="item.type"
               @click="clickHandle(item.funName)">{{item.name}}
    </mu-button>
  </mu-bottom-sheet>
</template>

<script>
  export default {
    name: "BottomSheet",
    data() {
      return {}
    },
    props: {
      array: {
        type: Array,
        default() {
          return [
            {name: '编辑', funName: 'edit', type: 'primary'},
            {name: '删除', funName: 'del', type: 'secondary'},
            {name: '关闭', funName: 'close', type: 'primary'},
          ]
        }
      },
      open: {
        type: Boolean,
        default() {
          return false
        }
      }
    },
    methods: {
      close() {
        this.open = false
      },
      clickHandle(funName) {
        this.$emit(funName)
      },
    }
  }
</script>

<style scoped lang="less">
  .com-bottom {
    .mu-button {
      margin: 5px 0;
    }
  }
</style>
