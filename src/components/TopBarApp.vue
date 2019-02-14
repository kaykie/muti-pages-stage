<template>
  <div class="xnw-bar">
    <mu-appbar style="width: 100%;" color="primary">
      <div>
        <i class="el-icon-my-fanhui" @click="jumpBack"></i>
      </div>
      <div>
        {{title}}
      </div>
    </mu-appbar>
  </div>

</template>

<script>
  export default {
    name: "TopBarApp",
    props:{
      title:{
        type:String,
        default(){
          return 'title'
        }
      },
      isCropShow:{
        type:String,
        default(){
          return ''
        }
      }
    },
    methods:{
      jumpBack(){
        if(this.isCropShow === 'show'){
          this.$emit('close');
          console.log(22)
          return
        }
        this.$router.back()
      }
    }
  }
</script>

<style lang="less">
  .xnw-bar{
    .mu-appbar-title{
      /*text-align: center;*/
      line-height: 50px;
      display: flex;
      justify-content: start;
      >div{
        flex: 1;
      }
    }
    .mu-appbar{
      height: 50px;
    }
    [class^="el-icon-my"], [class*="el-icon-my"]{
      font-size: 18px;
    }
  }
</style>
