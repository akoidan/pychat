<template>
  <form @submit.prevent="submit" class="holder">
    <table class="">
      <tbody>
      <tr>
        <th><label for="reportIssueIssue">Git revision</label></th>
        <td><input class="input" type="text" disabled :value="git"></td>
      </tr>
      <tr>
        <th><label for="reportIssueIssue">The problem you discovered:</label></th>
        <td><textarea v-model="issue" class="input" ref="textarea" id="reportIssueIssue" tabindex="-1" required=""></textarea></td>
      </tr>
      <tr>
        <th><label for="reportIssueBrowserVersion">Affected browser:</label></th>
        <td><input v-model="browser" class="input" type="text" id="reportIssueBrowserVersion"></td>
      </tr>
      </tbody>
    </table>
    <app-submit class="green-btn" value='Submit Issue' :running="running"/>
  </form>
</template>
<script lang="ts">

  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import AppSubmit from "@/components/ui/AppSubmit.vue"
  import {browserVersion} from '@/utils/singletons';
  import {GIT_HASH} from '@/utils/consts';
  @Component({components: {AppSubmit}})
  export default class ReportIssue extends Vue {
    running: boolean = false;
    browser: string = browserVersion;
    issue: string = '';



    $refs: {
      textarea: HTMLTextAreaElement
    };

    textAreaStyle: string = null;

    get git(){
      return GIT_HASH;
    }

    @Watch('issue')
    fixStyle() {
      let textarea = this.$refs.textarea;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight -16 + 'px';
    }

    submit() {
      this.running = true;
      this.$api.sendLogs(this.issue, this.browser, e => {
        this.running = false;
        if (e) {
          this.store.growlError(e)
        } else {
          this.store.growlSuccess("Your issue has ben submitted");
          this.$router.go(-1);
        }
      })
    }
  }
</script>

<style lang="sass" scoped>
  @import "~@/assets/sass/partials/abstract_classes"
  .holder
    @extend %room-settings-holder
    width: calc(100% - 100px)
    max-width: 800px
  th
    max-width: 160px
  th, td
    padding: 4px
  th
    text-align: right
  .input
    @extend %big-input
</style>
