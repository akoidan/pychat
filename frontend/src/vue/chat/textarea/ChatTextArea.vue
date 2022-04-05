<template>
  <div class="userMessageWrapper">
    <chat-attachments
      v-if="showAttachments"
      :edit-message-id="editMessageId"
      :room-id="roomId"
      :thread-message-id="threadMessageId"
      @close="showAttachments = false"
      @upload-file="pasteFilesToTextArea"
      @upload-image="pasteImagesToTextArea"
      @add-audio="addAudio"
      @add-video="addVideo"
      @add-giphy="addGiphy"
    />
    <smiley-holder v-if="showSmileys" @close="showSmileys = false" @add-smiley="onEmitAddSmile"/>
    <chat-tagging
      ref="chatTagging"
      :name="taggingName"
      :user-ids="room.users"
      @emit-name="addTagInfo"
    />
    <giphy-search v-if="showGiphy" @close="showGiphy = false" @add-gihpy="onEmitGiphy"/>
    <media-recorder
      ref="mediaRecorder"
      :is-video="isRecordingVideo"
      @audio="handleAddAudio"
      @video="handleAddVideo"
    />
    <div>
      <i
        v-if="isMobile"
        class="icon-paper-plane"
        title="Send this message"
        @mousedown.prevent="sendMessage"
      />
      <i
        class="icon-attach-outline"
        title="Add attachment"
        @mousedown.prevent="invertAttachments"
      />
      <i
        class="icon-smile"
        title="Add a smile :)"
        @mousedown.prevent="invertSmileys"
      />
      <div
        ref="userMessage"
        :class="{'mobile-user-message': isMobile}"
        class="usermsg input"
        contenteditable="true"
        @keydown="onTextAreaKeyDown"
        @keyup="onTextAreaKeyUp"
        @paste="onImagePaste"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component,
  Prop,
  Ref,
  Vue,
  Watch,
} from "vue-property-decorator";
import {
  createTag,
  encodeHTML,
  encodeP,
  getCurrentWordInHtml,
  getGiphyHtml,
  getMessageData,
  pasteBlobAudioToTextArea,
  pasteBlobToContentEditable,
  pasteBlobVideoToTextArea,
  pasteFileToTextArea,
  pasteHtmlAtCaret,
  pasteImgToTextArea,
  placeCaretAtEnd,
  replaceCurrentWord,
  savedFiles,
  timeToString,
} from "@/ts/utils/htmlApi";
import type {
  EditingMessage,
  MessageModel,
  PastingTextAreaElement,
  UserModel,
} from "@/ts/types/model";
import {
  CurrentUserInfoModel,
  CurrentUserSettingsModel,
  RoomDictModel,
  RoomModel,
  UserDictModel,
} from "@/ts/types/model";
import {State} from "@/ts/instances/storeInstance";

import type {
  MessageDataEncode,
  MessageSender
} from "@/ts/types/types";
import {
  editMessageWs,
  showAllowEditing,
} from "@/ts/utils/pureFunctions";
import MediaRecorder from "@/vue/chat/textarea/MediaRecorder.vue";
import ChatAttachments from "@/vue/chat/textarea/ChatAttachments.vue";
import SmileyHolder from "@/vue/chat/textarea/SmileyHolder.vue";
import {isMobile} from "@/ts/utils/runtimeConsts";
import {
  SHOW_I_TYPING_INTERVAL,
  USERNAME_REGEX,
} from "@/ts/utils/consts";
import ChatTagging from "@/vue/chat/textarea/ChatTagging.vue";
import {Throttle} from "@/ts/classes/Throttle";
import GiphySearch from "@/vue/chat/textarea/GiphySearch.vue";
import type {GIFObject} from "giphy-api";

const timePattern = /^\(\d\d:\d\d:\d\d\)\s\w+:.*&gt;&gt;&gt;\s/;

@Component({
  name: "ChatTextArea",
  components: {
    ChatTagging,
    SmileyHolder,
    GiphySearch,
    ChatAttachments,
    MediaRecorder
  }
})
export default class ChatTextArea extends Vue {
  @State
  public readonly userInfo!: CurrentUserInfoModel;

  @State
  public readonly userSettings!: CurrentUserSettingsModel;

  @State
  public readonly myId!: number;

  @Prop({default: null})
  public readonly editMessageId!: number;

  @Prop({default: null})
  public readonly threadMessageId!: number;

  @Prop()
  public readonly roomId!: number;

  @Ref()
  public userMessage!: HTMLElement;

  @Ref()
  public mediaRecorder!: MediaRecorder;

  @Ref()
  public chatTagging!: ChatTagging;

  @State
  public readonly allUsersDict!: UserDictModel;

  @State
  public readonly roomsDict!: RoomDictModel;

  @State
  public readonly pastingTextAreaQueue!: PastingTextAreaElement[];

  @State
  public readonly activeRoom!: RoomModel;

  public showAttachments: boolean = false;

  public showSmileys: boolean = false;

  public showGiphy: boolean = false;

  public taggingName: string = "";

  public isRecordingVideo: boolean = true;

  private showIType!: Throttle;

  get room(): RoomModel {
    return this.roomsDict[this.roomId];
  }

  get isMobile() {
    return isMobile;
  }

  get editMessage(): MessageModel | null {
    if (this.editMessageId) {
      return this.room.messages[this.editMessageId];
    }
    return null;
  }

  get threadMesage(): MessageModel | null {
    if (this.threadMessageId) {
      return this.room.messages[this.threadMessageId];
    }
    return null;
  }

  get messageSender(): MessageSender { // Todo does vuew cache this?
    return this.$messageSenderProxy.getMessageSender(this.roomId);
  }

  public async mounted() {
    // Do not spam ws every type user types something, wait 10s at least
    this.showIType = new Throttle(() => {
      this.$ws.showIType(this.roomId);
    }, SHOW_I_TYPING_INTERVAL); // Every 10s
    if (this.editMessage) {
      this.userMessage.innerHTML = await encodeP(this.editMessage, this.$store, this.$smileyApi);
      placeCaretAtEnd(this.userMessage);
    }
  }

  public onEmitDropPhoto(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.$logger.debug("loop")();
      const file = files[i];
      if (file.type.includes("image")) {
        pasteImgToTextArea(file, this.userMessage, (err: string) => {
          this.$store.growlError(err);
        });
      } else {
        this.$webrtcApi.sendFileOffer(file, this.roomId, this.threadMessageId);
      }
    }
  }

  addTagInfo(user: UserModel) {
    const tag = createTag(user);
    replaceCurrentWord(this.userMessage, tag);
    this.taggingName = "";
  }

  onEmitGiphy(gif: GIFObject) {
    this.showGiphy = false;
    this.$logger.log("Adding giphy {}", gif)();
    pasteHtmlAtCaret(getGiphyHtml(gif), this.userMessage);
  }

  async onEmitAddSmile(code: string) {
    this.$logger.log("Adding smiley {}", code)();
    pasteHtmlAtCaret(await this.$smileyApi.getSmileyHtml(code), this.userMessage);
  }

  async onEmitQuote(message: MessageModel) {
    this.userMessage.focus();
    let oldValue = this.userMessage.innerHTML;
    const match = timePattern.exec(oldValue);
    const user = this.allUsersDict[message.userId];
    oldValue = match ? oldValue.substr(match[0].length + 1) : oldValue;
    // TODO refactor quote
    this.userMessage.innerHTML = `${encodeHTML(`(${timeToString(message.time)}) ${user.user}: `) + await encodeP(message, this.$store, this.$smileyApi) + encodeHTML(" >>>") + String.fromCharCode(13)} ${oldValue}`;
    placeCaretAtEnd(this.userMessage);
  }

  @Watch("pastingTextAreaQueue")
  onBlob() {
    if (this.pastingTextAreaQueue.length > 0) {
      this.pastingTextAreaQueue.forEach((id) => {
        if (id.elType === "blob" && id.openedThreadId == this.threadMessageId && id.roomId == this.roomId && id.editedMessageId === this.editMessageId) {
          this.$logger.log("Pasting blob {}", savedFiles[id.content])();
          pasteBlobToContentEditable(savedFiles[id.content], this.userMessage);
          delete savedFiles[id.content];
          this.$store.setPastingQueue(this.pastingTextAreaQueue.filter((el) => el != id));
        }
      });
      placeCaretAtEnd(this.userMessage);
    }
  }

  onTextAreaKeyUp(event: KeyboardEvent) {
    const content: string = this.userMessage.textContent!;
    this.taggingName = "";
    if (content.includes("@")) {
      const currentWord = getCurrentWordInHtml(this.userMessage);
      if (currentWord === "@" || new RegExp(`^@${USERNAME_REGEX}$`).test(currentWord)) {
        this.taggingName = currentWord;
      }
    }
  }

  public onTextAreaKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      if (isMobile) {
        // Do not block multiple lines on mobile, let user use button to send
        return;
      }
      event.preventDefault();
      if (this.chatTagging.currentSelected) {
        this.chatTagging.confirm();
      } else {
        this.sendMessage();
      }
    } else if (event.key === "Escape") { // 27 = escape
      this.cancelCurrentAction();
    } else if (event.key === "ArrowUp" && this.userMessage.innerHTML == "") {
      event.preventDefault();
      event.stopPropagation(); // Otherwise up event would be propaganded to chatbox which would lead to load history
      this.setEditedMessage();
    } else if (this.taggingName && ["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "ArrowUp") {
        this.chatTagging.upArrow();
      } else if (event.key == "ArrowDown") {
        this.chatTagging.downArrow();
      }
    } else if (this.userSettings.showWhenITyping) {
      this.showIType.fire();
    }
  }

  public sendMessage() {
    this.$logger.debug("Checking sending message")();
    if (this.editMessage) {
      const md: MessageDataEncode = getMessageData(this.userMessage, this.editMessage!);
      editMessageWs(
        md.messageContent,
        this.editMessage.id,
        this.roomId,
        md.currSymbol,
        md.files,
        md.tags,
        this.editMessage.time,
        this.editMessage.edited ? this.editMessage.edited + 1 : 1,
        this.editMessage.parentMessage,
        this.$store,
        this.messageSender,
      );
      this.$store.setEditedMessage({
        roomId: this.roomId,
        isEditingNow: false,
        messageId: this.editMessage.id,
      });
    } else {
      const md: MessageDataEncode = getMessageData(this.userMessage, undefined);
      if (!md.messageContent) { // && !md.files.length // but file content is emppty is symbols are not present
        return;
      }
      editMessageWs(
        md.messageContent,
        this.$messageSenderProxy.getUniqueNegativeMessageId(),
        this.roomId,
        md.currSymbol,
        md.files,
        md.tags,
        Date.now(),
        0,
        this.threadMessageId ?? null,
        this.$store,
        this.messageSender,
      );
    }
  }

  public pasteImagesToTextArea(files: File[] | FileList) {
    this.showAttachments = false;
    for (let i = 0; i < files.length; i++) {
      pasteImgToTextArea(files[i], this.userMessage, (err: string) => {
        this.$store.growlError(err);
      });
    }
  }

  public invertAttachments() {
    this.showSmileys = false;
    this.showGiphy = false;
    this.showAttachments = !this.showAttachments;
  }

  public invertSmileys() {
    this.showSmileys = !this.showSmileys;
    this.showGiphy = false;
    this.showAttachments = false;
  }

  public addGiphy() {
    this.showGiphy = true;
    this.showSmileys = false;
    this.showAttachments = false;
  }

  public addVideo() {
    this.isRecordingVideo = true;
    this.mediaRecorder.startRecord();
  }

  public addAudio() {
    this.isRecordingVideo = false;
    this.mediaRecorder.startRecord();
  }

  public pasteFilesToTextArea(files: File[] | FileList) {
    this.showAttachments = false;
    for (let i = 0; i < files.length; i++) {
      pasteFileToTextArea(files[i], this.userMessage, (err: string) => {
        this.$store.growlError(err);
      });
    }
  }

  public onImagePaste(evt: ClipboardEvent) {
    let preventDefault = false;
    if (evt.clipboardData?.files?.length) {
      this.$logger.debug("Clipboard has {} files", evt.clipboardData!.files.length)();
      for (let i = 0; i < evt.clipboardData!.files.length; i++) {
        const file = evt.clipboardData!.files[i];
        this.$logger.debug("loop {}", file)();
        if (file.type.includes("image")) {
          preventDefault = true;
          pasteImgToTextArea(file, this.userMessage, (err: string) => {
            this.$store.growlError(err);
          });
        }
      }
    }
    if (preventDefault) {
      evt.preventDefault();
    }
  }

  public handleAddAudio(file: Blob) {
    if (file) {
      pasteBlobAudioToTextArea(file, this.userMessage);
    }
  }

  public handleAddVideo(file: Blob) {
    if (file) {
      pasteBlobVideoToTextArea(file, this.userMessage, "m", (e: string) => {
        this.$store.growlError(e);
      });
    }
  }

  private setEditedMessage() {
    const {messages} = this.activeRoom;
    if (Object.keys(messages).length > 0) {
      let latestMessage: MessageModel | null = null;
      for (const m in messages) {
        if (messages[m].userId == this.myId && !messages[m].deleted && (!latestMessage || messages[m].time >= latestMessage.time)) {
          latestMessage = messages[m];
        }
      }
      if (!showAllowEditing(latestMessage!)) {
        return;
      }
      const newlet: EditingMessage = {
        messageId: latestMessage!.id,
        isEditingNow: true,
        roomId: latestMessage!.roomId,
      };
      this.$store.setEditedMessage(newlet);
    }
  }

  private cancelCurrentAction() {
    if (this.editMessageId) {
      this.userMessage.innerHTML = "";
      this.$store.setEditedMessage({
        messageId: this.editMessageId,
        isEditingNow: false,
        roomId: this.roomId,
      });
    } else if (this.threadMessageId) {
      this.$store.setCurrentThread({
        roomId: this.roomId,
        isEditingNow: false,
        messageId: this.threadMessageId,
      });
    } else if (this.showSmileys) { // Do not cancel all at once, cancel one by one
      this.showSmileys = false;
    }
  }
}
</script>
<!-- eslint-disable -->
<style lang="sass" scoped>


@import "@/assets/sass/partials/mixins"
@import "@/assets/sass/partials/variables"
@import "@/assets/sass/partials/abstract_classes"

.userMessageWrapper
  padding: 8px
  position: relative
  width: calc(100% - 16px)

  .icon-attach-outline
    @extend %chat-icon
    left: 15px

  .icon-paper-plane
    @extend %chat-icon
    right: 40px

  .icon-smile
    @extend %chat-icon
    right: 10px

  .icon-picture
    @extend %chat-icon
    left: 15px

.color-white .userMessageWrapper
  :deep(.usermsg)
    background-color: white

  :deep(.icon-picture), :deep(.icon-smile), :deep(.icon-webrtc-video)
    color: #7b7979


.usermsg :deep(img[alt])
//smile
   @extend %img-code

.usermsg :deep(.emoji)
  width: $emoji-width

.usermsg.mobile-user-message
  padding-right: 50px
// before smiley and send

.usermsg :deep(.tag-user)
  color: #729fcf !important

.usermsg
  z-index: 2
  margin-left: 4px
  padding-left: 25px
  color: #c1c1c1
  padding-right: 20px
  // before smiley
  max-height: 200px

  /*fallback
  max-height: 30vh
  min-height: 1.15em

  /*Firefox
  overflow-y: auto
  white-space: pre-wrap

  :deep(.B4j2ContentEditableImg), :deep(.giphy-img)
    max-height: 200px
    max-width: 400px

    &.failed
      min-width: 200px
      min-height: 100px

  :deep(.audio-record)
    height: 50px

  :deep(.uploading-file)
    height: 50px

  :deep(*)
    background-color: transparent !important
    color: inherit !important
    font-size: inherit !important
    font-family: inherit !important
    cursor: inherit !important
    font-weight: inherit !important
    margin: 0 !important
    padding: 0 !important
</style>
