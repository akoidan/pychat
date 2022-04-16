import {check} from 'typend'


describe('typend', () => {

  describe('simple', () => {
    interface Message {
      roomId: 3
    }

    interface Room {
      name: string;
      messages: Message[];
    }

    it('should replace single param', () => {
      expect(() => check<Message>({})).toThrow()
    });
    it('complex', () => {
      let room: Room = {
        name: 'asd',
        messages: [
          {
            roomId: 3,
          }
        ]
      }
      check<Room>(room)
    });
    it('complex3', () => {
      interface A<T> {
        b: T;
        d: string;
      }

      check<A<number>>({
        b4: 'sf'
      })

    });
  });
});

