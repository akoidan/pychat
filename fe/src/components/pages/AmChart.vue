<template>
  <div>
    <div ref="div" id="chartdiv"></div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";


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

      let amcharts = await import( /* webpackChunkName: "amcharts" */ '@/utils/amchart.js');
      var chart = amcharts.makeChart("chartdiv", data);
      chart.addListener("init", () => {
        chart.legend.addListener("rollOverItem", handleRollOver);
      });
      chart.addListener("rollOverSlice", function(e: AmChartI) {
        handleRollOver(e);
      });

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
