import type { Logger } from 'lines-logger';
import loggerFactory from '@/ts/instances/loggerFactory';
import type { ComponentOptions } from 'vue';

export const loggerMixin = {
  computed: {
    $logger(this: ComponentOptions): Logger {
      if (!this.__logger && this.$options._componentTag !== 'router-link') {
        let name = this.$options.name;
        if (['RouterView', 'RouterLink'].includes(name)) {
          return null;
        }
        const fileName = this.$options.__file;
        if (!name) {
          name = fileName.substr(fileName.lastIndexOf('/')+1, fileName.lastIndexOf('.') - fileName.lastIndexOf('/')-1);
        }
        if (!name) {
          name = 'vue-comp'
        }
        if (this.id) {
          name += `:${this.id}`;
        }
        this.__logger = loggerFactory.getLoggerColor(name, '#35495e');
      }
      return this.__logger;
    }
  },
  updated: function (this: Vue): void {
    this.$logger && this.$logger.debug('Updated')();
  },
  created: function (this: Vue) {
    this.$logger && this.$logger.debug('Created')();
  }
};

