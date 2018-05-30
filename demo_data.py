# -*- coding: utf-8 -*-

import random
import string
import redis

r = redis.StrictRedis(host="localhost", port=6379, db=0)

for i in xrange(30):
	key = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))
	r.set("demo_{}".format(key), "1")
