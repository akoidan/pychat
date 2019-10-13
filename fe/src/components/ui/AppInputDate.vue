<template>
  <datepicker v-if="isDateMissing" placeholder="Select Date" v-bind:value="datePickerValue" :input-class="`${inputClass} ${inputClassDatepicker}`" @input="oninput"></datepicker>
  <input type="date" :class="inputClass" v-else v-bind:value="value" @input="oninputnative"/>
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue, Emit} from "vue-property-decorator";
  import {isDateMissing} from '@/utils/htmlApi';
  import {ELECTRON_MAIN_FILE} from '@/utils/consts'

  let Datepicker: unknown;
  if (!ELECTRON_MAIN_FILE) {
    Datepicker = (() => import( /* webpackChunkName: "vuejs-datepicker" */ 'vuejs-datepicker'));
  } else {
    Datepicker = Promise.resolve();
  }

  // @ts-ignore: next-line
  @Component({components: {Datepicker}})
  export default class AppInputDate extends Vue {
    @Prop() public value!: string;
    @Prop({default: ''}) public inputClass!: string;
    @Prop({default: ''}) public inputClassDatepicker!: string;

    get datePickerValue() {
      this.logger.debug("generating date for datepicker {}", this.value)();
      if (!this.value) {
        return new Date();
      } else {
        let strings = this.value.split('-');
        return new Date(parseInt(strings[0]), parseInt(strings[1])-1, parseInt(strings[2]));
      }

    }

    @Emit()
    input(e: InputEvent){
      return (<HTMLInputElement>e.target).value;
    }
    oninput(value: Date) {
      this.logger.debug("generating date for datepicker {}", this.value)();
      this.$emit('input', `${value.getFullYear()}-${value.getMonth()+1}-${value.getDate()}`);
    }
    isDateMissing: boolean = isDateMissing;
  }
</script>

<style lang="sass" scoped>
</style>
