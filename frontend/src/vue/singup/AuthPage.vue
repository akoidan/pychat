<template>
  <div class="reg-log-container">
    <div class="topBtns">
      <router-link to="/auth/sign-up">
        Sign Up
      </router-link>
      <router-link to="/auth/login">
        Log In
      </router-link>
    </div>
    <h1>{{ regHeader }}</h1>
    <router-view/>
  </div>
</template>

<script lang='ts'>
import {
  Component,
  Vue,
} from "vue-property-decorator";
import {
  ApplyGrowlErr,
  State,
} from "@/ts/instances/storeInstance";
import {AUTO_REGISTRATION} from "@/ts/utils/consts";
import type {LoginMessage} from "@/ts/types/messages/innerMessages";

@Component({name: "AuthPage"})
export default class AuthPage extends Vue {
  @State
  public readonly regHeader!: string;

  public getRandom(): string {
    return Math.random().toString(36).
      substring(7);
  }

  @ApplyGrowlErr({message: "Auto-registration error"})
  public async created() {
    if (AUTO_REGISTRATION) {
      const {session} = await this.$api.register({
        username: this.getRandom(),
        password: this.getRandom(),
      });
      const message: LoginMessage = {
        action: "login",
        handler: "router",
        session,
      };
      this.$messageBus.notify(message);
    }
  }
}
</script>

<style lang="sass" scoped>

@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"
%top-btn-register
  border-top: 1px solid rgba(255, 255, 255, 0.6)
  border-left: 1px solid rgba(171, 171, 171, 0.83)
  text-transform: uppercase
  font: 14px Oswald
  border-radius: 0

%cyan-btn
  @include linear-gradient-hover(#BABDB6, #28D2DE, 15px, 12px)
  @extend %top-btn-register
  border-radius: 0

.reg-log-container :deep(.submit-button)
  @extend %cyan-btn
  width: 100%

  &:active
    border-bottom-color: rgba(0, 0, 0, 0)


.reg-log-container :deep(form)
  margin: auto
  text-align: center

  > *
    margin: auto
    position: relative
    width: 100%

.reg-log-container :deep(select.input)
  -webkit-appearance: none
// paddings don't work on devices like macos chrome, but work on windows

.reg-log-container
  :deep(.input)
    border-radius: 5px
    margin-bottom: 10px
    font-size: 13px
    width: calc(100% - 58px)
    padding: 15px 22px 15px 35px

  :deep(select.input)
    width: 100%


.reg-log-container :deep(input:-webkit-autofill)
  -webkit-box-shadow: 0 0 0 1000px #242400 inset !important
  -webkit-text-fill-color: #C6C6B6 !important
  color: #C6C6B6


.color-reg

  .reg-log-container ::deep(select)
    color: #79797a

  .reg-log-container :deep(.submit-button)
    border: 1px solid #000

  .reg-log-container :deep(.reg-log-container)
    input[type=button], input[type=submit]
      &:active
        padding-top: $register-buttons-vertical-pad + 1
        padding-bottom: $register-buttons-vertical-pad - 1

    [class^='icon-']
      opacity: 1
      text-shadow: none
      cursor: auto


h1
  text-align: center
  padding: 30px 0 30px 0
  font: 25px Oswald
  color: #FFF
  text-transform: uppercase
  text-shadow: #000 0 1px 5px
  margin: 0

.reg-log-container
  overflow-y: auto
  padding: 20px
  max-width: 300px
  flex-basis: 300px
  margin: auto

.topBtns
  display: flex
  flex-direction: row

  > *
    @extend %top-btn-register

    &:not(.router-link-active)
      @include linear-gradient-hover($grayish-green, #434343, 15px, 12px, #434343)
      @extend %top-btn-register
      border-radius: 0
    flex: 1
    text-align: center

.router-link-active
  @extend %cyan-btn


</style>
