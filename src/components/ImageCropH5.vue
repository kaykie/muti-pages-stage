<template>
  <div :style="{width:config.outWidth+'px'}" class="img-crop">
    <div class="hot-area-img"></div>
    <v-touch v-on:panmove="configMousemove" v-on:panstart="configMousedown" v-on:panend="configMouseup">

      <div class="config-img" id="parentNode" :style="{height:config.outHeight+'px'}">
        <!--<div class="config-img">-->
        <img id="myImg"
             v-bind:src="src || defaultImg"
             :style="{width:config.outWidth + 'px',height:config.outHeight+'px'}"
             alt="">
        <div class="img-item">
           <div class="item-warp">
              <span :class="item.select ? 'item action' : 'item'" v-for="(item,index) in divs" :key="index"
                    :style="{width:config.outWidth/config.numx+'px',height:config.outHeight/config.numy+'px'}"
              ></span>
           </div>
        </div>

        <div class="hot-crop-box active"
             :style="{width:endWidth+'px',height:endHeight+'px',left:start.x+'px',top:start.y+'px'}">
          <div class="crop-box-content"></div>
        </div>
      </div>
    </v-touch>
    <div class="image-intro">
      红色方框内为检测区域,鼠标框选画面,标记为检测区域
    </div>

    <div class="dia-handleBtns">
      <div>
        <slot name="checkTime"></slot>
      </div>
      <div>
        <mu-button @click='clearSome'>{{spanStatus ? '启用橡皮擦':'关闭橡皮擦'}}</mu-button>
        <mu-button @click='clearAll'>删除全部</mu-button>
        <mu-button @click='selectAll'>区域全选</mu-button>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <mu-button full-width color="primary" @click="save">保存</mu-button>
    </div>
  </div>

</template>


<script>
  import defaultImg from './timg.jpg'

  export default {
    data() {
      return {
        divs: [],
        filterDivs: [], // 保存状态为false的所有div
        flag: false, // true表示鼠标按下
        // 以下为拖动需要设置的变量
        start: {
          x: 0,
          y: 0,
          startX: 0,
          startY: 0
        }, // 记录开始位置
        endWidth: 0,
        endHeight: 0,
        usearea: {}, // 用来保存图片的相关属性
        spanStatus: true,
        hotDivs: [], // 用来保存热区,已经框选的区域
        hotObj: {}, // 选择了一个区域
        hotId: 0, // 自增id
        clickDiv: {}, // 点击选中了哪个div
        selectSpans: [],

        imgRatio: null,
        // isSelectAll:true, // true 为取消全选 (页面上为全部选中) false反之
        // hotDivFlag: false,
        // hotStart: {}, // 同start 记录刚开始时候的位置
        // uniqueHotDiv: {}, // 用来保存点击了哪个hotdiv
        // originUniqueHotDiv: {}, // 初始化uniqueHotDiv
        // originUniqueHotAxios: {},
        // originStart: {}
        defaultImg: defaultImg
      }
    },
    props: {
      config: {
        type: Object,
        default: () => {
          return {
            numx: 22,
            numy: 18,
            outWidth: '100%', // 不需要配置outHeight,outHheight 会根据outWidth以及图片比例计算出来
            left: '', // 需要截图的图片距离浏览器的offsetLeft距离
            top: '', // 需要截图的图片距离浏览器的offsetTop距离
            // outHeight: 396
          }
        }
      },
      src: {
        type: String,
        default: () => {
          return ''
        }
      },
      data: {
        type: Array,
        default() {
          return [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      },
      disabled: {
        type: Boolean,
        default() {
          return false
        }
      },
      disabledImage: {
        type: Boolean,
        default() {
          return false
        }
      }
    },
    watch: {
      data: {
        handler(value) {
          this.data = value;
          this.genSpan()
        },
        deep: true
      }
    },
    methods: {
      clearAll() {

        this.divs.forEach(item => {
          item.select = false
        });
      },
      clearSome() {
        this.spanStatus = !this.spanStatus
      },
      selectAll() {
        this.divs.forEach(item => {
          item.select = true
        });
      },
      configMouseup() {
        this.flag = false;
        // this.hotDivFlag = false;
        this.endHeight = 0;
        this.endWidth = 0;
      },
      configMousedown(e) {
        if (this.disabledImage) {
          return
        }
        console.log(e);
        let {center} = e;
        this.start = {
          x: center.x - this.usearea.left,
          y: center.y - this.usearea.top,
          startX: center.x,
          startY: center.y
        };
        this.flag = true;
        this.hotObj = {};
        this.selectSpans = [];
        if (this.spanStatus)
          this.filterDivs = this.divs.filter(item => item.select === false);
      },
      configMousemove(target) {
        let {usearea, start, config} = this;
        let e = {
          clientX: target.center.x,
          clientY: target.center.y,
        };
        if (this.flag) {
          if (this.cancelSelect(e)) return;
          let move = {
            x: e.clientX - this.start.startX,
            y: e.clientY - this.start.startY
          }; // 移动的距离
          let rangeAxios = {};
          let spanWidth = config.outWidth / config.numx;
          let spanHeight = config.outHeight / config.numy;
          // 右下移动
          if (move.x > 0 && move.y > 0) {
            let clientX = e.clientX > usearea.left + usearea.width ? usearea.left + usearea.width : e.clientX;
            let clientY = e.clientY > usearea.top + usearea.height ? usearea.top + usearea.height : e.clientY;
            let limit = {
              x: clientX,
              y: clientY
            };

            this.endWidth = limit.x - start.startX;
            this.endHeight = limit.y - start.startY;
            // 根据框选区域的最大x,y,最小x,y来确定哪些是需要选中的span
            rangeAxios = {
              minX: start.x - spanWidth,
              minY: start.y - spanHeight,
              maxX: e.clientX > usearea.left + usearea.width ? usearea.width : e.clientX - this.usearea.left,
              maxY: e.clientY > usearea.top + usearea.height ? usearea.height : e.clientY - this.usearea.top
            };
            this.selectSpan(rangeAxios);
            // left 位置为开始点 减去 开始点的模数 top同理
            let left = start.startX - usearea.left - (start.startX - usearea.left) % spanWidth;
            let top = start.startY - usearea.top - (start.startY - usearea.top) % spanHeight;
            this.hotObj = {
              left,
              top,
              // width: clientX - usearea.left - left - (clientX - usearea.left) % spanWidth + spanWidth,
              // height: clientY - usearea.top - top - (clientY - usearea.top) % spanHeight + spanHeight,
              // rangeAxios
            };
          }
          // 左上
          else if (move.x < 0 && move.y < 0) {
            let clientX = e.clientX < usearea.left ? usearea.left : e.clientX;
            let clientY = e.clientY < usearea.top ? usearea.top : e.clientY
            let limit = {
              x: clientX,
              y: clientY
            };
            // 应该移动距离
            let distance = {
              x: limit.x - start.startX,
              y: limit.y - start.startY
            };
            rangeAxios = {
              maxX: start.startX - usearea.left,
              maxY: start.startY - usearea.top,
              minX: (e.clientX < this.usearea.left ? 0 : e.clientX) - spanWidth - usearea.left,
              minY: (e.clientY < this.usearea.top ? 0 : e.clientY) - spanHeight - usearea.top
            };
            this.endWidth = Math.abs(distance.x);
            this.endHeight = Math.abs(distance.y);
            start.x = e.clientX - usearea.left;
            start.y = e.clientY - usearea.top;
            this.selectSpan(rangeAxios);
            // left与top为结束点 减去结束点的模数
            let left = clientX - usearea.left - (clientX - usearea.left) % spanWidth;
            let top = clientY - usearea.top - (clientY - usearea.top) % spanHeight;
            this.hotObj = {
              left,
              top,
              // width: start.startX - usearea.left - left - (start.startX - usearea.left) % spanWidth + spanWidth,
              // height: start.startY - usearea.top - top - (start.startY - usearea.top) % spanHeight + spanHeight,
              // rangeAxios
            };
          }
          // 右上
          else if (move.x >= 0 && move.y < 0) {
            let clientX = e.clientX > usearea.left + usearea.width ? usearea.left + usearea.width : e.clientX;
            let clientY = e.clientY < usearea.top ? usearea.top : e.clientY
            let limit = {
              x: clientX,
              y: clientY,

            };
            let distance = {
              x: limit.x - start.startX,
              y: limit.y - start.startY
            };
            rangeAxios = {
              minX: start.startX - usearea.left - spanWidth,
              minY: (e.clientY < usearea.top ? 0 : e.clientY) - usearea.top - spanHeight,
              maxX: (e.clientX > usearea.left + usearea.width ? usearea.left + usearea.width : e.clientX) - usearea.left,
              maxY: start.startY - usearea.top
            };
            this.endWidth = distance.x;
            this.endHeight = Math.abs(distance.y);
            start.y = e.clientY - usearea.top > 0 ? e.clientY - usearea.top : 0;
            this.selectSpan(rangeAxios);


            let left = start.startX - usearea.left - (start.startX - usearea.left) % spanWidth;
            let top = clientY - usearea.top - (clientY - usearea.top) % spanHeight;
            this.hotObj = {
              left,
              top,
              // width: clientX - usearea.left + (spanWidth - clientX % spanWidth) - (start.startX - usearea.left - start.startX % spanWidth),
              // height: start.startY - usearea.top + spanHeight - (start.startY - usearea.top) % spanHeight - (e.clientY - usearea.top - (e.clientY - usearea.top) % spanHeight),
              // rangeAxios,
            };
          }
          // 左下
          else if (move.x < 0 && move.y > 0) {
            let clientX = e.clientX < usearea.left ? usearea.left : e.clientX;
            let clientY = e.clientY > usearea.top + usearea.height ? usearea.top + usearea.height : e.clientY;
            let limit = {
              x: clientX,
              y: clientY
            };
            // 应该移动距离
            let distance = {
              x: limit.x - start.startX,
              y: limit.y - start.startY
            };
            rangeAxios = {
              minX: (e.clientX < usearea.left ? 0 : e.clientX) - usearea.left - spanWidth,
              minY: start.startY - spanHeight - usearea.top,
              maxX: start.startX - this.usearea.left,
              maxY: (e.clientY > usearea.top + usearea.height ? usearea.height + usearea.top : e.clientY) - usearea.top
            };
            this.endWidth = Math.abs(distance.x);
            this.endHeight = Math.abs(distance.y);
            start.x = e.clientX - usearea.left > 0 ? e.clientX - usearea.left : 0;
            this.selectSpan(rangeAxios);

            let left = clientX - usearea.left - (clientX - usearea.left) % spanWidth;
            let top = start.startY - usearea.top - (start.startY - usearea.top) % spanHeight;
            this.hotObj = {
              left,
              top,
              // width: clientX - usearea.left + (spanWidth - clientX % spanWidth) - (start.startX - usearea.left - start.startX % spanWidth),
              // height: (e.clientY - usearea.top + spanHeight - (e.clientY - usearea.top) % spanHeight) - (start.startY - usearea.top - (start.startY - usearea.top) % spanHeight),
              // rangeAxios
            };
          }

        }

      },
      // 根据最大坐标和最小坐标来标记哪些span是需要选择的.
      selectSpan(rangeAxios) {
        // 获取未被选中的filterDivs
        let filterDivs = [];
        if (this.spanStatus)
          filterDivs = this.filterDivs;
        else
          filterDivs = this.divs;
        // 此循环为页面上需要被选择的span
        for (let i = 0, j = filterDivs.length; i < j; i++) {
          if (filterDivs[i].x > rangeAxios.minX && filterDivs[i].x <= rangeAxios.maxX && filterDivs[i].y > rangeAxios.minY && filterDivs[i].y <= rangeAxios.maxY) {
            filterDivs[i].select = this.spanStatus;
          } else {
            if (this.spanStatus) {
              filterDivs[i].select = !this.spanStatus;
            }
          }
        }
      },

      genSpan() {
        let {config} = this;
        let numx = config.numx;
        let numy = config.numy;
        let outWidth = config.outWidth;
        let outHeight = config.outHeight;
        let spanWidth = outWidth / numx;
        let spanHeiht = outHeight / numy;
        this.divs = [];
        let array = this.data ? this.data : [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let myArray = [];
        array.forEach(item => {
          let str = (item * 1).toString(2);
          let childArray = str.split('');
          while (childArray.length < numx) {
            childArray.unshift('0')
          }
          myArray.push(childArray)
        });
        for (let i = 0; i < myArray.length; i++) {
          for (let j = 0; j < myArray[i].length; j++) {
            this.divs.push({
              id: i * numx + j,
              x: j * spanWidth,
              y: i * spanHeiht,
              select: myArray[i][j] === '1'
            })
          }
        }
      },

      // 每次mousemove前都需要调用此函数,用来判断是否移出范围
      cancelSelect(e) {
        let {usearea} = this;
        if (e.clientX >= usearea.left + usearea.width - 2 || e.clientY <= usearea.top) {
          this.endHeight = 0;
          this.endWidth = 0;
          this.flag = false;
          return true
        }
        if (e.clientX <= usearea.left + 10 || e.clientY + 5 >= usearea.top + usearea.height) {
          this.endHeight = 0;
          this.endWidth = 0;
          this.flag = false;
          return true
        }
      },


      // 当页面滚动的时候 需要重置框选区域距离顶部距离
      scrollHandle(e) {
        let parentNode = document.getElementById('parentNode');
        this.usearea.top = parentNode.offsetTop - e.target.scrollTop;
      },

      // 当页面距离顶部距离变化的时候 需要重置top距离
      initFromTop() {
        let parentNode = document.getElementById('parentNode');
        this.usearea.top = parentNode.offsetTop
      },
      returnData() {
        // let spans = this.hotDivs.reduce((total, current) => {
        //   let array = total.selectSpan ? total.selectSpan : total;
        //   return [...current.selectSpan, ...array]
        // });
        let spans = this.divs.filter(item => item.select === true);
        let numx = this.config.numx;
        let numy = this.config.numy;
        let selectIds = spans.map(item => item.id);
        let myArray = [];
        for (let i = 0; i < numy; i++) {
          let myString = '';
          for (let j = 0; j < numx; j++) {
            if (selectIds.includes(j + numx * i)) {
              myString = myString + '1'
            } else {
              myString = myString + '0'
            }
          }
          myArray.push(parseInt(('0000000000' + myString), 2))
        }
        return myArray
      },

      // 首屏加载渲染图片
      renderImage(imgs, parentNode, parentNode2) {
        let t = this;
        t.imgRatio = imgs.height / imgs.width;
        let screenWidth = document.body.clientWidth, screenHeight = screenWidth * imgs.height / imgs.width;

        t.usearea = {
          left: parentNode2.offsetLeft,
          top: parentNode.offsetTop,
          width: screenWidth,
          height: screenHeight
        };
        t.config.outWidth = parentNode.clientWidth;
        t.config.outHeight = parentNode.clientWidth * t.imgRatio || 396;
        console.log(t.config)
        t.genSpan();
        let parentNode3 = parentNode2.parentNode;
        // let parentNode3 = document.getElementsByClassName('el-dialog__wrapper')[0];
        parentNode3.addEventListener('scroll', t.scrollHandle)
      },

      init() {
        this.spanStatus = true
      },
      save(){
        this.$emit('save')
      }
    },
    mounted() {
      this.$nextTick(() => {
        let parentNode2 = document.getElementsByClassName('img-crop')[0];
        let parentNode = document.getElementById('parentNode');
        this.spanStatus = true;
        let t = this;
        let imgs = document.getElementById('myImg');
        if (imgs.complete) {
          t.renderImage(imgs, parentNode, parentNode2);
          this.spanStatus = true;
        } else {
          document.getElementById('myImg').onload = function () {
            t.renderImage(this, parentNode, parentNode2);
            t.spanStatus = true;
          };
        }
      });
    }
  }
</script>


<style lang="less">
  @import "../myTheme";

  .img-crop {
    .dia-handleBtns {
      /*text-align: right;*/
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .image-intro {
      margin: 10px 0 20px;
      color: #acacac;
    }
    .crop-select {
      // background-color: @activeBcg;
      position: absolute;
      z-index: 66;
      user-select: none;
      cursor: all-scroll;
    }

    .crop-select.active {
      border: 1px solid #ffff00;
    }

    .config-img {
      position: relative;
      .img-item {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        .item-warp {
          display: flex;
          flex-wrap: wrap;
          span.item {
            // display: inline-block;
            // margin-bottom: -4px;
            background-color: rgba(0, 0, 0, 0);
            -webkit-touch-callout: none; /* iOS Safari */

            -webkit-user-select: none; /* Chrome/Safari/Opera */

            -khtml-user-select: none; /* Konqueror */

            -moz-user-select: none; /* Firefox */

            -ms-user-select: none; /* Internet Explorer/Edge */

            user-select: none;
            /* Non-prefixed version, currently

           not supported by any browser */
          }
          span.item.action {
            background-color: @activeBcg;
            border: @cropBorder;
          }
        }

      }
      .hot-crop-box {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 2;
        box-sizing: border-box;
        /*direction: ltr;*/
        /*font-size: 0;*/
        /*line-height: 0;*/
        /*touch-action: none;*/
        /*user-select: none;*/
        /*.crop-box-content {*/
        /*width: 100%;*/
        /*height: 100%;*/
        /*background-color: #2aa7ff;*/
        /*opacity: .3;*/
        /*cursor: move;*/
        /*}*/
        .crop-box-content {
          width: 100%;
          height: 100%;
          background-color: #2aa7ff;
          /*background-color: rgba(0, 0, 0, 0);*/
          opacity: .3;
        }
      }
    }

    .config .el-dialog__body {
      padding: 0 20px;
    }

  }

  #myImg {
    height: 396px;
  }

</style>
