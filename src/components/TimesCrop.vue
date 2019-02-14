<template>
  <div :style="{width:config.outWidth+49+'px'}" class="time-crop">
    <div class="time-intro">
      <span>时间计划:</span>
      <span style="color: #acacac;">{{timesIntro}}</span>
    </div>

    <div class="config-axis">
      <span v-for="(item, index) in axisTime" :key="index">{{item.time}}</span>
    </div>
    <div class="config-axis-y" id="parentNode-time">
      <div class="item-y">
        <div>周一</div>
        <div>周二</div>
        <div>周三</div>
        <div>周四</div>
        <div>周五</div>
        <div>周六</div>
        <div>周日</div>
      </div>
      <div class="item-x">
        <div class="config-img" @mousemove="configMousemove" @mousedown="configMousedown"
             @mouseup="configMouseup">
          <div class="img-item">
            <span :class="item.select ? 'item action' : 'item'"
                  v-bind:style="{background: item.select ? item.color :'',width:config.outWidth/config.numx+'px',height:config.outHeight/config.numy+'px'}"
                  v-for="(item,index) in divs" :key="index"

            ></span>
          </div>

          <div class="hot-crop-box active"
               :style="{width:endWidth+'px',height:endHeight+'px',left:start.x+'px',top:start.y+'px'}">
            <div class="crop-box-content"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="dia-handleBtns" v-if="!disabled">
      <el-button @click='clearSome'>{{spanStatus ? '启用橡皮擦':'关闭橡皮擦'}}</el-button>
      <el-button @click='clearAll'>删除全部</el-button>
      <el-button @click='selectAll'>区域全选</el-button>
    </div>
  </div>
</template>


<script>
  import PublicService from '../service/PublicService'
  import staticData from '../pages/offpost/store/staticData'

  export default {
    data() {
      return {
        axisTime: [], // 保存横坐标
        divs: [], // 页面中所有的小格子,为config.numx*config.numy个
        filterDivs: [], // 保存状态为false的所有div
        flag: false, // true表示鼠标按下

        // 以下为拖动需要设置的变量
        start: {
          x: 0,
          y: 0,
          startX: 0,
          startY: 0
        }, // 记录开始位置
        endWidth: 0, // 用来记录鼠标移动时候后面div宽
        endHeight: 0, // 用来记录鼠标移动时候后面div高
        usearea: {}, // 用来保存图片的相关属性
        spanStatus: true, // 点击橡皮擦切换相应功能
        hotObj: {}, // 选择了一个区域
        hotId: 0, // 自增id
        selectSpans: [], // 选中的spans
        scrollTop: '',// 滑动的距离
        predefineColors: staticData.predefineColors
      }
    },
    props: {
      config: {
        type: Object,
        default: () => {
          return {
            numx: 48,
            numy: 7,
            outWidth: 656,
            outHeight: 273
          }
        }
      },
      // 需要让选中的背景颜色变成什么颜色,如果是一般的,必须传此值
      color: {
        type: String,
        default: () => {
          return ''
        }
      },
      // 文字说明
      timesIntro: {
        type: String,
        default() {
          return '鼠标点击检测模板对应色块后,框选时间选择执行时间段'
        }
      },
      // 传入格式请参考
      data: {
        type: Array,
        default() {
          return [
            {
              detectPlan: [
                {index: 1, count: 1, range: ""},
                {index: 2, count: 0, range: ""},
                {index: 3, count: 0, range: ""},
                {index: 4, count: 0, range: ""},
                {index: 5, count: 0, range: ""},
                {index: 6, count: 0, range: ""},
                {index: 0, count: 0, range: ""}
              ]
            }
          ]
        }
      },
      disabled: {
        type: Boolean,
        default() {
          return false
        }
      }
    },
    watch: {
      data: {
        handler(val) {
          this.data = val;
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
      // 启用与关闭橡皮擦功能
      clearSome() {
        this.spanStatus = !this.spanStatus
      },
      selectAll() {
        this.divs.forEach(item => {
          item.select = true;
          item.color = this.color
        })
      },

      configMouseup() {
        this.flag = false;
        // this.hotDivFlag = false;
        this.endHeight = 0;
        this.endWidth = 0;
      },

      configMousedown(e) {
        if (this.disabled) {
          return
        }
        if (!this.color) {
          this.$message.warning('未选择模板!');
          return
        }
        this.start = {
          x: e.clientX - this.usearea.left,
          y: e.clientY - this.usearea.top,
          startX: e.clientX,
          startY: e.clientY
        };
        this.flag = true;
        this.hotObj = {};
        this.selectSpans = [];
        if (this.spanStatus) {
          this.filterDivs = this.divs.filter(item => item.select === false);
          if (this.color)
            this.filterDivs.forEach(item => {
              item.color = this.color
            })
        }
      },

      configMousemove(e) {
        let {usearea, start, config} = this;
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
            // hotDivs.push(hotObj)
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
            // hotDivs.push(hotObj)
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
            };
            // hotDivs.push(hotObj)
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

      // 页面初始化时生成的span
      genSpan() {
        let {config} = this;
        let numx = config.numx;
        let numy = config.numy;
        let outWidth = config.outWidth;
        let outHeight = config.outHeight;
        let spanWidth = outWidth / numx;
        let spanHeiht = outHeight / numy;
        this.divs = [];
        // 重置默认
        let array = this.data ? this.data : [
          {
            detectPlan: [
              {index: 1, count: 1, range: ""},
              {index: 2, count: 0, range: ""},
              {index: 3, count: 0, range: ""},
              {index: 4, count: 0, range: ""},
              {index: 5, count: 0, range: ""},
              {index: 6, count: 0, range: ""},
              {index: 0, count: 0, range: ""}
            ]
          }
        ];
        // 每周对应的时间段
        let myObj = {
          'monday&&1': [],
          'tuseday&&2': [],
          'wednesday&&3': [],
          'thursday&&4': [],
          'friday&&5': [],
          'saturday&&6': [],
          'sunday&&0': []
        };
        // 把对应的时间段放到myObj
        array.forEach((item, index) => {
          let detectPlan = item.detectPlan;
          for (let i = 0, j = detectPlan.length; i < j; i++) {
            switch (parseInt(detectPlan[i].index)) {
              case 1:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['monday&&1'].push(item + '&&' + index);
                });
                break;
              case 2:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['tuseday&&2'].push(item + '&&' + index);
                });
                break;
              case 3:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['wednesday&&3'].push(item + '&&' + index);
                });
                break;
              case 4:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['thursday&&4'].push(item + '&&' + index);
                });
                break;
              case 5:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['friday&&5'].push(item + '&&' + index);
                });
                break;
              case 6:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['saturday&&6'].push(item + '&&' + index);
                });
                break;
              case 0:
                detectPlan[i].range.split(',').forEach(item => {
                  myObj['sunday&&0'].push(item + '&&' + index);
                });
                break;
            }
          }
        });

        // 保存了每个div需要对应的时间段，便可到页面上渲染
        let i = 0;
        for (let key in myObj) {
          let range = myObj[key];
          for (let j = 0; j < numx; j++) {
            let week = `星期${key.split('&&')[1]}`;
            let q = j + 1;
            let timeItem1 = `${q % 2 === 0 ? (q / 2) < 10 ? ('0' + q / 2) : q / 2 : ((q - 1) / 2) < 10 ? ('0' + (q - 1) / 2) : (q - 1) / 2}:${j % 2 === 0 ? '30' : '00'}`;
            let splitTime = timeItem1.split(':');
            let timeItem2 = splitTime[1] === '30' ? `${splitTime[0]}:00` : splitTime[0]<=10 ? `0${splitTime[0] - 1}:30`:`${splitTime[0] - 1}:30`;
            let time = `${timeItem2}-${timeItem1}`;
            let select = false;
            let color = 0;
            // range.forEach(item => {
            //   let item2 = item.split(' ');
            //   item2.forEach(item3 => {
            //     let item4 = item3.split('&&');
            //     console.log(item4[0]);
            //
            //     if (item4[0]) {
            //       select = this.time_range(item4[0].split('-')[0], item4[0].split('-')[1], time);
            //       color = item4[1]*1
            //     }
            //   })
            // });
            for (let n = 0, m = range.length; n < m; n++) {
              let item2 = range[n].split(' ');
              for (let s = 0, w = item2.length; s < w; s++) {
                let item3 = item2[s].split('&&');
                if (select) {
                  break
                }
                if (item3[0]) {
                  select = this.time_range(item3[0].split('-')[0], item3[0].split('-')[1], time);
                  color = item3[1] * 1
                }
              }
            }
            this.divs.push({
              id: i * numx + j,
              x: j * spanWidth,
              y: i * spanHeiht,
              week,
              time,
              color: this.predefineColors[color],
              select
            })
          }
          i = i + 1
        }
        // for (let i = 0; i < numy; i++) {
        //   for (let j = 0; j < numx; j++) {
        //     let week = `星期${i + 1}`;
        //     let q = j + 1;
        //     let time = `${q % 2 === 0 ? q / 2 : (q - 1) / 2}:${j % 2 === 0 ? '30' : '00'}`;
        //     this.divs.push({
        //       id: i * numx + j,
        //       x: j * spanWidth,
        //       y: i * spanHeiht,
        //       week,
        //       time,
        //       color: '#FF7F50',
        //       select: false
        //     })
        //   }
        // }
        if (this.axisTime.length === 0) {
          for (let i = 0; i < 24; i++) {
            this.axisTime.push({
              id: i,
              time: i
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
          // this.hotDivFlag = false;
          return true
        }
        if (e.clientX <= usearea.left + 1 || e.clientY + 5 >= usearea.top + usearea.height) {
          this.endHeight = 0;
          this.endWidth = 0;
          this.flag = false;
          // this.hotDivFlag = false;
          return true
        }
      },

      // 当页面距离顶部距离变化的时候 需要重置top距离
      initFromTop() {
        let parentNode = document.getElementById('parentNode-time');
        this.usearea.top = parentNode.offsetTop - this.scrollTop;
      },

      // 滚动事件监听
      scrollHandle(e) {
        this.scrollTop = e.target.scrollTop;
        let parentNode = document.getElementById('parentNode-time');
        this.usearea.top = parentNode.offsetTop - this.scrollTop;
      },

      // 一般正常返回调用函数
      returnData() {
        let spans = this.divs.filter(item => item.select === true);
        return this.returnWeekDay(spans)
      },

      // 返回后端需要的格式 数组对象
      returnWeekDay(spans) {
        let monday = [], tuseday = [], wednesday = [], thursday = [], friday = [], saturday = [], sunday = [];
        for (let i = 0, j = spans.length; i < j; i++) {
          switch (spans[i].week) {
            case '星期1':
              monday.push(spans[i]);
              break;
            case '星期2':
              tuseday.push(spans[i]);
              break;
            case '星期3':
              wednesday.push(spans[i]);
              break;
            case '星期4':
              thursday.push(spans[i]);
              break;
            case '星期5':
              friday.push(spans[i]);
              break;
            case '星期6':
              saturday.push(spans[i]);
              break;
            case '星期0':
              sunday.push(spans[i]);
              break;
          }
        }

        return [this.weekHandle(sunday, 0), this.weekHandle(monday, 1), this.weekHandle(tuseday, 2), this.weekHandle(wednesday, 3), this.weekHandle(thursday, 4), this.weekHandle(friday, 5), this.weekHandle(saturday, 6)]
      },

      // 返回后端需要子元素的格式 对象
      weekHandle(weekArray, week) {
        let myArray = [];
        let array = [];
        for (let i = 0, j = weekArray.length; i < j; i++) {
          let id1 = weekArray[i].id;
          let id2 = weekArray[i + 1] ? weekArray[i + 1].id : 400;
          if (id1 + 1 === id2) {
            array.push(weekArray[i])
          } else {
            array.push(weekArray[i]);
            myArray.push(array);
            array = []
          }
        }
        let rangeArray = myArray.map(item => {
          return `${item[0].time.split('-')[0]}-${item[item.length - 1].time.split('-')[1]}`
        });
        // if (myArray.length > 4) {
        //   this.$message.warning('一天内不能设备超过4个时间段!')
        // }
        return {
          index: week,
          count: myArray.length,
          range: rangeArray.join(",")
        }
      },

      // 返回检测模板数据
      returnDataCheck() {
        let spans = this.divs.filter(item => item.select === true);
        let colorArray = spans.map(item => item.color);
        let uniqueColor = PublicService.unique(colorArray);
        let checkArray = [];
        for (let i = 0; i < uniqueColor.length; i++) {
          let array = [];
          spans.forEach(item => {
            if (item.color === uniqueColor[i]) {
              array.push(item)
            }
          });
          checkArray.push(array)
        }
        let returnArray = [];
        checkArray.forEach(item => {
          let obj = {
            color: item[0].color
          };
          obj.detectPlan = this.returnWeekDay(item);
          returnArray.push(obj)
        });
        return returnArray
      },

      // 删除某个检测模板
      delCheck(color) {
        this.divs.forEach(item => {
          if (item.color === color) {
            item.select = false
          }
        })
      },

      // 用来判断是否在这时间段范围内
      time_range(beginTime, endTime, nowDate) {
        let strb = beginTime.split(":");
        let stre = endTime.split(":");
        let strn = nowDate.split("-")[1].split(':');
        let b = new Date(), e = new Date(), n = new Date();
        b.setHours(strb[0]);
        b.setMinutes(strb[1]);
        e.setHours(stre[0]);
        e.setMinutes(stre[1]);
        n.setHours(strn[0]);
        n.setMinutes(strn[1]-1);
        return (n.getTime() - b.getTime() >= 0 && n.getTime() - e.getTime() <= 0)
      },

      // 初始化
      init() {
        this.genSpan()
      }
    },
    mounted() {
      this.genSpan();
      this.$nextTick(() => {
        let parentNode2 = document.getElementsByClassName('set-dialog')[0];
        let parentNode = document.getElementById('parentNode-time');
        this.spanStatus = true;
        let t = this;
        t.usearea = {
          left: parentNode2.offsetLeft + parentNode.offsetLeft,
          top: parentNode.offsetTop,
          width: parentNode.clientWidth,
          height: parentNode.clientHeight
        };
        let parentNode3 = parentNode2.parentNode;
        parentNode3.addEventListener('scroll', t.scrollHandle);
      });
    }
  }
</script>


<style lang="less">
  @import "../myTheme";

  .time-crop {
    .time-intro {
      margin: 15px 0 20px;
    }
    .dia-handleBtns {
      margin-top: 20px;
      text-align: right;
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
        span.item {
          display: inline-block;
          /*margin-bottom: -4px;*/
          vertical-align: top;
          background-color: rgba(7, 255, 207, 0.09);
          -webkit-touch-callout: none; /* iOS Safari */

          -webkit-user-select: none; /* Chrome/Safari/Opera */

          -khtml-user-select: none; /* Konqueror */

          -moz-user-select: none; /* Firefox */

          -ms-user-select: none; /* Internet Explorer/Edge */

          user-select: none;
          border-bottom: 1px solid #BEC3D6;
          /* Non-prefixed version, currently

         not supported by any browser */
        }
        .item:nth-child(2n) {
          border-right: 1px solid #BEC3D6;
        }
        span.item.action {
          background-color: @activeBcg;
        }
        .item {
          border-right: 1px solid rgba(173, 183, 215, 0.2);

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
        .crop-box-content {
          width: 100%;
          height: 100%;
          background-color: #2aa7ff;
          opacity: .3;
        }
      }
    }

    .config .el-dialog__body {
      padding: 0 20px;
    }

    .config-axis-y {
      height: 273px;
      border-left: 1px solid #BEC3D6;
      margin-left: 48px;
      position: relative;
      div.item {
        width: 27px;
        height: 38px;
        display: inline-block;
        border: @cropBorder;
        margin-bottom: -4px;
      }
      div.active {
        background-color: @activeBcg;
      }
      /*&:after {*/
      /*bottom: 1px;*/
      /*content: '';*/
      /*position: absolute;*/
      /*width: 5px;*/
      /*height: 5px;*/
      /*left: -4px;*/
      /*border-bottom: 1px solid #333;*/
      /*border-right: 1px solid #333;*/
      /*transform: rotate(45deg);*/
      /*}*/
      div.item-y {
        position: absolute;
        left: -35px;
        div {
          margin-top: 20px;
        }
      }
      div.item-x {
        position: absolute;
        width: 100%;
      }
    }

    .config-axis {
      border-bottom: 1px solid #BEC3D6;
      margin-left: 48px;
      position: relative;
      /*width: 665px;*/
      /*&:after {*/
      /*bottom: -3px;*/
      /*content: '';*/
      /*position: absolute;*/
      /*width: 5px;*/
      /*height: 5px;*/
      /*right: 2px;*/
      /*border-bottom: 1px solid #333;*/
      /*border-right: 1px solid #333;*/
      /*transform: rotate(-45deg);*/
      /*}*/
      span {
        display: inline-block;
        width: 27px;
        text-align: left;
      }
    }
  }


</style>
