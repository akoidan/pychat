<template>
  <div class="holder">
    <span>{{helpText}}</span>
    <div class="imgHolder">
      <img :src="srcImg" @drop.prevent="dropPhoto" @click="takeSnapshot">
      <video autoplay="" ref="changeProfileVideo" v-show="showVideo"></video>
    </div>
    <input accept="image/*" ref="inputFile" type="file" v-show="false" @change="photoInputChanged">
    <input type="button" class="lor-btn" value="Select file" @click="selectFile">
    <input type="button" class="lor-btn" :value="buttonText" @click="startCapturingVideo">
    <app-submit class="green-btn" value='Upload photo' @click.native="upload" :running="running"/>
  </div>
</template>
<script lang="ts">
  import {State, Action, Mutation} from "vuex-class";
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {canvasContext, resolveUrl, stopVideo} from "../../utils/htmlApi";
  import AppSubmit from '../ui/AppSubmit';
  @Component({
    components: {AppSubmit}
  })
  export default class UserProfileImage extends Vue {

    @Action growlError;
    @Action growlSuccess;
    @Action growlInfo;


    @State userImage: string;

    @Watch('userImage')
    onUserImageChange(value: string) {
      this.srcImg = resolveUrl(value);
      this.growlInfo("New image has been set");
    }

    created() {
      this.srcImg = this.userImage ? resolveUrl(this.userImage) : null;
    }

    running: boolean = false;
    srcImg: string = '';
    srcVideo: MediaStream = null;
    blob: Blob = null;
    fileInputValue: string = '';
    showVideo: boolean = false;
    isStopped: boolean = true;

    $refs: {
      inputFile: HTMLInputElement
      changeProfileVideo: HTMLVideoElement
    };

    get helpText(): string {
      return this.showVideo ? 'Click on this zone with white border to capture an image' : 'You can also drag-n-drop image on zone bellow'
    }

    get buttonText(): string {
      return this.showVideo ? 'Close webcam' : 'Make a photo from webcam';
    }

    dropPhoto(e) {
      this.logger.debug("Drop photo")();
      let file = e.dataTransfer.files[0];
      this.blob = file;
      if (file) {
        let ok = this.setPhotoFromReader(file, 'drop');
        if (ok) {
          this.$refs.inputFile.value = '';
        }
      } else {
        this.growlError("No files found in draggable object");
      }
    }

    selectFile() {
      this.logger.debug("Selecting file")();
      this.$refs.inputFile.click()
    }

    photoInputChanged(e) {
      var ok = this.setPhotoFromReader(e.target.files[0], 'input');
      if (!ok) {
        this.fileInputValue = '';
      } else {
        this.blob = e.target.files[0];
      }
    }

    setPhotoFromReader(file, type) {
      if (file && file.type && file.type.match(/image.*/)) {
        let reader = new FileReader();
        reader.onload = (e) => {
          this.srcImg = reader.result as string;
          this.growlSuccess("Photo has been rendered, click save to apply it");
        };
        reader.readAsDataURL(file);
        return true;
      } else {
        this.growlError("Invalid file type " + file.type);
        return false;
      }
    }

    @Watch('srcVideo')
    onSrcVideoChange(value) {
      if (this.$refs.changeProfileVideo) {
        this.$refs.changeProfileVideo.srcObject = value;
      }
    }

    startSharingVideo() {
      navigator.getUserMedia({video: true}, (localMediaStream: MediaStream) => {
        this.srcVideo = localMediaStream;
        this.$refs.changeProfileVideo.play();
      }, (error) => {
        this.logger.log("navigator.getUserMedia error: {}", error)();
      });
    }


    takeSnapshot() {
      if (this.srcVideo) {
        canvasContext.canvas.width = this.$refs.changeProfileVideo.videoWidth;
        canvasContext.canvas.height = this.$refs.changeProfileVideo.videoHeight;
        canvasContext.drawImage(this.$refs.changeProfileVideo, 0, 0);
        // "image/webp" works in Chrome.
        // Other browsers will fall back to image/png.
        canvasContext.canvas.toBlob((blob) => {
          this.srcImg = URL.createObjectURL(blob);
          blob['name'] = '.jpg';
          this.blob = blob;
        },  'image/jpeg', 0.95);
        this.$refs.inputFile.value = '';
        this.growlInfo('Image has been set. Click on "Finish" to hide video');
      }
    }

    destroyed() {
      this.stopVideo();
    }


    startCapturingVideo() {
      if (this.isStopped) {
        // Not showing vendor prefixes or code that works cross-browser.
        navigator.getUserMedia({video: true},  (stream)  => {
          this.srcVideo = stream;
          this.showVideo = true;
          this.isStopped = false;
          this.growlInfo("Click on your video to take a photo")
        }, (e) => {
          this.logger.error('Error while trying to capture a picture "{}"', e.message || e.name)();
          this.growlError(`Unable to use your webcam because ${e.message || e.name }`);
        });
      } else {
        this.stopVideo();
        this.growlInfo("To apply photo click on save");
        this.showVideo = false;
        this.isStopped = true;
      }
    }

    private stopVideo() {
      stopVideo(this.srcVideo);
      this.srcVideo = null;
    }

    upload() {
      if (!this.blob) {
        this.growlError("Please select image first")
      } else {
        this.running = true;
        this.$api.uploadProfileImage(this.blob, (e) => {
          this.running = false;
          if (e) {
            this.growlError(e)
          } else {
            this.growlSuccess("Image uploaded")
          }
        })
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
