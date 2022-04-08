<template>
  <input
    :class="inputClass"
    :value="value"
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
  @Prop() public value!: string;

  @Prop({default: ""}) public inputClass!: string;

  @Prop({default: ""}) public inputClassDatepicker!: string;

  public get datePickerValue() {
    this.$logger.debug("generating date for datepicker {}", this.value)();
    if (!this.value) {
      return new Date();
    }
    const strings = this.value.split("-");

    return new Date(parseInt(strings[0]), parseInt(strings[1]) - 1, parseInt(strings[2]));
  }

  public oninputnative(e: any) {
    this.input(e);
  }

  @Emit()
  public input(e: InputEvent) {
    return (e.target as HTMLInputElement).value;
  }

  public oninput(value: Date) {
    this.$logger.debug("generating date for datepicker {}", this.value)();
    this.$emit("input", `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`);
  }
}
</script>

<style lang="sass" scoped>
</style>
