* [Development setup](#development-setup)
   * [Install OS packages](#install-os-packages)
     * [Windows](#windows)
     * [Ubuntu](#ubuntu)
     * [Archlinux](#archlinux)
     * [CentOs](#centos)
   * [Bootstrap files](#bootstrap-files)
   * [Configure Pycharm if you use it](#configure-pycharm-if-you-use-it)
   * [Start services and run](#start-services-and-run)
* [Production setup](#production-setup)
   * [Archlinux prod](#archlinux-prod)
   * [CentOs prod](#centos-prod)
* [Docker](#docker)
 
Further instructions assume you already cloned the repo, and `cd` into it.

## Development setup
The flow is the following
 - Install OS packages depending on your OS type
 - Bootstrap files
 - Follow instructions in [fe](fe/README.md)
 - Start services and check if it works

### Install OS packages
This section depends on the OS you use. I tested full install on Windows/Ubuntu/CentOs/Archlinux/Archlinux(rpi2 armv7). [pychat.org](https://pychat.org) currently runs on Archlinux rpi2.

#### [Windows](https://www.microsoft.com/en-us/download/windows.aspx):
 1. Install [python](https://www.python.org/downloads/) with pip. Any version **Python2.7** or **Python 3.x** both are supported.
 2. Add **pip** and **python** to `PATH` variable.
 3. Install [redis](https://github.com/MSOpenTech/redis/releases). Get the newest version or at least 2.8.
 5. Install [mysql](http://dev.mysql.com/downloads/mysql/). You basically need mysql server and python connector.
 6. You also need to install python's **mysqlclient**. If you want to compile one yourself you need to **vs2015** tools. You can download [visual-studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) and install [Common Tools for Visual C++ 2015](http://i.stack.imgur.com/J1aet.png). You need to run setup as administrator. The only connector can be found [here](http://dev.mysql.com/downloads/connector/python/). The wheel (already compiled) connectors can be also found here [Mysqlclient](http://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient). Use `pip` to install them.
 7. Add bash commands to `PATH` variable. **Cygwin** or **git's** will do find.(for example if you use only git **PATH=**`C:\Program Files\Git\usr\bin;C:\Program Files\Git\bin`). Also add there new environment variable `PYCHAT_CONFIG=local`

#### [Ubuntu](http://www.ubuntu.com/):
 1. Install required packages: `apt-get install python pip mysql-server` If pip is missing check `python-pip`.
 2. Install **redis** database: `add-apt-repository -y ppa:rwky/redis; apt-get install -y redis-server`
 3. `export PYCHAT_CONFIG=local`. You can add it to `/etc/bash.bashrc` or the shell you use.

#### [Archlinux](https://www.archlinux.org/):
 1. With py3:  `pacman -S unzip python python-pip redis mariadb python-mysqlclient`. For py2 use `extra/mysql-python`
 2. If you just installed mariadb you need to initialize it: `mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql`.
 3. `export PYCHAT_CONFIG=local`. You can add it to `/etc/bash.bashrc` or the shell you use.

### Bootstrap files:
 1. I use 2 git repos in 2 project directory. So you probably need to rename `excludeMAIN`file to `.gitignore`or create link to exclude. `ln -rsf .excludeMAIN .git/info/exclude`
 2. Rename [chat/settings_example.py](chat/settings_example.py) to `chat/settings.py`. Modify file according to the comments in it.
 3. Install VirtualEnv if you don't have it. `pip install virtualenv`. 
 4. Create virtualEnv `virtualenv --system-site-packages .venv` and activate it: `source .venv/bin/activate`
 5. Install python packages with `pip install -r requirements.txt`.
 6. Create database: `echo "create database pychat CHARACTER SET utf8 COLLATE utf8_general_ci" | mysql`.If you need to add remote access to mysql: `CREATE USER 'root'@'192.168.1.0/255.255.255.0';` `GRANT ALL ON * TO root@'192.168.1.0/255.255.255.0';`
 7. Fill database with tables: `./manage.py init_db && ./manage.py sync_db`
 8. Populate project files: `sh download_content.sh all`

### Configure Pycharm if you use it:
 1. Enable django support. Go to Settings -> Django -> Enable django support. 
   - Django project root: root directory of your project. Where .git asides.
   - Put `Settings:` to `chat/settings.py`
   - 'Environment variables: `PYCHAT_CONFIG=local`
 2. `Settings` -> `Project pychat` -> `Project Interpreter` -> `Cogs in right top` -> 'Add' -> `Virtual Environment` -> `Existing environment` -> `Interpereter` = `pychatdir/.venv/bin/python`. Click ok. In previous menu on top 'Project interpreter` select the interpriter you just added.
 3. `Settings` -> `Project: pychat` -> `Project structure`
  - You might want to exclude: `.idea`, `chat/static/css`
  - mark `templates` directory as `Template Folder`
 4. Add start scripts:
 - Add server script: `Run` -> `Edit configuration` ->  `Django server` -> Checkbox `Custom run command` `runsslserver` . Leave port 8000 as it it. Click on Environment Variable and set `PYCHAT_CONFIG=local`
 - Add tornado script: `Run` -> `Edit configuration` ->  `Django server` -> Checkbox `Custom run command` `start_tornado`. Remove port value. Click on Environment Variable and set `PYCHAT_CONFIG=local`


### Start services and run:
 - Start `mysql` server if it's not started.
 - Start session holder: `redis-server`
 - Start webSocket listener: `python manage.py start_tornado`
 - Start the Chat: `python manage.py runsslserver 0.0.0.0:8000`
 - Open in browser [http**s**://127.0.0.1:8080](https://127.0.0.1:8080).
 - Add self signed ssl certificate provided by [django-sslserver](https://github.com/teddziuba/django-sslserver/blob/master/sslserver/certs/development.crt) to browser exception. For chrome you can enable invalid certificates for localohost in [chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost). Or for others open [https://localhost:8888](https://localhost:8888) and [https://localhost:8000](https://localhost:8000). Where `8888` is `API_PORT` and `8000` is `manage.py` argument.

## Production setup
Further instructions assume that you're executing them from project directory. First of of you need to install packages for Archlinux/CentOS and then follow the [Common](#common) flow

### Archlinux prod
Services commands for Archlinux:
 - Start services:  `packages=( mysqld  redis uwsgi tornado nginx postfix ) ; for package in "${packages[@]}" ; do systemctl enable $package; done;`
 - Enabling autostart: `packages=( redis  nginx postfix mysqld uwsgi tornado) ; for package in "${packages[@]}" ; do systemctl start $package; done;`

Installing packages for Archlinux:
 - Install packages `pacman -S nginx postfix gcc jansson`.
 - Install `pip install uwsgi`. You also can install `uwsgi` and `uwsgi-plugin-python` via pacman but I found pip's package more stable.
 - Follow the instructions in [Archlinux](#archlinux).

### CentOS prod
Installing packages for Archlinux
 - Add `alias yum="python2 $(which yum)"` to /etc/bashrc if you use python3
 - Install packages `yum install nginx, python34u, uWSGI, python34u-pip, redis, mysql-server, mysql-devel, postfix, mailx`

Services commands for Archlinux:
 - Start services: `packages=( redis-server  nginx postfix mysqld uwsgi tornado) ; for package in "${packages[@]}" ; do service $package start; done;`
 - Enabling autostart: `chkconfig mysqld on; chkconfig uwsgi on; chkconfig tornado on; chkconfig redis on; chkconfig postfix on`

### Common
 - Set environment variable `PYCHAT_CONFIG=prod`
 - Follow the instructions in [Boostrap files](#bootstrap-files).
 - For production I would recommend to clone repository to `/srv/http/pychat`.  If you cloned project into different directory than `/srv/http/pychat` replace all absolute paths in config files. You can use `download_content.sh rename_root_directory` to do that.
 - Replace all occurrences of `pychat.org` in [rootfs](rootfs) for your domain. You can use `./download_content.sh rename_domain your.new.domain.com`
 - Also check `rootfs/etc/nginx/nginx.conf` you may want to merge `location /photo` and `location /static` into main `server` conf. You need all of this because I used subdomain for static urls/
 - HTTPS is required for webrtc calls so you need to enable ssl:
   - Obtain ceritifcate.
       - Register online. There're a lot of free and paid services. Like comodo or startssl(only 1 year free). Here's instructions for startssl.
         - Follow the instructions in https://www.startssl.com.
         - Start postfix service (it's required to verify that you have access to domain)
         - Send validation email to domain `webmaster@pychat.org`
         - Apply verification code from `/root/Maildir/new/<<time>>` (you may also need to  disable ssl in /etc/postfix/main.cf since it's enabled by default).
         - You can generate server.key and get certificate from  https://www.startssl.com/Certificates/ApplySSLCert .
       - Generate custom certificate.
         - execute `./download_content.sh generate_certificate`
         - Or generate by yourself
   - Now you got certificate and you want to put files according to [nginx.conf](rootfs/etc/nginx/nginx.conf). Copy server key into `./rootfs/etc/nginx/ssl/server.key` and certificate into `./rootfs/etc/nginx/ssl/certificate.crt`.
   - Don't forget to change owner of files to http user `chown -R http:http /etc/nginx/ssl/`
 - Copy config files to rootfs `cp rootfs / -r `. Change owner of project to `http` user: `chown -R http:http`. And reload systemd config `systemctl daemon-reload`.
 - Generate postfix postman: `postmap /etc/postfix/virtual; postman /etc/aliases`
 - Add django admin static files: `python manage.py collectstatic`
 - Execute start services and if you need enablign autostart commands described for [Archlinux](#archliunux-prod) or [CentOS](#centos-prod)
 - Open in browser [http**s**://your.domain.com](https://127.0.0.1). Note that by default nginx accepts request by domain.name rather than ip.
 - If something doesn't work you want to check `pychat/logs` directory. If there's no logs in directory you may want to check service stdout: `sudo journalctl -u YOUR_SERVICE`. Check that user `http` has access to you project directory.

## Docker
You can alway use [my docker](https://cloud.docker.com/u/deathangel908/repository/docker/deathangel908/pychat) image described in [README](https://github.com/akoidan/pychat#run-prod-docker-image), but you can also build it yourself:
 - Generate ssl certificates:	
   - If you have bash installed: `./download_content.sh generate_certificate`	
   - You can also generate them manually and put into `./rootfs/etc/nginx/ssl/server.key` and `./rootfs/etc/nginx/ssl/certificate.crt`	
 - Rename [chat/settings_example.py](chat/settings_example.py) to `chat/settings.py`. Execute `bash download_content.sh generate_secret_key`. If you need additional features like oauth/push notifications you can set those up by editing `chat/settings.py` and `fe/production.json`	
- Run my built image: `docker-compose -f ./docker-all/docker-compose.yml up`.	
 - Open https://localhost . If something is broken you can check `/srv/http/log/` in docker: `docker exec -it containerId bash`
