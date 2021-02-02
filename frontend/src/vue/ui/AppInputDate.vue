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
import {
  Component,
  Emit,
  Prop,
  Vue
} from 'vue-property-decorator';
import { isDateMissing } from '@/ts/utils/htmlApi';
import { IS_ELECTRON } from '@/ts/utils/consts';

let Datepicker: unknown;
if (!IS_ELECTRON) {
  // @ts-ignore: next-line
  Datepicker = (() => import(/* webpackChunkName: "vuejs-datepicker" */ 'vuejs-datepicker'));
} else {
  Datepicker = Promise.resolve();
}

// @ts-ignore: next-line
@Component({
  name: 'AppInputDate',
  components: {Datepicker}
})
export default class AppInputDate extends Vue {

  get datePickerValue() {
    this.$logger.debug('generating date for datepicker {}', this.value)();
    if (!this.value) {
      return new Date();
    } else {
      const strings = this.value.split('-');

      return new Date(parseInt(strings[0]), parseInt(strings[1]) - 1, parseInt(strings[2]));
    }

  }
  @Prop() public value!: string;
  @Prop({default: ''}) public inputClass!: string;
  @Prop({default: ''}) public inputClassDatepicker!: string;
  public isDateMissing: boolean = isDateMissing;

  public oninputnative(e: InputEvent) {
    this.input(e);
  }

  @Emit()
  public input(e: InputEvent) {
    return (e.target as HTMLInputElement).value;
  }
  public oninput(value: Date) {
    this.$logger.debug('generating date for datepicker {}', this.value)();
    this.$emit('input', `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`);
  }
}
</script>

<style lang="sass" scoped>
</style>
