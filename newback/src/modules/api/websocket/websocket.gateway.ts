import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Server} from 'ws';

@WebSocketGateway({
  path: '/ws'
})
export class WebsocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private sockets = [];

  async handleConnection(socket: WebSocket) {
    this.sockets.push(socket);
    console.log(this.sockets);

    // session_key = self.get_argument('sessionId', None)
		// user_id = self.sync_redis.hget('sessions', session_key)
		// if user_id is None:
		// 	self.logger.warning('!! Session key %s has been rejected' % session_key)
		// 	self.close(403, "Session key %s has been rejected" % session_key)
		// 	return
		// self.user_id = int(user_id)
		// try:
		// 	user_db = UserProfile.objects.get(id=self.user_id)
		// except UserProfile.DoesNotExist:
		// 	self.logger.warning('Database has been cleared, but redis %s not. Logging out current user' % session_key)
		// 	self.close(403, "This user no more longer exists")
		// 	return
		// self.ip = self.get_client_ip()
		// self.generate_self_id()
		// self.save_ip()
		// self.message_creator = WebRtcMessageCreator(self.user_id, self.id)
		// self._logger = logging.LoggerAdapter(parent_logger, {
		// 	'id': self.id,
		// 	'ip': self.ip
		// })
		// self.logger.debug("!! Incoming connection, session %s, thread hash %s", session_key, self.id)
		// self.async_redis.connect()
		// self.async_redis_publisher.sadd(RedisPrefix.ONLINE_VAR, self.id)
		// # since we add user to online first, latest trigger will always show correct online
		//
		// online = self.get_dict_users_from_redis()
		// # current user is already online
		// my_online = online.setdefault(self.user_id, [])
		// if self.id not in my_online:
		// 	my_online.append(self.id)
		//
		// user_rooms_query = Room.objects.filter(users__id=self.user_id, disabled=False) \
		// 	.values('id', 'name', 'creator_id', 'is_main_in_channel', 'channel_id', 'p2p', 'roomusers__notifications', 'roomusers__volume')
		// room_users = [{
		// 	VarNames.ROOM_ID: room['id'],
		// 	VarNames.ROOM_NAME: room['name'],
		// 	VarNames.CHANNEL_ID: room['channel_id'],
		// 	VarNames.ROOM_CREATOR_ID: room['creator_id'],
		// 	VarNames.IS_MAIN_IN_CHANNEL: room['is_main_in_channel'],
		// 	VarNames.NOTIFICATIONS: room['roomusers__notifications'],
		// 	VarNames.P2P: room['p2p'],
		// 	VarNames.VOLUME: room['roomusers__volume'],
		// 	VarNames.ROOM_USERS: []
		// } for room in user_rooms_query]
		// user_rooms_dict = {room[VarNames.ROOM_ID]: room for room in room_users}
		// channels_ids = [channel[VarNames.CHANNEL_ID] for channel in room_users if channel[VarNames.CHANNEL_ID]]
		// channels_db = Channel.objects.filter(Q(id__in=channels_ids) | Q(creator=self.user_id), disabled=False)
		// channels = [{
		// 	VarNames.CHANNEL_ID: channel.id,
		// 	VarNames.CHANNEL_NAME: channel.name,
		// 	VarNames.CHANNEL_CREATOR_ID: channel.creator_id
		// } for channel in channels_db]
		// room_ids = [room_id[VarNames.ROOM_ID] for room_id in room_users]
		// rooms_users = RoomUsers.objects.filter(room_id__in=room_ids).values('user_id', 'room_id')
		// for ru in rooms_users:
		// 	user_rooms_dict[ru['room_id']][VarNames.ROOM_USERS].append(ru['user_id'])
		// # get all missed messages
		// self.channels = room_ids  # py2 doesn't support clear()
		// self.channels.append(self.channel)
		// self.channels.append(self.id)
		// self.listen(self.channels)
		// # this was replaced to syncHistory method that's called from browser and passes existing ids
		// # off_messages, history = self.get_offline_messages(room_users, was_online, self.get_argument('history', False))
		// # for room in room_users:
		// # 	room_id = room[VarNames.ROOM_ID]
		// # 	h = history.get(room_id)
		// # 	o = off_messages.get(room_id)
		// # 	if h:
		// # 		room[VarNames.LOAD_MESSAGES_HISTORY] = h
		// # 	if o:
		// # 		room[VarNames.LOAD_MESSAGES_OFFLINE] = o
    //
  }

  @SubscribeMessage('hello') //ws.ws.send(JSON.stringify({action: 'hello'}))
  handleEvent(@MessageBody() data: string): any {
    const event = 'events';
    this.server.clients.forEach((client) => {
      client.send(JSON.stringify({event, data}));
    });
  }
}
