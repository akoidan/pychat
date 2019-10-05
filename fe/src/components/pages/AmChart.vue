<template>
  <div>
    <div ref="div" id="chartdiv"></div>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import Painter from 'spainter';
  import {messageBus} from '@/utils/singletons';
  import loggerFactory from "@/utils/loggerFactory";
  import AppInputRange from '@/components/ui/AppInputRange';
  @Component
  export default class PainterPage extends Vue {

    mounted() {
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
      this.$api.statistics((cb, err) => {
        data.dataProvider = cb;
        import( /* webpackChunkName: "amcharts" */ '@/utils/amchart.js').then(amcharts => {
          var chart = window['AmCharts'].makeChart("chartdiv", data);

          chart.addListener("init", handleInit);

          chart.addListener("rollOverSlice", function(e) {
            handleRollOver(e);
          });

          function handleInit(){
            chart.legend.addListener("rollOverItem", handleRollOver);
          }

          function handleRollOver(e){
            var wedge = e.dataItem.wedge.node;
            wedge.parentNode.appendChild(wedge);
          }
        });
      })
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
