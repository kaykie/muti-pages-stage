<template>
  <mu-paper>
    <div class="time-title">
      <span>时间计划</span>
      <span style="font-size: 30px" @click="addPlan"> + </span>
    </div>
    <mu-list textline="three-line">
      <div v-for="(item,index) in timesCropData" :key="index" @click="timeClick">
        <mu-list-item button ripple>
          <mu-list-item-content>
            <mu-list-item-title>
              模板名称: {{item.showDetail.templateName}}
            </mu-list-item-title>
            <mu-list-item-sub-title>
              时间计划: {{item.showDetail.dateDetail}}
            </mu-list-item-sub-title>
          </mu-list-item-content>
          <mu-list-item-action class="job-right">
            >
          </mu-list-item-action>
        </mu-list-item>
        <mu-divider/>
      </div>
    </mu-list>
  </mu-paper>
</template>

<script>
  import PublicService from '../service/PublicService'

  export default {
    name: "TimeSelect",
    data() {
      return {
        myData:[]
      }
    },
    computed: {},
    props: {
      timesCropData: {
        type: Array,
        default() {
          return [
            // {
            //   templateId: '',
            //   detectPlan: [
            //     {index: '1', count: 1, range: '00:00-24:00'}
            //   ],
            //   showDetail: {
            //     templateName: '',
            //     dateDetail: ''
            //   }
            // }
          ]
        }
      },
      fatherRouteName: {
        type: String,
        default() {
          return 'config'
        }
      }
    },
    methods: {
      timeClick(item) {
        this.$router.push({
          name: 'timesEdit',
          params: {timeDetail: item, fatherRouteName: this.fatherRouteName}
        })
      },
      // 添加时间计划
      addPlan() {
        this.$router.push({
          name: 'timesEdit',
          params: {
            fatherRouteName: this.fatherRouteName,
            timesCropData: this.timesCropData
          }
        })
      },
    },
    created() {
      console.log(this.$route.params);
      if (!PublicService.isEmptyObject(this.$route.params)) {
        this.timesCropData = this.$route.params;

      }

    }
  }
</script>

<style scoped lang="less">

</style>
