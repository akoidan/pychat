<template>
  <form
    class="holder"
    @submit.prevent="submit"
  >
    <table class="">
      <tbody>
        <tr>
          <th><label for="reportIssueIssue">Git revision</label></th>
          <td>
            <input
              :value="git"
              class="input"
              disabled
              type="text"
            />
          </td>
        </tr>
        <tr>
          <th><label for="reportIssueIssue">The problem you discovered:</label></th>
          <td>
            <textarea
              id="reportIssueIssue"
              ref="textarea"
              v-model="issue"
              class="input"
              required
              tabindex="-1"
            />
          </td>
        </tr>
        <tr>
          <th><label for="reportIssueBrowserVersion">Affected browser:</label></th>
          <td>
            <input
              id="reportIssueBrowserVersion"
              v-model="browser"
              class="input"
              type="text"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <app-submit
      :running="running"
      class="green-btn"
      value="Submit Issue"
    />
  </form>
</template>
<script lang="ts">
import {ApplyGrowlErr} from "@/ts/instances/storeInstance";
import {
  Component,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import AppSubmit from "@/vue/ui/AppSubmit.vue";
import {GIT_HASH} from "@/ts/utils/consts";
import {browserVersion} from "@/ts/utils/runtimeConsts";

@Component({
  name: "ReportIssue",
  components: {AppSubmit},
})
export default class ReportIssue extends Vue {
  public running: boolean = false;

  public browser: string = browserVersion;

  public issue: string = "";

  public textAreaStyle: string = "";

  @Ref()
  private readonly textarea!: HTMLTextAreaElement;

  get git() {
    return GIT_HASH;
  }

  @Watch("issue")
  public fixStyle() {
    const {textarea} = this;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight - 16}px`;
  }

  @ApplyGrowlErr({
    runningProp: "running",
    message: "Unable to submit issue",
  })
  public async submit() {
    await this.$api.sendLogs(this.issue, this.browser, this.git);
    this.$store.growlSuccess("Your issue has ben submitted");
    this.$router.go(-1);
  }
}
</script>

<style lang="sass" scoped>
@import "@/assets/sass/partials/abstract_classes"
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
