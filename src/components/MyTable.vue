<template>
  <div>
    <div class="my-table">
      <div class="custom-table">
        <el-table
          ref="multipleTable"
          v-bind="$attrs"
          @selection-change="handleSelectionChange"
          @select-all="selectAll"
          @select="selectItem"
          height="100%"
          :header-row-style='headerRowStyle'
          stripe
        >
          <el-table-column
            fixed
            v-if="isSelection"
            type="selection"
            width="48"/>
          <el-table-column
            v-if="isIndex"
            type="index"
            :index="indexMethod"
            label="序号"
            width="90"
          />

          <el-table-column
            v-for="(item,index) in column"
            v-if="!item.slot"
            :key="index"
            :prop='item.props'
            :label='item.label'
            :width='item.width'>

          </el-table-column>
          <el-table-column
            v-else-if="item.slot"
            :key="index"
            :props="item.props"
            :label="item.label"
            :width="item.width"
          >
            <template slot-scope="scope">
              <slot :row="scope.row" :name="item.slot"></slot>
            </template>
          </el-table-column>

          <el-table-column
            v-if="handleobj.label"
            :label='handleobj.label'
          >
            <template slot-scope="scope">
          <span v-for="(item,index) in handleobj.btns" :key="index" class="table-btn">
              <el-button
                v-if="item.type === 'normal'"
                @click="clickHandle(item.handleName,scope.row)"
                :icon="item.icon"
                type="text" size="small">{{item.label}}
              </el-button>

              <el-button v-if="item.type === 'delete'" slot="reference" :icon="item.icon"
                         class="del-btn"
                         type="text" size="small" @click="deleteHandle(item.handleName,scope.row,scope.row.id)"
                         title="删除">{{item.label}}
              </el-button>
          </span>
              <slot :row="scope.row" name="switch2"></slot>
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

  </div>
</template>

<script>
export default {
  data() {
    return {
      layout: "prev, pager, next, total ,jumper",
      isDeleteObj: {},
      isSwitchObj: {},
      headerRowStyle: {
        height: "60px"
      },
      isDeleteShow: false,
      delObj: {} // 用来保存需要删除哪组数组
    };
  },
  props: {
    // table的 column数据
    column: {
      require: true,
      type: Array
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
    },
    isBtnLoading: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  watch: {
    isBtnLoading: {
      handler(val) {
        if (!val) {
          this.isDeleteShow = false;
        }
      }
    }
  },
  methods: {
    deleteHandle(name, row, id) {
      this.delObj = { name, row, id };
      this.isDeleteShow = true;
    },
    delDiaHandle() {
      let { name, row, id } = this.delObj;
      this.clickHandle(name, row, id);
    },
    indexMethod(index) {
      return (this.$attrs.pagination.currentPage - 1) * 10 + index + 1;
    },

    handleSelectionChange(items) {
      this.$emit("selection-change", items);
    },
    selectAll(items) {
      this.$emit("select-all", items);
    },
    selectItem(items, item) {
      this.$emit("select-change", items, item, this.$refs.multipleTable);
    },
    handleSizeChange(data) {
      console.log(data);
    },
    handleCurrentChange(item) {
      console.log(item);
    },

    clickHandle(handleName, data, id) {
      if (id === "switch") {
        this.$emit(handleName, data, this.isSwitchObj);
      } else this.$emit(handleName, data);
    }
  },
  created() {
    this.$nextTick(() => {
      this.$emit("init", this.$refs.multipleTable);
    });
  }
};
</script>

<style lang="less">
@import "../myTheme";

.my-table {
  box-shadow: none !important;
  position: relative;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  .el-pagination{
    font-weight: normal;
  }
  .el-table {
    background: @background;
    box-shadow: 0 0 20px 1px rgba(138, 174, 254, 0.1);
    &:before {
      display: none;
    }
    .el-table__fixed-right::before,
    .el-table__fixed::before {
      display: none;
    }
  }
  .custom-table {
    padding: 0 20px;
    height: calc(~'100vh - 230px');
    .del-btn {
      color: red !important;
      span {
        color: red !important;
      }
    }
  }
  .el-pagination {
    margin-top: 30px;
    text-align: center;
    box-shadow: 0 0 20px #eee;
    padding: 30px;
    width: 100%;
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
    padding-left: 0;
    text-decoration: underline;
  }
  .el-button:first-child {
    padding-left: 0;
  }
  .custom-table{
    .el-button{
      margin-left: 0;
      margin-right: 10px;
    }
  }
  .el-button i {
    font-size: 12px;
    margin: 0 5px;
  }
}
</style>
