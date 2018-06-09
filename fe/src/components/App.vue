<template>
  <div class="growlHolder">
    <growl v-for="title in state.growls" :title="title"></growl>
  </div>
  <router-view class="view"></router-view>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import {mapState} from "vuex";
import Growl from "./Growl";

@Component({
  computed: mapState(['growls']),
  components: {Growl}
})
export default class HelloDecorator extends Vue {

}
</script>
