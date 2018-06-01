# -*- coding: utf-8 -*-
# inserts demo testing data for development
# for i in {1..50}; do python2 demo_data.py; done

import random
import string
import argparse
import redis

from faker import Faker
fake = Faker()

ap = argparse.ArgumentParser()
ap.add_argument("--num-records", dest="num_records", default=50, type=int, help="number of demo records per type")
ap.add_argument("--redis-host", dest="redis_host", default="localhost", help="Redis host")
ap.add_argument("--redis-port", dest="redis_port", type=int, default=6379, help="Redis port")
ap.add_argument("--redis-db", dest="redis_database", type=int, default=0, help="Redis database number")
args = vars(ap.parse_args())

r = redis.StrictRedis(host=args["redis_host"], port=args["redis_port"], db=args["redis_database"])

print("inserting {} {} records ...".format(args["num_records"], "string"))
for i in xrange(args["num_records"]):
	uid = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(20))
	r.set("demo_{}_{}".format("string", uid), fake.text())

print("inserting {} {} records ...".format(args["num_records"], "hash"))
for i in xrange(args["num_records"]):
	uid = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(20))
	r.hset("demo_{}_{}".format("users", uid), "name", fake.name())
	r.hset("demo_{}_{}".format("users", uid), "address", fake.address())
	r.hset("demo_{}_{}".format("users", uid), "job", fake.job())
	r.hset("demo_{}_{}".format("users", uid), "phone_number", fake.phone_number())
	r.hset("demo_{}_{}".format("users", uid), "company", fake.company())





