FROM docker-repo.gamed9.com/hp/base:flat

ADD     workspace /workspace

EXPOSE	5555
VOLUME	/workspace

WORKDIR /workspace/build/gameserver
CMD	[ "dockerize", "-template", "/workspace/cfg_template/gameserver.cfg.tmpl:/workspace/build/gameserver/gameserver.cfg", "./Gameserver"]