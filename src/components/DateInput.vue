<template>
  <div style="width: 100%;height: 100%">
    <div class="date-input" @click="click">
      <div>
        {{label}}
      </div>
      <div>
        <span>{{myModel2}}</span>
        <mu-icon value=":el-icon-my-more"></mu-icon>
      </div>
    </div>


    <mu-bottom-sheet :open="isOpen" @close="closeBottom">
      <div class="date-warp">
        <div class="date-item date-hour" @click="hourClick">
          <div :class="item.active? 'date-hour-item active' : 'date-hour-item'" v-for="(item,index) in hourArray"
               :key="index">{{item.hour}}
          </div>
        </div>
        <div class="date-item ">
          <div class="date-minute">
            <div @click="minuteClick">
              <div :class="item.active? 'date-minute-item active' : 'date-minute-item'"
                   v-for="(item,index) in minuteArray" :key="index">{{item.minute}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="date-actions">
        <mu-button @click='cancel' >取消</mu-button>
        <mu-button color="primary" @click="save">确定</mu-button>
      </div>

    </mu-bottom-sheet>
  </div>


</template>

<script>
  export default {
    name: "DateInput",
    data() {
      return {
        myModel2: '',
        isOpen: false,
        hourArray: [
          {
            id: 0,
            hour: '00',
            active: false
          },
          {
            id: 1,
            hour: '01',
            active: false
          },
          {
            id: 2,
            hour: '02',
            active: false
          },
          {
            id: 3,
            hour: '03',
            active: false
          },
          {
            id: 4,
            hour: '04',
            active: false
          },
          {
            id: 5,
            hour: '05',
            active: false
          },
          {
            id: 6,
            hour: '06',
            active: false
          },
          {
            id: 7,
            hour: '07',
            active: false
          },
          {
            id: 8,
            hour: '08',
            active: false
          },
          {
            id: 9,
            hour: '09',
            active: false
          },
          {
            id: 10,
            hour: '10',
            active: false
          },
          {
            id: 11,
            hour: '11',
            active: false
          },
          {
            id: 12,
            hour: '12',
            active: false
          },
          {
            id: 13,
            hour: '13',
            active: false
          },
          {
            id: 14,
            hour: '14',
            active: false
          },
          {
            id: 15,
            hour: '15',
            active: false
          },
          {
            id: 16,
            hour: '16',
            active: false
          },
          {
            id: 17,
            hour: '17',
            active: false
          },
          {
            id: 18,
            hour: '18',
            active: false
          },
          {
            id: 19,
            hour: '19',
            active: false
          },
          {
            id: 20,
            hour: '20',
            active: false
          },
          {
            id: 21,
            hour: '21',
            active: false
          },
          {
            id: 22,
            hour: '22',
            active: false
          },
          {
            id: 23,
            hour: '23',
            active: false
          },
          {
            id: 24,
            hour: '24',
            active: false
          }
        ],
        minuteArray: [
          {
            minute: '00',
            id: 0,
            active: false
          },
          {
            minute: '30',
            id: 1,
            active: false
          }
        ],
        hourStr:'',
        minuteStr:''
      }
    },
    watch: {},
    props: ['label', 'value'],
    methods: {
      change(val) {
        this.myModel2 = val;
      },
      hourClick(e) {
        console.log();
        let text = e.target.innerText;
        this.hourStr = text;
        let obj = this.hourArray.find(item => item.hour === text);
        this.hourArray.forEach(item => {
          item.active = false
        });
        obj.active = !obj.active;
        if (text === '24' && this.minuteArray.length > 1) {
          this.minuteArray.pop();
          this.minuteArray[0].active = true;
          this.minuteStr = '00';
        } else if (text !== '24' && this.minuteArray.length === 1) {
          this.minuteArray.push({
            minute: '30',
            id: 1,
            active: false
          })
        }
      },
      minuteClick(e) {
        let text = e.target.innerText;
        this.minuteStr = text;
        let obj = this.minuteArray.find(item => item.minute === text);
        this.minuteArray.forEach(item => {
          item.active = false
        });
        obj.active = !obj.active;
      },
      closeBottom(){
        this.isOpen = false
      },
      click(){
        this.isOpen = true;
      },
      save(){
        if(!this.hourStr){
          this.$toast.warning('未选择小时');
          return
        }
        if(!this.minuteStr){
          this.$toast.warning('未选择分');
          return
        }
        this.isOpen = false;
        let str = `${this.hourStr}:${this.minuteStr}`;
        this.myModel2 = str;
        this.$emit('input', str);
      },
      cancel(){
        this.isOpen = false
      }
    },
    mounted() {
      this.myModel2 = this.value;
      if(this.value){
        let array = this.value.split(':');
        this.hourStr = array[0];
        this.hourArray.find(item => item.hour === array[0]).active = true;
        this.minuteStr = array[1];
        this.minuteArray.find(item => item.minute === array[1]).active = true;
      }

    }
  }
</script>

<style lang="less">
  .date-input {
    position: relative;
    height: inherit;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
  }

  .date-warp {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    height: 272px;
    overflow: hidden;
    .date-item {
      flex: 1;
      text-align: center;
      /*height: 40px;*/
      /*line-height: 40px;*/
      cursor: pointer;
      height: inherit;
      overflow-y: scroll;
      overflow-x: hidden;
    }
    .date-minute {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      > div {
        width: 100%;
      }
    }
    .date-hour, .date-minute {
      border-right: 1px solid rgba(0, 0, 0, .12);
      .date-hour-item, .date-minute-item {
        line-height: 40px;
        height: 40px;
        &.active {
          color: blue;
          font-size: 18px;
        }
      }
    }
  }
  .date-actions{
    position: absolute;
    bottom: 10px;
    right: 20px;
    .mu-raised-button{
      min-width: 50px;
      height: 29px;
      margin-left: 5px;
    }
  }
</style>
