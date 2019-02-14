<template>
  <mu-paper class="time-edit">
    <mu-list>
      <mu-list-item button ripple @click="jumpTemplate" style="background: #fff;">
        <mu-list-item-title>
          检测模板: <span>{{template && template.templetName}}</span>
        </mu-list-item-title>
        <mu-list-item-after-text>

          <mu-icon value=":el-icon-my-more"></mu-icon>
        </mu-list-item-after-text>

      </mu-list-item>
      <mu-divider/>
      <div v-for="(item,index) in dateArray" :key="index" class="time-edit-item">
        <mu-list-item button ripple>
          <DateInput
            label="开始时间"
            v-model="item.start"
          />
        </mu-list-item>
        <mu-divider/>
        <mu-list-item button ripple>
          <DateInput
            label="结束时间"
            v-model="item.end"
          />
        </mu-list-item>
        <mu-divider/>
        <mu-list-item class="week-select">
          <mu-list-item-content>
            <mu-list-item-title>一周重复</mu-list-item-title>
            <mu-list-item-sub-title class="com-week">
              <div @click="clickWeek('array'+index,$event)">
                  <span v-for="(item,index2) in weekObj['array'+index]" :key="index2"
                        :class="item.active ? 'com-week-active' :''">{{item.week}}</span>
              </div>
            </mu-list-item-sub-title>
          </mu-list-item-content>
        </mu-list-item>
      </div>

    </mu-list>
    <div>
      <mu-button full-width color="primary" @click="returnData">保存</mu-button>
    </div>
    <div class="time-add">
      <div class="time-add-warp">
        <div @click="timeAdd"> +</div>
        <div @click="timedel" style="background: red;"> -</div>
      </div>
    </div>
    <mu-bottom-sheet :open="isBottomOpen">
      <TemplateList
        v-on:select="selectTemplate"
      />
    </mu-bottom-sheet>
  </mu-paper>
</template>

<script>
  import DateInput from './DateInput'
  import TemplateList from '../pages/offpost/components/TemplateList'
  export default {
    name: "TimesEdit",
    data() {
      return {
        dateArray: [
          {
            start: "00:00",
            end: "24:00"
          }
        ],
        template: {},
        weekObj: {
          array0: [
            {
              week: '一',
              active: true,
              id: 1
            },
            {
              week: '二',
              active: true,
              id: 2
            },
            {
              week: '三',
              active: true,
              id: 3
            },
            {
              week: '四',
              active: true,
              id: 4
            },
            {
              week: '五',
              active: true,
              id: 5
            },
            {
              week: '六',
              active: true,
              id: 6
            },
            {
              week: '日',
              active: true,
              id: 0
            }
          ]
        },
        fatherRouteName: '',
        timesCropData: [],
        isBottomOpen:false
      }
    },
    components: {
      DateInput,
      TemplateList
    },
    methods: {
      timeAdd() {
        if (this.dateArray.length >= 4) {
          this.$toast.warning('不能超过4个时间段');
          return
        }
        this.weekObj['array' + this.dateArray.length] = [
          {
            week: '一',
            active: true,
            id: 1
          },
          {
            week: '二',
            active: true,
            id: 2
          },
          {
            week: '三',
            active: true,
            id: 3
          },
          {
            week: '四',
            active: true,
            id: 4
          },
          {
            week: '五',
            active: true,
            id: 5
          },
          {
            week: '六',
            active: true,
            id: 6
          },
          {
            week: '七',
            active: true,
            id: 0
          }
        ];
        this.weekObj = JSON.parse(JSON.stringify(this.weekObj));
        this.dateArray.push({
          start: '',
          end: ''
        });
      },
      timedel() {
        if (this.dateArray.length <= 1) {
          this.$toast.warning('至少一个时间段');
          return
        }
        this.dateArray.pop()
      },
      // 打开检测模板
      jumpTemplate() {
        this.isBottomOpen = true;
      },
      returnData() {
        let {dateArray, weekObj, template} = this;
        if (!template.id) {
          this.$toast.warning('未选择检测模板!');
          return
        }
        let monday = [],
          tuesday = [],
          wednesday = [],
          thursday = [],
          friday = [],
          saturday = [],
          sunday = [];
        dateArray.forEach((item, index) => {
          let dateStr = `${item.start}:${item.end}`;
          let weekArray = weekObj['array' + index];
          for (let i = 0, j = weekArray.length; i < j; i++) {
            if (weekArray[i].active) {
              switch (weekArray[i].id) {
                case 1:
                  monday.push(dateStr);
                  break;
                case 2:
                  tuesday.push(dateStr);
                  break;
                case 3:
                  wednesday.push(dateStr);
                  break;
                case 4:
                  thursday.push(dateStr);
                  break;
                case 5:
                  friday.push(dateStr);
                  break;
                case 6:
                  saturday.push(dateStr);
                  break;
                case 0:
                  sunday.push(dateStr);
                  break;
              }
            }
          }
        });
        let detectPlan = [
          {
            index: '1',
            count: monday.length,
            range: monday.join(',')
          },
          {
            index: '2',
            count: tuesday.length,
            range: tuesday.join(',')
          },
          {
            index: '3',
            count: wednesday.length,
            range: wednesday.join(',')
          },
          {
            index: '4',
            count: thursday.length,
            range: thursday.join(',')
          },
          {
            index: '5',
            count: friday.length,
            range: friday.join(',')
          },
          {
            index: '6',
            count: saturday.length,
            range: saturday.join(',')
          },
          {
            index: '0',
            count: sunday.length,
            range: sunday.join(',')
          }
        ];
        let dateDetailArray = [];
        if (monday.length) {
          dateDetailArray.push(`星期一:${monday.join(',')}`)
        }
        if (tuesday.length) {
          dateDetailArray.push(`星期二:${tuesday.join(',')}`)
        }
        if (wednesday.length) {
          dateDetailArray.push(`星期三:${wednesday.join(',')}`)
        }
        if (thursday.length) {
          dateDetailArray.push(`星期四:${thursday.join(',')}`)
        }
        if (friday.length) {
          dateDetailArray.push(`星期五:${friday.join(',')}`)
        }
        if (saturday.length) {
          dateDetailArray.push(`星期六:${saturday.join(',')}`)
        }
        if (sunday.length) {
          dateDetailArray.push(`星期日:${sunday.join(',')}`)
        }
        console.log(dateDetailArray);
        let obj = this.timesCropData.find(item => item.templateId === template.id);
        if (obj) {
          obj.detectPlan = detectPlan
        } else {
          this.timesCropData.push({
            templetId: template.id,
            detectPlan,
            showDetail: {
              templateName: template.templetName,
              dateDetail: dateDetailArray.join(';')
            }
          })
        }
        console.log(this.timesCropData)


        this.$router.push({
          name: this.fatherRouteName,
          params: this.timesCropData
        })
      },
      // 点击星期父元素,事件委托
      clickWeek(key, e) {
        let obj = this.weekObj[key].find(item => item.week === e.target.innerText);
        if (obj) {
          obj.active = !obj.active;
        }
      },
      selectTemplate(item){
        this.isBottomOpen = false;
        this.template = item
      }
    },
    mounted() {
      console.log(this.$route.params);
      if (this.$route.params) {
        this.timeDetail = this.$route.params.timeDetail;
        this.fatherRouteName = this.$route.params.fatherRouteName ? this.$route.params.fatherRouteName : this.fatherRouteName;
        this.timesCropData = this.$route.params.timesCropData || [];
        console.log(this.timesCropData)
      }
    }
  }
</script>

<style lang="less">
  .time-edit {
    background: #ddd;
    .time-edit-item {
      background: #fff;
      margin-top: 10px;
    }
    .week-select {
      .mu-item {
        height: auto;
        padding: 10px 16px;
      }
    }
    .com-week {
      span {
        display: inline-block;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        line-height: 30px;
        text-align: center;
        margin: 0 5px;

        margin-top: 10px;
        background: #ccc;
        color: #000;
      }
      .com-week-active {
        background: #333;
        color: #fff;
      }
    }

    .com-time {
      margin-bottom: 0;
      padding: 10px 0;
      .mu-text-field-input {
        text-align: right;
      }
      .mu-input-line {
        display: none;
      }
      .mu-input-focus-line {
        display: none;
      }
      &.has-label {
        padding: 5px 0;
        min-height: auto;
        /*line-height: 72px;*/
      }
      &.has-label .mu-input-label {
        top: 50%;
        transform: translateY(-50%);
      }
      .mu-input-label {
        font-size: 16px;
        color: #000;
        transform: none;
      }
    }
    .time-add {
      position: fixed;
      right: 20px;
      bottom: 20px;
      .time-add-warp {
        display: flex;
        > div {
          font-size: 30px;
          height: 30px;
          width: 30px;
          line-height: 26px;
          border-radius: 50%;
          background: greenyellow;
          color: #fff;
          text-align: center;
          margin: 0 5px;
        }
      }
    }

  }

</style>
