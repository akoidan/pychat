<template>
  <div class="modal-wrapper">
    <slot/>
  </div>
</template>

<!-- eslint-disable -->
<style lang="sass" scoped>

.modal-wrapper
  position: absolute
  display: flex
  left: 0
  top: 0
  right: 0
  z-index: 3
  bottom: 0
  background-color: rgba(0, 0, 0, 0.3)
</style>
