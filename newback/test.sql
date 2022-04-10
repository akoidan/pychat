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
	zip varchar(32) null,
	timezone varchar(32) null,
	constraint id
		unique (id),
	constraint ip
		unique (ip)
);

create or replace table channel
(
	id int auto_increment
		primary key,
	name varchar(16) not null,
	creator_id int null,
	constraint id
		unique (id)
);

create or replace table user
(
	id int auto_increment
	  primary key (id),
	last_time_online datetime not null,
	username varchar(16) not null,
	sex enum('MALE', 'FEMALE', 'OTHER') default 'OTHER' not null,
	thumbnail varchar(100) null,
	constraint id
		unique (id),
	constraint username
		unique (username)
);

create or replace table room
(
	id int auto_increment
	    primary key,
	name varchar(16) null,
	is_main_in_channel tinyint(1) default 0 not null,
	p2p tinyint(1) default 0 not null,
	channel_id int null,
	creator_id int null,
	constraint id
		unique (id)
);

create or replace table message
(
	id int auto_increment,
	sender_id int not null,
	room_id int not null,
	time datetime not null,
	content longtext null,
	giphy varchar(255) null,
	symbol varchar(1) null,
	message_status enum('ON_SERVER', 'READ', 'RECEIVED') not null,
	thread_message_count int default 0 not null,
	parent_message_id int null,
	constraint id
		unique (id)
);

create or replace table image
(
	id int auto_increment
	    primary key,
	type enum('VIDEO', 'IMAGE', 'GIPHY') not null,
	symbol varchar(1) not null,
	message_id int not null,
	img varchar(255) null,
	preview varchar(255) null,
	absolute_url varchar(255) null,
	webp_asbolute_url varchar(255) null,
	constraint id
		unique (id),
	constraint unique_image_symbol_message
		unique (symbol, message_id)
);

create or replace table message_history
(
	id int auto_increment
	    primary key,
	message_id int not null,
	time datetime not null,
	content longtext not null,
	constraint id
		unique (id)
);

create or replace table message_mention
(
	id int not null
	    primary key,
	user_id int not null,
	message_id int not null,
	symbol varchar(1) not null,
	constraint id
		unique (id),
	constraint unique_message_mention_user_id_symbol_message_id
		unique (user_id, message_id, symbol)
);

create or replace table room_user
(
	id int auto_increment
	    primary key,
	room_id int not null,
	user_id int not null,
	volume int default 2 not null,
	notifications tinyint(1) default 1 not null,
	constraint id
		unique (id),
	constraint unique_room_user_room_id_user_id
		unique (room_id, user_id)
);

create or replace table subscription
(
	id int auto_increment
	    primary key,
	user_id int not null,
	registration_id varchar(255) not null,
	agent varchar(64) null,
	is_mobile tinyint(1) default 0 not null,
	ip_id int null,
	constraint id
		unique (id),
	constraint registration_id
		unique (registration_id)
);

create or replace table subscription_message
(
	id int auto_increment
	    primary key (id),
	subscription_id int not null,
	message_id int not null,
	received tinyint(1) default 0 not null,
	constraint id
		unique (id),
	constraint unique_subscription_message_subscription_id_message_id
		unique (subscription_id, message_id)
);

create or replace table uploaded_file
(
	id int auto_increment
	    primary key,
	type enum('VIDEO', 'FILE', 'MEDIA_RECORD', 'AUDIO_RECORD', 'IMAGE', 'PREVIEW', 'ISSUE') not null,
	symbol varchar(1) not null,
	user_id int not null,
	file varchar(255) not null,
	constraint id
		unique (id)
);

create or replace table user_joined_info
(
	id int auto_increment,
	ip_id int not null,
	user_id int not null,
	time datetime not null,
	constraint id
		unique (id),
	constraint unique_user_joined_info_user_id_ip_id
		unique (ip_id, user_id)
);

create or replace table verification
(
	id int auto_increment,
	type enum('REGISTER', 'PASSWORD', 'EMAIL', 'CONFIRM_EMAIL') not null,
	token varchar(17) not null,
	user_id int not null,
	time datetime not null,
	verified tinyint(1) default 0 not null,
	email varchar(190) null,
	constraint id
		unique (id)
);

create or replace table user_auth
(
	id int not null
	    primary key (id),
	password varchar(255) not null,
	email varchar(255) null,
	facebook_id varchar(255) null,
	google_id datetime null,
	email_verification_id datetime null,
	constraint email
		unique (email),
	constraint facebook_id
		unique (facebook_id),
	constraint google_id
		unique (google_id),
	constraint id
		unique (id)
);

create or replace table user_settings
(
	id int not null,
	suggestions tinyint(1) default 1 not null,
	show_when_im_typing tinyint(1) default 1 not null,
	embedded_youtube tinyint(1) default 1 not null,
	highlight_code tinyint(1) default 1 not null,
	message_sound tinyint(1) default 0 not null,
	incoming_file_call_sound tinyint(1) default 0 not null,
	online_change_messages tinyint(1) default 0 not null,
	devtools_logs enum('log_raise_error', 'log_with_warnings', 'trace', 'debug', 'info', 'warn', 'error', 'disable') default 'error' not null,
	theme enum('COLOR_LOR', 'COLOR_REG', 'COLOR_WHITE') default 'COLOR_REG' not null,
	constraint id
		unique (id)
);

create or replace table user_profile
(
	id int not null,
	name varchar(30) null,
	city varchar(50) null,
	surname varchar(30) null,
	birthday datetime not null,
	contacts varchar(100) null,
	constraint id
		unique (id)
);
