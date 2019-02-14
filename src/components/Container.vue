<template>
  <div class="container-ai">
    <div class="xnw-warp">
      <div class="btn-container">
        <el-button type="primary" v-if="addBtn" @click="addHandle" class="con-btn"><i
          class="el-icon-plus"></i>添加
        </el-button>
        <el-button type="primary" v-for="(item,index) in btnArray" class="con-btn" @click="clickHandle(item.handleName)"
                   :key="index"><i :class='item.icon'></i>{{item.title}}
        </el-button>

        <el-button type="primary" slot="reference" :class="delBtn ? 'del-btn con-del-btn' : 'del-btn none-before con-del-btn'"
                   class="con-del-btn" @click="delHandle">
          <i class="el-icon-delete"></i>批量删除
        </el-button>
      </div>
      <div class="my-filter" v-if="isFilterShow">
        <el-form :inline="true" ref="myFilterForm" :model="form">
          <el-form-item v-for="(item,index) in filterData" :key="index" :label="item.label">
            <el-input size="mini" v-if="item.type === 'input'" :placeholder="item.placeholder"
                      v-model="form[item.params]"></el-input>
            <el-select size="mini" v-if="item.type === 'select'"  v-model="form[item.params]"
                       :placeholder='item.placeholder'>
              <el-option v-for="(option,index2) in item.options " :key="index2" :label="option.label"
                         :value="option.value"></el-option>
            </el-select>
            <!--时间-->
            <div v-if="item.type === 'datePicker'" class="contain-date">
              <el-date-picker
                v-model="startTime"
                type="date"
                size="mini"
                :picker-options="pickerOptionsStart"
                placeholder="开始时间">
              </el-date-picker>
              -
              <el-date-picker
                v-model="endTime"
                type="date"
                size="mini"
                :picker-options="pickerOptionsEnd"
                placeholder="结束时间">
              </el-date-picker>
            </div>
          </el-form-item>
          <el-form-item class="filter-button">
            <el-button size="mini" type="primary" @click="onSubmit">查询</el-button>
            <el-button size="mini" @click="reset('myFilterForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-dialog
      title="删除"
      :visible.sync="isDeleteShow"
      width="300"
      custom-class="xnw-confirm"
    >
      <span>是否确认删除?</span>
      <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="delDiaHandle" :loading="isBtnLoading">{{isBtnLoading ? '删除中' :'确 定'}}</el-button>
    <el-button @click="isDeleteShow = false">取 消</el-button>
  </span>
    </el-dialog>
    <slot></slot>
  </div>
</template>


<script>
  Date.prototype.format = function (format) {
    var args = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
      "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format))
      format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var i in args) {
      var n = args[i];
      if (new RegExp("(" + i + ")").test(format))
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
  };
  export default {
    data() {
      let t = this;
      return {
        form: {},
        startTime: '',
        endTime: '',
        pickerOptionsStart: {
          disabledDate(time) {
            if (t.endTime) {
              return time.getTime() > t.endTime;
            } else
              return false
          },
        },
        pickerOptionsEnd: {
          disabledDate(time) {
            if (t.startTime) {
              return time.getTime() < t.startTime;
            } else
              return false
          },
        },
        isDeleteShow:false
      };
    },
    props: {
      addBtn: {
        type: Boolean,
        default: () => {
          return true;
        }
      },
      delBtn: {
        type: Boolean,
        default: () => {
          return true;
        }
      },
      btnArray: {
        type: Array,
        default: () => {
          return [];
        }
      },
      filterData: {
        type: Array,
        require: true,
        default: () => {
          return [
            {
              type: 'input',
              params: 'name',
              label: '姓名',
              placeholder: '姓名'
            },
            {
              type: 'select',
              params: 'age',
              label: '年龄',
              placeholder: '年龄',
              options: [{value: 11, label: 21}, {value: 10, label: 121}]
            },
            {
              type: 'datePicker',
              label: '时间',
              placeholder: '选择时间',
              params: 'selectTime',
            }
          ]
        },
        form: {
          type: Object
        }
      },

      isFilterShow: {
        type: Boolean,
        default: () => {
          return false
        }
      },

      isBtnLoading:{
        type:Boolean,
        default(){
          return false
        }
      },
      selectItems:{
        type:Array,
        default(){
          return []
        }
      }
    },
    watch:{
      isBtnLoading:{
        handler(val){
          if(!val){
            this.isDeleteShow = false
          }
        }
      }
    },
    methods: {
      delDiaHandle(){
        this.$emit("delHandle");
      },
      delHandle() {
        if(this.selectItems.length === 0){
          this.$message.warning('未选择!');
          return
        }
        this.isDeleteShow = true
      },
      addHandle() {
        this.$emit("addHandle");
      },
      clickHandle(name) {
        this.$emit(name)
      },
      onSubmit() {
        let obj = this.filterData.find(item => item.type === 'datePicker');
        if (obj) {
          this.form[obj.params.split('#')[0]] = this.startTime && this.startTime.format('yyyy-MM-dd hh:mm:ss');
          this.form[obj.params.split('#')[1]] = this.endTime && this.endTime.format('yyyy-MM-dd 23:59:59')
        }
        this.$emit('submit', this.form)
      },
      reset() {
        for(let key in this.form){
          this.form[key] = null
        }
        this.startTime = '';
        this.endTime = '';
        this.$emit('submit',this.form)
      },

      disabledStart(time) {
        console.log(time.gettime())
      }
    },

  };
</script>


<style lang="less">
  @import "../myTheme";

  .container-ai {
    .el-dialog__footer{
      text-align: center;
    }
    min-width: 956px;
    padding: 1px 6px;
    height: 100vh;
    /*border-bottom: 1px solid #e9ffee;*/
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    line-height: 35px;
    .xnw-warp {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin: 25px 0 15px 0;

    }
    .btn-container {
      padding-left: 10px;
      .el-button {
        border: none;
        position: relative;
        margin-left: 10px;
        height: 30px;
        min-width: 90px;
        font-size: 16px;
        line-height: 30px;
        padding: 0 16px;
        vertical-align: top;
        i {
          margin-right: 14px;
        }
      }
      .el-button+.el-button{
        margin-left: 8px;
      }
    }
   .el-button{
     margin-right: 10px;
   }
    .con-btn {
      margin: 0 10px;
    }
    .con-del-btn {
      background: linear-gradient(#f58779, #da574e);
      box-shadow: @btnBoxShadowDel;
    }
  }

  .my-filter {
    line-height: 40px;
    padding-left: 15px;
    height: 40px;
    border-radius: 5px;
    margin: 0 5px;
    margin-right: 20px;
    .el-form > .el-form-item {
      height: 35px;
      margin: 0;
      margin-right: 15px;
    }
    .filter-button {
      /*margin-left: 15px;*/
      .el-button{
        margin-left: 0;
      }
      .el-button+.el-button{
        margin-left: 10px;
      }
    }
    .el-form-item--small .el-form-item__content, .el-form-item--small .el-form-item__label {
      line-height: 40px;
    }
    .el-input__inner, .el-date-editor {
      width: 110px;
    }
    .contain-date {
      .el-input__inner {
        width: 110px;
        padding-right: 12px;
      }
    }
  }


  .xnw-confirm{
    width: 320px;
    height: 200px;
    margin-top: 0!important;
    top: 50%;
    transform:translateY(-50%);
    .el-message-box__message p{
      text-align: center;
      color: #6c6d75;
    }
    .el-dialog__header{
      padding-bottom: 15px;
    }
    .el-dialog__body{
      padding: 5px 0 20px 0!important;
      text-align: center;
    }
    .el-message-box__btns{
      text-align: center;
      margin-top: 30px;
    }
    .el-button--default{
      color:#3d4060;
    }
    .el-button--primary{
      background: @btnLinearGradient;
      box-shadow: @btnBoxShadow;
      color: #fff;
    }
    .el-button{
      width: 100px;
      padding: 6px 15px;
      font-size: 16px;
    }
    .el-message-box__message{
      margin-top: 15px;
    }
  }
  .xnw-loading{
    z-index: 4013!important;
  }
</style>
