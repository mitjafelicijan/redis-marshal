# Redis Marshal

![Query window](https://user-images.githubusercontent.com/296714/40736271-de176370-643d-11e8-9ebe-4d0289893cc7.png)


### Current data type support

- [x] Strings
- [ ] Lists
- [ ] Sets
- [x] Hashes
- [ ] Sorted sets
- [ ] Bitmaps and HyperLogLogs


### TODO

- [ ] when usign * for query check num_keys and if larger that 500 alert user or even disable query
- [ ] proccessed num format into human friendly
- [ ] on query enter press disable input and on results reenable input... loading
- [ ] add execute command


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
