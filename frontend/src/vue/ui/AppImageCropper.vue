<template>
  <div>
    <span>Drag-n-drop image on zone bellow</span>
    <div class="imgHolder">
      <section class="cropper-area">
        <div class="img-cropper" @drop.prevent="dropPhoto">
          <vue-cropper
            v-show="srcImg"
            ref="cropper"
            :aspect-ratio="aspectRatio"
            :auto-crop-area="1"
            :src="srcImg"
          />
          <div v-if="!srcImg" class="drop-zone"/>
        </div>
        <div v-if="srcImg" class="actions">
          <i class="icon-zoom-in" title="Zoom In (Mouse Wheel)" @click="cropper.relativeZoom(0.2)"/>
          <i class="icon-zoom-out" title="Zoom Out (Mouse Wheel)" @click="cropper.relativeZoom(-0.2)"/>
          <i class="icon-rotate" title="Rotate" @click="cropper.rotate(90)"/>
          <i class="icon-resize-horizontal" title="Flip Y" @click="cropper.scaleX(scaleY = scaleY * -1)"/>
          <i class="icon-resize-vertical" title="Flip X" @click="cropper.scaleY(scaleX = scaleX * -1)"/>
        </div>
      </section>
      <video
        v-show="showVideo"
        ref="changeProfileVideo"
        autoplay
        muted
      />
    </div>
    <input
      v-show="false"
      ref="inputFile"
      accept="image/*"
      type="file"
      @change="photoInputChanged"
    />
    <template v-if="isStopped">
      <input
        class="lor-btn"
        type="button"
        value="Select file"
        @click="selectFile"
      />
      <input
        class="lor-btn"
        type="button"
        value="Make a photo from webcam"
        @click="startCapturingVideo"
      />
    </template>
    <template v-else>
      <input
        class="lor-btn"
        type="button"
        value="Close webcam"
        @click="stopCapturingVideo"
      />
      <input
        class="lor-btn"
        type="button"
        value="Take photo"
        @click="takeSnapshot"
      />
    </template>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import VueCropper, {VueCropperMethods} from "vue-cropperjs";
import {isMobile} from "@/ts/utils/runtimeConsts";
import {canvasContext, stopVideo} from "@/ts/utils/htmlApi";


@Component({
  name: "AppImageCropper",
  components: {VueCropper},
})
export default class AppImageCropper extends Vue {
  @Ref()
  public cropper!: VueCropperMethods;

  @Prop({default: 1})
  public readonly aspectRatio!: number;

  public scaleX: number = 1;

  public scaleY: number = 1;

  public srcImg: string = "";

  public showVideo: boolean = false;

  public isStopped: boolean = true;

  @Prop()
  private initialImage!: string;

  @Ref()
  private inputFile!: HTMLInputElement;

  @Ref()
  private changeProfileVideo!: HTMLVideoElement;

  private readonly isMobile = isMobile;

  private srcVideo: MediaStream | null = null;

  private blob: Blob | null = null;

  private fileInputValue: string = "";

  public created() {
    this.srcImg = this.initialImage;
  }

  public async cropImage(): Promise<Blob | null> {
    // Get image data for post processing, e.g. upload or setting image src
    return new Promise((resolve, reject) => {
      this.cropper.getCroppedCanvas().toBlob(resolve);
    });
  }

  public dropPhoto(e: DragEvent) {
    this.$logger.debug("Drop photo")();
    const file = e.dataTransfer!.files[0];
    this.blob = file;
    if (file) {
      const ok = this.setPhotoFromReader(file, "drop");
      if (ok) {
        this.inputFile.value = "";
      }
    } else {
      this.$store.growlError("No files found in draggable object");
    }
  }

  public selectFile() {
    this.$logger.debug("Selecting file")();
    this.inputFile.click();
  }

  public photoInputChanged(e: Event) {
    const f: File = (e.target as HTMLInputElement)!.files![0];
    const ok = this.setPhotoFromReader(f, "input");
    if (!ok) {
      this.fileInputValue = "";
    } else {
      this.blob = f;
    }
  }

  public takeSnapshot() {
    if (this.srcVideo) {
      canvasContext.canvas.width = this.changeProfileVideo.videoWidth;
      canvasContext.canvas.height = this.changeProfileVideo.videoHeight;
      canvasContext.drawImage(this.changeProfileVideo, 0, 0);

      /*
       * "image/webp" works in Chrome.
       * Other browsers will fall back to image/png.
       */
      canvasContext.canvas.toBlob((blob: any) => {
        this.srcImg = URL.createObjectURL(blob); // TODO
        blob!.name = ".jpg";
        this.blob = blob;
      }, "image/jpeg", 0.95);
      this.inputFile.value = "";
    }
  }

  public async stopCapturingVideo() {
    this.stopVideo();
    this.showVideo = false;
    this.isStopped = true;
  }

  public async startCapturingVideo() {
    try {
      this.$logger.debug("checking perms")();
      await this.$platformUtil.askPermissions("video");
      this.$logger.debug("Capturing media")();
      await this.$platformUtil.askPermissions();
      this.srcVideo = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      this.showVideo = true;
      this.isStopped = false;
    } catch (e: any) {
      this.$logger.error("Error while trying to capture a picture \"{}\"", e.message || e.name)();
      this.$store.growlError(`Unable to use your webcam because ${e.message || e.name}`);
    }
  }

  @Watch("initialImage")
  private onInitialImageChange() {
    this.srcImg = this.initialImage;
  }

  @Watch("srcImg")
  private loadCropper(value: string) {
    this.cropper.replace(value);
  }

  private setPhotoFromReader(file: File, type: string) {
    if (file && file.type && (/image.*/).exec(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.srcImg = reader.result as string;
      };
      reader.readAsDataURL(file);

      return true;
    }
    this.$store.growlError(`Invalid file type ${file.type}`);

    return false;
  }

  @Watch("srcVideo")
  private onSrcVideoChange(value: Blob | MediaSource | MediaStream | null) {
    if (this.changeProfileVideo) {
      this.changeProfileVideo.srcObject = value;
    }
  }

  private destroyed() {
    this.stopVideo();
  }

  private stopVideo() {
    stopVideo(this.srcVideo);
    this.srcVideo = null;
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass">
$cropper-image-path: 'cropperjs/src/images' !default
@import "cropperjs/src/index.scss"
</style>
<style lang="sass" scoped>

@import "@/assets/sass/partials/abstract_classes"

video
  position: absolute
  max-width: 35%
  max-height: 35%
  background: #555
  top: 0
  right: 0

.actions
  padding-top: 10px
  @extend %user-select-none
  font-size: 25px

  > i
    padding: 3px
    @include hover-click(#d3d4d7)

.imgHolder
  position: relative
  padding: 10px 0

img
  min-height: 150px
  min-width: 100%
  max-width: 100%
  border: 1px solid white

.drop-zone
  background-color: rgba(255, 255, 255, 0.5)
  width: 100%
  height: 200px
</style>
