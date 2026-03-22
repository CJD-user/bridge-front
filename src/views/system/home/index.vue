<!--
  * 首页
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-09-12 22:34:00
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
  *
-->
<template>
  <!--  顶部用户信息-->
  <a-row>
    <HomeHeader />
  </a-row>
  <!--下方左右布局-->
<!--  <a-row :gutter="[10, 10]">-->
<!--    &lt;!&ndash;左侧&ndash;&gt;-->
<!--    <a-col :span="16">-->
<!--      <a-row :gutter="[10, 10]">-->
<!--        &lt;!&ndash;公告信息&ndash;&gt;-->
<!--        <a-col :span="12">-->
<!--          <HomeNotice title="公告" :noticeTypeId="1" />-->
<!--        </a-col>-->
<!--        &lt;!&ndash;企业动态&ndash;&gt;-->
<!--        <a-col :span="12">-->
<!--          <HomeNotice title="通知" :noticeTypeId="2" />-->
<!--        </a-col>-->
<!--        &lt;!&ndash;各类报表&ndash;&gt;-->
<!--        &lt;!&ndash; <a-col :span="6">-->
<!--          <Gauge :percent="saleTargetPercent" />-->
<!--        </a-col> &ndash;&gt;-->
<!--        <a-col :span="12">-->
<!--          <Pie />-->
<!--        </a-col>-->
<!--        <a-col :span="12">-->
<!--          <Category />-->
<!--        </a-col>-->
<!--        <a-col :span="24">-->
<!--          <Gradient />-->
<!--        </a-col>-->
<!--      </a-row>-->
<!--    </a-col>-->
<!--    &lt;!&ndash;右侧&ndash;&gt;-->
<!--    <a-col :span="8">-->
<!--      <a-row :gutter="[10, 10]">-->
<!--        &lt;!&ndash;快捷入口&ndash;&gt;-->
<!--        &lt;!&ndash; <a-col :span="24">-->
<!--          <HomeQuickEntry />-->
<!--        </a-col> &ndash;&gt;-->
<!--        &lt;!&ndash;关注公众号&ndash;&gt;-->
<!--        <a-col :span="24">-->
<!--          <OfficialAccountCard />-->
<!--        </a-col>-->
<!--        &lt;!&ndash;更新日志&ndash;&gt;-->
<!--        <a-col :span="24">-->
<!--          <ChangelogCard />-->
<!--        </a-col>-->
<!--        &lt;!&ndash;待办、已办&ndash;&gt;-->
<!--        <a-col :span="24">-->
<!--          <ToBeDoneCard />-->
<!--        </a-col>-->
<!--      </a-row>-->
<!--    </a-col>-->
<!--&lt;!&ndash;    <AdModal/>&ndash;&gt;-->
<!--  </a-row>-->
</template>
<script setup>
  import { computed } from 'vue';
  import HomeHeader from './home-header.vue';
  import HomeNotice from './home-notice.vue';
  import OfficialAccountCard from './components/official-account-card.vue';
  import ToBeDoneCard from './components/to-be-done-card/home-to-be-done.vue';
  import ChangelogCard from './components/changelog-card.vue';
  import Category from './components/echarts/category.vue';
  import Pie from './components/echarts/pie.vue';
  import Gradient from './components/echarts/gradient.vue';
  // import AdModal from './ad-modal.vue';

  // 业绩完成百分比
  const saleTargetPercent = computed(() => {
    return 75;
  });
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
