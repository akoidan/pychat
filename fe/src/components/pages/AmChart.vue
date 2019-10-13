<template>
  <div>
    <div ref="div" id="chartdiv"></div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import 'amcharts3/amcharts/amcharts';
  import 'amcharts3/amcharts/pie';

  interface AmChartI {
    dataItem: { wedge: { node: HTMLElement } }
  }
  @Component
  export default class PainterPage extends Vue {

    async mounted() {
      var data: any = {
        "type": "pie",
        "startDuration": 0,
        "theme": "dark",
        "addClassNames": true,
        "legend":{
          "position":"right",
          "marginRight":100,
          "autoMargins":false
        },
        "innerRadius": "30%",
        "defs": {
          "filter": [{
            "id": "shadow",
            "width": "200%",
            "height": "200%",
            "feOffset": {
              "result": "offOut",
              "in": "SourceAlpha",
              "dx": 0,
              "dy": 0
            },
            "feGaussianBlur": {
              "result": "blurOut",
              "in": "offOut",
              "stdDeviation": 5
            },
            "feBlend": {
              "in": "SourceGraphic",
              "in2": "blurOut",
              "mode": "normal"
            }
          }]
        },
        "valueField": "count",
        "titleField": "country",
        "export": {
          "enabled": true
        }
      };
      await this.$api.statistics();
      // @ts-ignore: next-line
      var chart = window.AmCharts.makeChart("chartdiv", data);
      chart.addListener("init", () => {
        // @ts-ignore: next-line
        chart.legend.addListener("rollOverItem", handleRollOver);
      });
      // @ts-ignore: next-line
      chart.addListener("rollOverSlice", handleRollOver);

      function handleRollOver(e: AmChartI) {
        var wedge = e.dataItem.wedge.node;
        wedge.parentNode!.appendChild(wedge);
      }
    }
  }
</script>

<style lang="sass" scoped>

  @import "~@/assets/sass/partials/abstract_classes"

  .container
    height: calc(100% - 55px)
    padding: 10px
    box-sizing: border-box

  .container /deep/
    .active-icon
      color: red

    @import "~spainter/no-fonts.sass"

</style>
