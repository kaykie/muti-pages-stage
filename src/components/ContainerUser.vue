<template>
  <div class="vip-container">
    <div class="vip-user__btn vip-btn">
      <el-button 
        v-for="(item,index) in btnArray" 
        :type="item.type"
        :class="item.class"
        @click="clickHandle(item.handleName)" 
        :key="index"
      ><i :class='item.icon'></i>{{item.title}}</el-button>
    </div>
    <slot></slot>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isVisible: false
    };
  },
  props: {
    btnArray: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  methods: {
    clickHandle(handleName) {
      this.$emit(handleName);
    }
  }
};
</script>


<style lang="less">
@import "../myTheme";
.vip-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafcff;
}
.vip-btn {
  padding: 26px 24px 20px;
  .el-button {
    margin: 0 2px;
  }
}
</style>
