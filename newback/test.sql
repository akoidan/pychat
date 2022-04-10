create or replace table ip_address
(
	id int auto_increment
		primary key,
	ip varchar(32) not null,
	isp varchar(255) null,
	country_code varchar(16) null,
	country varchar(64) null,
	region varchar(64) null,
	city varchar(64) null,
	lat double null,
	lon double null,
	timezone varchar(32) null,
	zip varchar(32) null,
	constraint ip
		unique (ip)
);

create or replace table channel
(
	id int auto_increment
		primary key,
	name varchar(16) not null,
	disabled tinyint(1) not null,
	creator_id int null,
	constraint channel_creator_id_33ad2cf9_fk_user_id
		foreign key (creator_id) references user (id)
);

create or replace table user
(
	id int auto_increment
		primary key,
	password varchar(128) not null,
	last_login datetime(6) null,
	username varchar(30) not null,
	sex smallint not null,
	last_time_online bigint not null,
	thumbnail varchar(100) null,
	constraint username
		unique (username)
);

create or replace table room
(
	id int auto_increment
		primary key,
	name varchar(16) null,
	disabled tinyint(1) not null,
	channel_id int null,
	creator_id int null,
	p2p tinyint(1) not null,
	is_main_in_channel tinyint(1) not null,
	constraint room_channel_id_1cc2c458_fk_channel_id
		foreign key (channel_id) references channel (id),
	constraint admin_should_not_be_define_for_private_rooms
		check (`creator_id` is null or `name` is not null),
	constraint channel_should_exist_for_public_room_and_not_exist_for_private
		check (`channel_id` is null and `name` is null or `channel_id` is not n),
	constraint p2p_only_if_private
		check (`p2p` = 0x00 or `name` is null)
);

create or replace table message
(
	id int auto_increment
		primary key,
	time bigint not null,
	content longtext null,
	deleted tinyint(1) not null,
	room_id int null,
	sender_id int not null,
	symbol varchar(1) null,
	parent_message_id int null,
	thread_messages_count int not null,
	message_status varchar(1) not null,
	updated_at bigint not null,
	constraint message_parent_message_id_d802c014_fk_message_id
		foreign key (parent_message_id) references message (id),
	constraint message_room_id_5e7d8d78_fk_room_id
		foreign key (room_id) references room (id),
	constraint message_sender_id_991c686c_fk_user_id
		foreign key (sender_id) references user (id)
);

create or replace table image
(
	id int auto_increment
		primary key,
	symbol varchar(1) not null,
	img varchar(100) null,
	message_id int not null,
	type varchar(1) not null,
	preview varchar(100) null,
	absolute_url varchar(256) null,
	webp_absolute_url varchar(256) null,
	constraint image_symbol_9053baa1_uniq
		unique (symbol, message_id),
	constraint image_message_id_a830600f_fk_message_id
		foreign key (message_id) references message (id)
);

create or replace index image_4ccaa172
	on image (message_id);

create or replace index message_8273f993
	on message (room_id);

create or replace index message_924b1846
	on message (sender_id);

create or replace table messagehistory
(
	id int auto_increment
		primary key,
	time bigint not null,
	content longtext null,
	message_id int not null,
	constraint messagehistory_message_id_c977822c_fk_message_id
		foreign key (message_id) references message (id)
);

create or replace index messagehistory_4ccaa172
	on messagehistory (message_id);

create or replace table messagemention
(
	id int auto_increment
		primary key,
	symbol varchar(1) not null,
	message_id int not null,
	user_id int not null,
	constraint messagemention_user_id_symbol_message_id_274aa34f_uniq
		unique (user_id, symbol, message_id),
	constraint messagemention_message_id_b6e62a99_fk_message_id
		foreign key (message_id) references message (id),
	constraint messagemention_user_id_0f24d154_fk_user_id
		foreign key (user_id) references user (id)
);

create or replace table room_users
(
	id int auto_increment
		primary key,
	room_id int not null,
	user_id int not null,
	notifications tinyint(1) not null,
	volume int not null,
	constraint room_users_user_id_0dabcfd3_uniq
		unique (user_id, room_id),
	constraint room_users_room_id_4cd79c94_fk_room_id
		foreign key (room_id) references room (id),
	constraint room_users_user_id_c5cabb53_fk_user_id
		foreign key (user_id) references user (id)
);

create or replace index room_users_e8701ad4
	on room_users (user_id);

create or replace table subscription
(
	id int auto_increment
		primary key,
	registration_id varchar(255) not null,
	created datetime(6) not null,
	user_id int not null,
	inactive tinyint(1) not null,
	updated datetime(6) not null,
	agent varchar(64) null,
	ip_id int null,
	is_mobile tinyint(1) not null,
	constraint subscription_registration_id_fd25046a_uniq
		unique (registration_id),
	constraint subscription_ip_id_45c6c92c_fk_ip_address_id
		foreign key (ip_id) references ip_address (id),
	constraint subscription_user_id_edfece9c_fk_user_id
		foreign key (user_id) references user (id)
);

create or replace table subscription_message
(
	id int auto_increment
		primary key,
	received tinyint(1) not null,
	message_id int not null,
	subscription_id int not null,
	constraint subscription_message_message_id_2c6bf5e5_uniq
		unique (message_id, subscription_id),
	constraint subscripti_subscription_id_ab1157b0_fk_subscription_id
		foreign key (subscription_id) references subscription (id),
	constraint subscription_message_message_id_2abd0a63_fk_message_id
		foreign key (message_id) references message (id)
);

create or replace index subscription_41ba5632
	on subscription (ip_id);



create or replace index subscription_message_ef42673f
	on subscription_message (subscription_id);

create or replace table uploadedfile
(
	id int auto_increment
		primary key,
	symbol varchar(1) not null,
	file varchar(100) null,
	type varchar(1) not null,
	user_id int not null,
	constraint uploadedfile_user_id_56d2aaff_fk_user_id
		foreign key (user_id) references user (id)
);

create or replace table user_joined_info
(
	id int auto_increment
		primary key,
	time date not null,
	ip_id int null,
	user_id int null,
	constraint user_joined_info_user_id_0166fb0d_uniq
		unique (user_id, ip_id),
	constraint user_joined_info_ip_id_a9fbb839_fk_ip_address_id
		foreign key (ip_id) references ip_address (id),
	constraint user_joined_info_user_id_878c60fb_fk_user_id
		foreign key (user_id) references user (id)
);

create or replace index user_joined_info_e8701ad4
	on user_joined_info (user_id);

create or replace table verification
(
	id int auto_increment
		primary key,
	type varchar(1) not null,
	token varchar(17) not null,
	time datetime(6) not null,
	verified tinyint(1) not null,
	user_id int not null,
	email varchar(190) null,
	constraint verification_user_id_29c67465_fk_user_id
		foreign key (user_id) references user (id)
);

create or replace table userprofile
(
	user_ptr_id int not null
		primary key,
	name varchar(30) null,
	surname varchar(30) null,
	email varchar(190) null,
	city varchar(50) null,
	birthday date null,
	contacts varchar(100) null,
	photo varchar(100) null,
	suggestions tinyint(1) not null,
	logs varchar(16) not null,
	email_verification_id int null,
	embedded_youtube tinyint(1) not null,
	highlight_code tinyint(1) not null,
	incoming_file_call_sound tinyint(1) not null,
	message_sound tinyint(1) not null,
	online_change_sound tinyint(1) not null,
	theme varchar(16) not null,
	send_logs tinyint(1) not null,
	facebook_id varchar(30) null,
	google_id varchar(190) null,
	show_when_i_typing tinyint(1) not null,
	constraint email
		unique (email),
	constraint facebook_id
		unique (facebook_id),
	constraint google_id
		unique (google_id),
	constraint user_email_verification_id_ac9497db_fk_verification_id
		foreign key (email_verification_id) references verification (id),
	constraint userprofile_user_ptr_id_1b06aa47_fk_user_id
		foreign key (user_ptr_id) references user (id)
);

create or replace index userprofile_fef41692
	on userprofile (email_verification_id);

create or replace index verification_e8701ad4
	on verification (user_id);

