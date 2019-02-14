<template>
  <div class="vip-table__wrap">
    <div class="vip-table__inner custom-table">
      <el-table
        v-bind="$attrs"
        :stripe = "stripe"
        @selection-change="handleSelectionChange"
        height="100%"
      >
        <el-table-column
          fixed
          v-if="isSelection"
          type="selection"
          width="48"/>
        <el-table-column
          v-if="isIndex"
          type="index"
          label="序号"
          :index="tableIndex"
          width="90"
        />

        <el-table-column
          v-for="(item,index) in column"
          :key="index"
          :prop='item.props'
          :label='item.label'
          :width='item.width'>
        </el-table-column>
        <el-table-column
          v-if="handleobj.label"
          :label='handleobj.label'
        >
          <template slot-scope="scope">
            <span v-for="(item,index) in handleobj.btns" :key="index" >
              <el-button
                v-if="item.type"
                :class="item.class"
                @click="clickHandle(item.handleName,scope.row)"
                type="text" size="small">{{item.label}}
              </el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      v-if="$attrs.pagination"
      @current-change="$attrs.pagination.handleCurrentChange"
      v-bind="$attrs.pagination"
      :layout="$attrs.pagination.layout || layout"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      layout: "prev, pager, next, total ,jumper",
      isDeleteObj: {}
    };
  },
  props: {
    // table的 column数据
    column: {
      require: true,
      type: Array
    },
    // 每页显示多少条
    pageSize: {
      type: Number,
      default: () => {
        return 10;
      }
    },
    // 页码
    currentPage: {
      type: Number,
      default: () => {
        return 1;
      }
    },
    // 是否显示斑马行
    stripe: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    // 是否需要展示序列号
    isIndex: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    // 是否需要展示多选
    isSelection: {
      type: Boolean,
      default: () => {
        return true;
      }
    },
    // 最后一列是否有 操作展示
    handleobj: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  methods: {
    // index值
    tableIndex(index) {
      return index + 1 + (this.currentPage - 1) * this.pageSize;
    },
    handleSelectionChange(items) {
      this.$emit("selection-change", items);
    },
    handleSizeChange(data) {
      console.log(data);
    },
    handleCurrentChange(item) {
      console.log(item);
    },
    clickHandle(handleName, data) {
      this.$emit(handleName, data);
    },
    confirmPage() {
      this.$emit("confirmPage");
    }
  }
};
</script>

<style lang="less">
@import "../myTheme";
.vip-table__wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  .el-pagination {
    margin: 30px 0 40px;
    text-align: center;
    box-shadow: 0 0 20px #eee;
    padding: 30px;
    font-weight: 400;
    button {
      background: none;
    }
    .el-pager {
      li {
        background: none;
        border-radius: 4px;
        min-width: 33px;
      }
      li.active {
        background: @btnLinearGradient;
        color: #fff;
      }
    }
  }
  .el-button {
    text-decoration: underline;
    margin-right: 10px;
  }
  .el-button:first-child {
    padding-left: 0;
  }
}
.vip-table__inner {
  flex: 1;
  height: 100%;
  padding: 0 26px 0;
  .el-table {
    height: 100%;
    background-color: #fafcff;
    box-shadow: 0 0 20px 1px rgba(138, 174, 254, 0.1);
  }
  .rc-btn--delete {
    color: red;
  }
}
</style>
