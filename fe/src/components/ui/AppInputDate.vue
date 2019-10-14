<template>
  <datepicker
    v-if="isDateMissing"
    placeholder="Select Date"
    :value="datePickerValue"
    :input-class="`${inputClass} ${inputClassDatepicker}`"
    @input="oninput"
  />
  <input
    v-else
    type="date"
    :class="inputClass"
    :value="value"
    @input="oninputnative"
  >
</template>
<script lang="ts">
  import {State} from '@/utils/storeHolder';
  import {Component, Prop, Vue, Emit} from "vue-property-decorator";
  import {isDateMissing} from '@/utils/htmlApi';
  import {ELECTRON_MAIN_FILE} from '@/utils/consts'

  let Datepicker: unknown;
  if (!ELECTRON_MAIN_FILE) {
    // @ts-ignore: next-line
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

    oninputnative(e: InputEvent) {
      this.input(e);
    }

    @Emit()
    input(e: InputEvent){
      return (e.target as HTMLInputElement).value;
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
