[TOC]

## 将你的应用程序Docker化
### 构建 基础镜像(Image)
基础镜像即程序的运行环境
1. 可以从 [DockerHub](https://hub.docker.com/) 上搜索，例如 [node.js](https://hub.docker.com/_/node/)、[tomcat](https://hub.docker.com/_/tomcat/)
2. 编写`Dockerfile`构建镜像
3. （不推荐）`docker run`启动一个基础镜像（例如 [ubuntu](https://hub.docker.com/_/ubuntu/) ），进入容器终端安装环境，最后`docker commit`成为一个镜像

以**幻想英雄3D项目**为例，服务器c++编写，依赖库皆由源码编译，用**方法2**构建基础镜像

Dockerfile
```
# 继承自 ubuntu:12.04
FROM	ubuntu:12.04
# 设置环境变量
ENV 	LIB_ROOT /data/lib

RUN apt-get update && apt-get install -y \
	python-software-properties \
	build-essential \
	inetutils-ping \
	net-tools \
	wget \
	cmake

# ----- G++ 4.8 -----
RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN apt-get update && apt-get install -y \
	gcc-4.8 \
	g++-4.8 \
	gcc-4.8-multilib \
	g++-4.8-multilib \
	gcc-4.8-doc
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 20
RUN update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 20
RUN update-alternatives --config gcc
RUN update-alternatives --config g++

# ----- perftools -----
ADD		google-perftools-1.9.1.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/google-perftools-1.9.1
RUN		./configure --enable-frame_pointers && make && make install

# ----- openssl -----
ADD		openssl-1.0.0q.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/openssl-1.0.0q
RUN		./config -m64 shared no-ssl2 -fPIC && make && make install
RUN		apt-get install -y libssl-dev

# ----- curl ------
ADD		curl-7.40.0.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/curl-7.40.0
RUN		./configure --with-ssl=/usr/local/ssl && make && make install

# ----- ACE ------
ADD		ACE-6.0.3.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/ACE_wrappers
RUN		mkdir build
WORKDIR	${LIB_ROOT}/ACE_wrappers/build
RUN		../configure --disable-ssl && make && make install

# ----- jsoncpp ------
RUN		apt-get install -y scons
ADD		jsoncpp-src-0.5.0.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/jsoncpp-src-0.5.0
RUN		scons platform=linux-gcc
RUN		cp libs/linux-gcc-4.8/* /usr/local/lib
RUN		cp -r include/json /usr/local/include
RUN		ln -s /usr/local/lib/libjson_linux-gcc-4.8_libmt.so /usr/local/lib/libjson_linux.so

# ----- readline ------
RUN		apt-get install -y libreadline-dev

# ----- boost ------
ADD		boost_1_55_0.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/boost_1_55_0
RUN		./bootstrap.sh --prefix=/usr/
RUN		./b2 --with-system --with-filesystem --with-regex
RUN		cp stage/lib/* /usr/local/lib
RUN		cp -r boost /usr/local/include

# ----- mysql client ------
RUN		apt-get install -y mysql-client libmysql++-dev

# ----- gdb ------
ADD		gdb-7.7.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/gdb-7.7
RUN		./configure && make && make install

# ----- protobuf -----
RUN		apt-get install -y autoconf automake libtool
ADD		protobuf-2.6.1.tar.gz ${LIB_ROOT}
WORKDIR	${LIB_ROOT}/protobuf-2.6.1
RUN		./autogen.sh && ./configure && make && make check && make install

# ----- mongodb ------
ADD		mongo-c-driver ${LIB_ROOT}/mongo-c-driver/
WORKDIR	${LIB_ROOT}/mongo-c-driver
RUN		./autogen.sh && make && make install

# ----- dockerize tools ------
WORKDIR	${LIB_ROOT}
RUN 	wget https://github.com/jwilder/dockerize/releases/download/v0.2.0/dockerize-linux-amd64-v0.2.0.tar.gz
RUN 	tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v0.2.0.tar.gz

WORKDIR	/
RUN		rm -rf ${LIB_ROOT} # && rm -rf /var/lib/apt/lists/*
```
执行构建
`$ docker build -t hp/base .`

镜像会比较大，因为每个构建指令都会形成一个 `image layer` ，`LIB_ROOT`中的大量临时文件也被计算在内，所以为了之后传输方便，把他压缩至一层
`$ docker create hp/base`
`[container id]`
`$ docker export [container id] | docker import - hp/base:flat`

### 构建 辅助镜像

这里将工程构建过程也放在Docker容器中进行，因此需要构建这些镜像

#### svn
Dockerfile
```
FROM	hp/base:flat

RUN 	apt-get update && apt-get install -y subversion
COPY	entrypoint.sh /entrypoint.sh
ENTRYPOINT	["bin/bash", "/entrypoint.sh"]
VOLUME		/workspace
```
> 此处定义了镜像所创建的容器的入口(entrypoint)是一个shell脚本

entrypoint.sh
```
#! /bin/bash

cd /workspace

svn export -r ${SERVER_VER} --force --username ${USERNAME} --password ${PASSWORD} --no-auth-cache http://172.16.0.3/repository/water_server/${BRANCH} .
svn export -r ${RES_VER}    --force --username ${USERNAME} --password ${PASSWORD} --no-auth-cache http://172.16.0.3/repository/water_art/${BRANCH}/table/server data
```
`$ docker build -t hp/svn .`

#### make

Dockerfile
```
FROM	hp/base:flat
COPY	entrypoint.sh /entrypoint.sh
ENTRYPOINT	["bin/bash", "/entrypoint.sh"]
VOLUME		/workspace
```
entrypoint.sh
```
#! /bin/bash

cd /workspace
mkdir -p build
cd build
cmake ../
cd ${SERVER}
make -j3
```
`docker build -t hp/make .`

### 构建 数据库镜像

项目使用mysql数据库，可以直接使用官方镜像，这里自定义了配置文件，更改了日志目录

Dockerfile
```
FROM mysql:5.5

ADD		d9.cnf /etc/mysql/conf.d/d9.cnf
RUN		mkdir -p /var/log/mysql && chown -R mysql:mysql /var/log/mysql

VOLUME	/var/lib/mysql
VOLUME	/var/log/mysql
```
d9.cnf
```
[mysqld]
skip-external-locking
bind-address		= 0.0.0.0

key_buffer         	= 16M
max_allowed_packet 	= 16M
thread_stack       	= 192K
thread_cache_size  	= 8
myisam-recover     	= BACKUP
query_cache_limit  	= 1M
query_cache_size   	= 16M
log_error          	= /var/log/mysql/error.log
expire_logs_days   	= 3
log_bin            	= /var/log/mysql/mysql-bin.log
max_binlog_size    	= 512M

skip-name-resolve
innodb_buffer_pool_size 		= 1024M
innodb_file_per_table
innodb_thread_concurrency		= 16
innodb_flush_log_at_trx_commit 	= 0
innodb_log_buffer_size 			= 8M
innodb_log_file_size 			= 256M
innodb_log_files_in_group 		= 2
innodb_max_dirty_pages_pct 		= 90
innodb_lock_wait_timeout 		= 10

[mysqldump]
quick
quote-names
max_allowed_packet 	= 16M
```
`$ docker build -t hp/db .`

### 配置文件模板

Docker启动容器时，一般通过传入**环境变量**或入口指令参数来影响容器的行为，如果应用程序是通过文件来配置的，则需要使用**dockerize**这个工具（已加入到基础镜像中），它可以将**环境变量**填充至配置模板中，生成配置文件。

gameserver.cfg.tmpl
```
##################################
# Gameserver Configuration File  #
##################################

[server]
# 游戏服ID
server_id={{ .Env.SERVER_ID }}
# 写入logindb的host，用于客户端连接，即docker宿主机地址
public_host={{ .Env.PUBLIC_HOST }}
# 写入logindb的port，用于客户端连接，即docker宿主机端口
public_port={{ .Env.PUBLIC_PORT }}

# 监听端口，即docker容器内部端口
listen_port={{ default .Env.LISTEN_PORT "5555" }}

...
```

### 构建 运行镜像

为每个服务器（gameserver/loginserver...）创建一个运行镜像，这里以**Game Server**为例

Dockerfile
```
FROM 	hp/base:flat

EXPOSE	5555
WORKDIR	/workspace/build/gameserver

CMD 	dockerize -template /workspace/cfg_template/gameserver.cfg.tmpl:/workspace/build/gameserver/gameserver.cfg ./Gameserver
```
`$ docker build -t hp/game .`

## 创建并运行你的容器

Docker官方推荐将容器分为 **数据容器** 和 **运行容器**，**数据容器** 的优点有：
- 数据可以被同主机的多个容器共享
- **运行容器** 被替换（升级）时不会影响数据
- 数据可以更容易的导出、迁移
- 不需要手动管理主机的Docker挂载点

### 内网环境

1. 创建**数据容器** `ws`
```
$ docker create -v /workspace --name ws hp/base:flat
```

2. 导出指定版本代码
```
$ docker run \
		--name svn \
		--volumes-from ws \
        -e SERVER_VER=HEAD \
        -e RES_VER=HEAD \
        -e USERNAME=username \
        -e PASSWORD=password \
        -e BRANCH=trunk \
        hp/svn
```

3. 编译
```
$ docker run \
		--name make
    	--volumes-from ws \
    	-e SERVER=gameserver \
    	hp/make
```

4. 创建**数据容器** `dbdata`
```
$ docker create -v /var/lib/mysql -v /var/log/mysql --name dbdata hp/db
```

5. 运行数据库
```
$ docker run \
		--name db \
        --volumes-from dbdata \
        -p 3307:3306 \
        -d \
        -e MYSQL_ROOT_PASSWORD=password \
		-e MYSQL_DATABASE=hp_world \
        hp/db
```

6. 运行服务器
```
$ docker run \
		--name gs \
        --volumes-from ws \
        -p 5556:5555 \
        -d \
        -e ...
        hp/game
```

如果需要更新服务器，只需依次执行：
`$ docker stop gs`
`$ docker start svn`
`$ docker start make`
`$ docker start gs`

### 外网环境

**外网版本**将可执行文件，配置文件，资源文件一起构建成镜像，tag设置为版本号，push到外网私有镜像仓库，在云主机pull相应版本部署

