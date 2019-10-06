<template>
  <datepicker v-if="isDateMissing" placeholder="Select Date" v-bind:value="datePickerValue" :input-class="`${inputClass} ${inputClassDatepicker}`" @input="oninput"></datepicker>
  <input type="date" :class="inputClass" v-else v-bind:value="value" @input="oninputnative"/>
</template>
<script lang="ts">

  import {Component, Prop, Vue} from "vue-property-decorator";
  import {isDateMissing} from '@/utils/htmlApi';
  import {ELECTRON_MAIN_FILE} from '@/utils/consts'

  let Datepicker;
  if (!ELECTRON_MAIN_FILE) {
    Datepicker = () => import( /* webpackChunkName: "vuejs-datepicker" */ 'vuejs-datepicker');
  } else {
    Datepicker = Promise.resolve();
  }

  @Component({components: {Datepicker}})
  export default class AppInputDate extends Vue {
    @Prop() value: string;
    @Prop({default: ''}) inputClass: string;
    @Prop({default: ''}) inputClassDatepicker: string;

    get datePickerValue() {
      this.logger.debug("generating date for datepicker {}", this.value)();
      if (!this.value) {
        return new Date();
      } else {
        let strings = this.value.split('-');
        return new Date(parseInt(strings[0]), parseInt(strings[1])-1, parseInt(strings[2]));
      }

    }

    oninputnative(e) {
      this.$emit('input', e.target.value);
    }
    oninput(value) {
      this.logger.debug("generating date for datepicker {}", this.value)();
      this.$emit('input', `${value.getFullYear()}-${value.getMonth()+1}-${value.getDate()}`);
    }
    isDateMissing: boolean = isDateMissing;
  }
</script>

<style lang="sass" scoped>
</style>
