# Redis Marshal


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
