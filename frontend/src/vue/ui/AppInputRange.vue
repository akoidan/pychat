<template>
  <input
    ref="el"
    :class="cls"
    :value="modelValue"
    type="range"
    @input="oninput"
  />
</template>
<script lang="ts">
import {
  Component, Emit,
  Prop,
  Ref,
  Vue,
} from "vue-property-decorator";

let uniqueId = 1;

function getUniqueId() {
  return uniqueId++;
}

@Component({name: "AppInputRange"})
export default class AppInputRange extends Vue {
  @Prop() public readonly modelValue!: number;

  @Ref()
  public el!: HTMLInputElement;

  public cls!: string;

  private style: any;

  get $noVerbose(): true {
    return true;
  }

  public created() {
    this.style = document.createElement("style");
    document.head.appendChild(this.style);
    this.cls = `wbktRange${getUniqueId()}`;
  }

  public mounted() {
    this.fixStyle();
  }

  public destroy() {
    document.head.removeChild(this.style);
  }

  @Emit("update:modelValue")
  public oninput(event: Event) {
    this.fixStyle();
    return  parseInt((event.target as HTMLInputElement).value);
  }

  public fixStyle() {
    const min = parseInt(this.el.getAttribute("min") || "0");
    const max = parseInt(this.el.getAttribute("max") || "100");
    const v = parseFloat(this.el.value);
    const p = Math.round((v - min) / (max - min) * 100);
    this.style.textContent = `.${this.cls}::-webkit-slider-runnable-track {background-size: ${p}% 100%, 100% 100% !important; } `;
  }
}
</script>

<style lang="sass" scoped>
$after-color: rgb(28, 30, 29)
$before-color: #235c6d
$track-w: 6em
$track-h: 0.3em
$thumb-d: $track-h * 1.5
$range-height: 4 * $track-h
$track-bg: #222325
$input-bw: 0.25em
$thumb-c: #cbcbcb
$thumb-refl: #5e5858


$bar-s: 0.5em
$n-bar: 10
// 9 bars + 0 that generates empty
$bar-h: 0em
$bar-sizes: ()
$track-grad-color: top, lighten($before-color, 10%), darken($before-color, 10%)

@for $i from 0 to $n-bar
  $bar-h: $bar-h + 0.04em
  $bar-sizes: append($bar-sizes, (0.875 * $bar-s) $bar-h, comma)

@mixin vol-level($max-level)
  input[type=range].vol-level-#{$max-level}
    $bars: ()
    $bar-offset: .25em
    @for $i from 0 to $n-bar
      $base-color: #7d7d7d
      @if $i <= $max-level
        $base-color: rgb(100+15*$i, 255-15*$i, 50)
      $bar: linear-gradient($base-color, darken($base-color, 25.5%)) no-repeat
      $bar-offset: $bar-offset + $bar-s
      $bars: append($bars, $bar left $bar-offset bottom ($input-bw + 1.5 * $track-h), comma)
    background: $bars
    background-origin: border-box
    background-size: $bar-sizes


@for $i from 0 to $n-bar
  @include vol-level($i)

@function refl($pos: 50% 0, $k: 1, $refl: $thumb-refl)
  @return radial-gradient(at #{$pos}, rgba($refl, $k), rgba($refl, 0) 71%) #{$pos}

@function refl-l($a: 0deg, $k: 1, $refl: $thumb-refl)
  @return linear-gradient($a, rgba($refl, 0), rgba($refl, $k), rgba($refl, 0)) 50% 50%

=track-base
  box-sizing: border-box
  border: solid 1px
  border-color: #0c0d0f #1b1c1e #222423
  width: $track-w
  height: $track-h
  border-radius: .25em
  box-shadow: 0 1px 1px rgba(250, 255, 253, 0.2), inset 0 1px 1px rgba(0, 0, 0, 0.41)

=thumb-base
  width: $thumb-d
  height: $thumb-d
  border: none
  border-radius: 50%
  background: refl-l(0deg, 0.5), refl(), refl(0 50%), refl-l(90deg, 0.5), refl(50% 100%), refl(100% 50%), $thumb-c
  background-repeat: no-repeat
  background-size: 100% .125em, 50% 50%, 50% 50%, .125em 100%, 50% 50%, 50% 50%


.color-lor input, .color-reg input
  &,
  &::-webkit-slider-runnable-track,
  &::-webkit-slider-thumb
    -webkit-appearance: none

  @extend .vol-level-0
  padding: $range-height * 0.4 5px $range-height * 0.1 5px
  width: $track-w
  height: $range-height * 0.5
  border-radius: .25em
  font-size: 1em
  cursor: pointer

  &::-webkit-slider-runnable-track
    +track-base
    background: -webkit-linear-gradient($track-grad-color) no-repeat, -webkit-linear-gradient($after-color, $after-color)
    background-size: 100% 100%, 100% 100%

  &::-moz-range-track
    +track-base

  &::-ms-track
    +track-base
    color: transparent

  &::-ms-fill-lower
    border-radius: .1875em
    background: -ms-linear-gradient($track-grad-color) no-repeat

  &::-ms-fill-upper
    border-radius: .1875em
    background: $after-color

  &::-moz-range-progress
    background: -moz-linear-gradient($track-grad-color) no-repeat
    border-radius: .25em
    border: none

  &::-moz-range-track
    background-color: $after-color

  &::-webkit-slider-thumb
    margin-top: calc(($track-h - $thumb-d) / 2)
    +thumb-base

  &::-moz-range-thumb
    +thumb-base

  &::-ms-thumb
    +thumb-base

  &::-ms-tooltip
    display: none

  &:focus
    outline: none
    $shadow: 0 1px .25em rgba(cyan, .3)

    &::-webkit-slider-runnable-track
      box-shadow: $shadow

    &::-moz-range-track
      box-shadow: $shadow

    &::-ms-track
      box-shadow: $shadow
</style>
