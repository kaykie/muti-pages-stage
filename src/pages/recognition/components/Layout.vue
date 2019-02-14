<template>
  <el-container class="my-container">
    <el-aside class="my-aside">
      <el-header style="height:80px;">
        <i class="vip-logo"></i>
        <span>test</span>
      </el-header>
      <el-menu
        :default-active="defaultMenu"
      >
        <el-menu-item
          :class="item.isActive ? 'is-active' :''"
          v-for="(item,key) in menuData"
          :key="key"
          :index="item.url"
          @click="menuClick"
        ><i :class=item.icon></i>{{item.title}}</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="my-main" style="padding: 0; overflow-y: hidden">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    const menuItems = [
      {
        title: "管理",
        key: "1",
        icon: "",
        url: "/home/userManage",
        isActive: false
      }

    ];
    return {
      menuData: menuItems,
      defaultMenu:'/home/userManage'
    };
  },
  methods: {

  },
  created(){

  }
};
</script>

<style lang="less">

</style>
