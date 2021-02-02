<template>
  <div class="holder">
    <app-image-cropper :initial-image="srcImg" ref="cropper"/>
    <app-submit
      class="green-btn"
      value="Upload photo"
      :running="running"
      @click.native="upload"
    />
  </div>
</template>
<script lang="ts">
import {ApplyGrowlErr, State} from '@/ts/instances/storeInstance';
import {Component, Ref, Vue, Watch} from 'vue-property-decorator';
import {canvasContext, resolveMediaUrl, stopVideo} from '@/ts/utils/htmlApi';
import AppSubmit from '@/vue/ui/AppSubmit.vue';
import type AppImageCropper from '@/vue/ui/AppImageCropper.vue';
import {CurrentUserInfoModel} from '@/ts/types/model';


@Component({
  name: 'UserProfileImage' ,
  components: {
    AppImageCropper: () => import(/* webpackChunkName: 'cropper' */ '@/vue/ui/AppImageCropper.vue'),
    AppSubmit
  }
})
export default class UserProfileImage extends Vue {

  public running: boolean = false;
  public srcImg: string = '';

  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @Ref()
  private readonly cropper!: AppImageCropper;

  @Watch('userInfo.image')
  public onUserImageChange(value: string) {
    this.srcImg = resolveMediaUrl(value);
  }

  public created() {
    this.srcImg = this.userInfo.image ? resolveMediaUrl(this.userInfo.image) : '';
  }

  @ApplyGrowlErr({ message: 'Unable to upload event', runningProp: 'running'})
  public async upload() {
    let blob = await this.cropper.cropImage();
    if (blob) {
      await this.$api.uploadProfileImage(blob);
      this.$store.growlSuccess('Image uploaded');
    } else {
      throw Error('Please select image first')
    }
  }

}
</script>

<style lang="sass" scoped>

  .green-btn
    width: 100%
    margin-top: 10px
  video
    position: absolute
    max-width: 35%
    max-height: 35%
    background: #555
    top: 0
    right: 0

  .imgHolder
    position: relative
    padding: 10px 0
  .holder
    display: block
    margin: auto
    text-align: center
    max-width: 400px
  img
    min-height: 150px
    min-width: 100%
    max-width: 100%
    border: 1px solid white

</style>
