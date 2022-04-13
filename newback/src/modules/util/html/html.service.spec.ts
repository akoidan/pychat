import {HtmlService} from '@/modules/util/html/html.service';

describe('HtmlService', () => {

  describe('replaceTemplate', () => {
    it('should replace single param', () => {
      let service = new HtmlService();
      let result = service.replaceTemplate('aa {{ blah }} bbbb', {blah: 3})
      expect(result).toEqual('aa 3 bbbb');
    });

    it('should replace multiple params', () => {
      let service = new HtmlService();
      let result = service.replaceTemplate('aa {{ blah }} {{koko}}', {blah: 3, koko: 4})
      expect(result).toEqual('aa 3 4');
    });

    it('should not fail when empty', () => {
      let service = new HtmlService();
      let result = service.replaceTemplate('aa', {})
      expect(result).toEqual('aa');
    });

    it('should throw an exception when param is missing', () => {
      let service = new HtmlService();
      expect(() => service.replaceTemplate('aa {{ adas }}', {blah: 4})).toThrow(Error("Unable to render template. 'adas' is missing in {\"blah\":4}"))
    });
  });
});
