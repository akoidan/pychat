<template>
  <div class="user-image-holder">
    <div class="online-marker"/>
    <img v-if="userImg" :src="userImg" :title="user.user"/>
    <div
      v-else
      :style="{'background-color': color}"
      :title="user.user"
      class="image-missing"
    >
      {{ twoLetter }}
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from "vue-property-decorator";
import {UserModel} from "@/ts/types/model";
import {resolveMediaUrl} from "@/ts/utils/htmlApi";
import loggerFactory from "@/ts/instances/loggerFactory";

@Component({name: "UserImageIcon"})
export default class UserImageIcon extends Vue {
  @Prop()
  public readonly user!: UserModel;

  public get twoLetter() {
    return this.user.user.substring(0, 2);
  }

  public get color() {
    return loggerFactory.getRandomColor(this.user.user);
  }

  public get userImg() {
    return resolveMediaUrl(this.user.image);
  }
}
</script>
<!-- eslint-disable -->
<style
  lang="sass"
  scoped
>
img, .image-missing
  width: 36px
  display: flex
  align-items: center
  justify-content: center
  height: 36px
  color: white
  border-radius: 50%

.user-image-holder
  position: relative

.online .online-marker
  background-color: green

.offline .online-marker
  background-color: #a50000

.online-marker
  /*display: none*/
  width: 10px
  height: 10px
  position: absolute
  bottom: 1px
  right: 1px
  border-radius: 50%
</style>
