<template>
  <input
    :class="inputClass"
    :value="modelValue"
    type="date"
    @input="oninputnative"
  />
</template>
<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Vue,
} from "vue-property-decorator";


@Component({
  name: "AppInputDate",
})
export default class AppInputDate extends Vue {
  @Prop() public modelValue!: string;

  @Prop({default: ""}) public inputClass!: string;

  @Prop({default: ""}) public inputClassDatepicker!: string;

  public get datePickerValue() {
    this.$logger.debug("generating date for datepicker {}", this.modelValue)();
    if (!this.modelValue) {
      return new Date();
    }
    const strings = this.modelValue.split("-");

    return new Date(parseInt(strings[0]), parseInt(strings[1]) - 1, parseInt(strings[2]));
  }

  public oninputnative(e: any) {
    this.input(e);
  }

  @Emit('update:modelValue')
  public input(e: InputEvent) {
    return (e.target as HTMLInputElement).value;
  }

  public oninput(value: Date) {
    this.$logger.debug("generating date for datepicker {}", this.modelValue)();
    this.$emit("update:modelValue", `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`);
  }
}
</script>

<style lang="sass" scoped>
</style>
