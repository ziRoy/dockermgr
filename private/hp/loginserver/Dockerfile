FROM docker-repo.gamed9.com/hp/base:flat

ADD     workspace /workspace

EXPOSE	7777
VOLUME	/workspace

WORKDIR /workspace/build/loginserver
CMD	[ "dockerize", "-template", "/workspace/cfg_template/loginserver.cfg.tmpl:/workspace/build/loginserver/loginserver.cfg", "./Loginserver"]