# Redis Marshal

[![Build Status MASTER](https://travis-ci.org/mitjafelicijan/redis-marshal.svg?branch=master)](https://travis-ci.org/mitjafelicijan/redis-marshal) [![Build Status DEVEL](https://travis-ci.org/mitjafelicijan/redis-marshal.svg?branch=devel)](https://travis-ci.org/mitjafelicijan/redis-marshal)

![Query window](https://user-images.githubusercontent.com/296714/40789890-d25e23dc-64f3-11e8-8667-d20fff6ee493.png)


#### Additional resources

- [Screencast on Youtube](https://www.youtube.com/watch?v=KQVR3dXxGUQ)
- [Add suggestions or issues](https://github.com/mitjafelicijan/redis-marshal/issues/new)


### Current data type support

- [x] Strings
- [ ] Lists
- [ ] Sets
- [x] Hashes
- [ ] Sorted sets
- [ ] Bitmaps and HyperLogLogs

Todo list is located in [TODO.md](TODO.md).


### Software characteristics

- Written in Python2.7 (Python3.x fails on JSON serialiation - working on it).
- All dependencies are included with source (no pip or virtualenv needed).
- Works with Docker and docker-compose.
- No autentication implemented (use Nginx or Caddy as a reverse proxy and add Basic-Auth).
- Allows bulk key deletion.
- Allows table sorting of results based on type, key and ttl.
- Autogenerates forms from hashsets and enables adding and removing attributes.
- Allows executing commands.


### Supported glob-style patterns

- h?llo matches hello, hallo and hxllo
- h*llo matches hllo and heeeello
- h[ae]llo matches hello and hallo, but not hillo
- h[^e]llo matches hallo, hbllo, ... but not hello
- h[a-b]llo matches hallo and hbllo

Use `\` to escape special characters if you want to match them verbatim. More on https://redis.io/commands/keys.



### Application arguments

```
usage: application.py [-h] [--port PORT] [--host HOST] [--production]
                      [--debug] [--reloader] [--path PATH]
                      [--redis-host REDIS_HOST] [--redis-port REDIS_PORT]
                      [--redis-db REDIS_DATABASE]

optional arguments:
  -h, --help            show this help message and exit
  --port PORT           server port
  --host HOST           server host
  --production          enables production mode and reduces logging
  --debug               application in debug mode
  --reloader            application reloads on source change
  --path PATH           Path of app / or /marshal/
  --redis-host REDIS_HOST
                        Redis host
  --redis-port REDIS_PORT
                        Redis port
  --redis-db REDIS_DATABASE
                        Redis database number
```


### Using with Docker (docker-compose)

```sh
docker-compose up
```

```yaml
version: "3"
networks:
  redis-marshal-net:
    driver: bridge
services:
  redis-marshal:
    image: mitjafelicijan/redis-marshal
    ports:
        - "9001:9001"
    depends_on:
        - redis
    command: python ./application.py --port 9001 --redis-host redis-marshal.internal
    networks:
      - redis-marshal-net
  redis:
    image: redis
    hostname: redis
    ports:
      - "6379:6379"
    command: /usr/local/bin/redis-server --appendonly yes --appendfilename history.aof
    volumes:
      - ${PWD}/data:/data
    networks:
      redis-marshal-net:
        aliases:
          - redis-marshal.internal
```


### Using on local machine

Before running start Redis Server on local machine.

```sh
wget https://github.com/mitjafelicijan/redis-marshal/archive/master.zip
unzip master.zip
cd redis-marshal-master
python2 application.py
```


### Made with the help of

- https://github.com/bottlepy/bottle
- https://github.com/Pylons/waitress
- https://github.com/andymccurdy/redis-py
- https://github.com/wycats/handlebars.js/
