# -*- coding: utf-8 -*-

import os
import sys
import json
import redis
import logging
import argparse
import bottle


# terminal arguments
ap = argparse.ArgumentParser()
ap.add_argument("--port", dest="port", default=5000, type=int, help="server port")
ap.add_argument("--host", dest="host", default="0.0.0.0", help="server host")
ap.add_argument("--production", dest="production", action="store_true", help="enables production mode and reduces logging")
ap.add_argument("--debug", dest="debug", action="store_true", help="application in debug mode")
ap.add_argument("--reloader", dest="reloader", action="store_true", help="application reloads on source change")
ap.add_argument("--path", dest="path", default="/", help="Path of app / or /marshal/")
ap.add_argument("--redis-host", dest="redis_host", default="localhost", help="Redis host")
ap.add_argument("--redis-port", dest="redis_port", type=int, default=6379, help="Redis port")
ap.add_argument("--redis-db", dest="redis_database", type=int, default=0, help="Redis database number")
args = vars(ap.parse_args())


# setting up logging based on prod/devel stage
if args["production"]:
	log_level = logging.CRITICAL
else:
	log_level = logging.DEBUG

logging.basicConfig(stream=sys.stdout, level=log_level, format="%(asctime)s %(levelname)s %(name)s -> %(message)s")


# setting up application
app = application = bottle.Bottle()
app.config["r"] = redis.StrictRedis(host=args["redis_host"], port=args["redis_port"], db=args["redis_database"])


@app.route("{}static/<filename:path>".format(args["path"]))
def send_static(filename):
	return bottle.static_file(filename, root = str(os.getcwd()) + "/static")


@app.route("{}".format(args["path"]), method=["GET"])
def route_default():
	with open("static/index.html", "r") as fp:
		data = str(fp.read())
		data = data.replace("$$path$$", args["path"])
		data = data.replace("$$db$$", str(args["redis_database"]))
	return data


@app.route("{}api/scan".format(args["path"]), method=["GET"])
def route_api_scan():
	payload = []
	query = bottle.request.query.q
	pattern = query if query != "" else "*"
	for key in app.config["r"].scan_iter(pattern):
		payload.append({
			"key": key,
			"ttl": app.config["r"].ttl(key),
			"type": app.config["r"].type(key),
		})

	bottle.response.headers["Content-Type"] = "application/json"
	bottle.response.headers["Cache-Control"] = "no-cache"
	return json.dumps(payload)

@app.route("{}api/del".format(args["path"]), method=["GET"])
def route_api_del():
	key = bottle.request.query.key
	response = 0
	if key != "":
		response = app.config["r"].delete(key)
	bottle.response.headers["Content-Type"] = "application/json"
	bottle.response.headers["Cache-Control"] = "no-cache"
	return json.dumps({"status": bool(response)})

@app.route("{}api/get".format(args["path"]), method=["GET"])
def route_api_get():
	key = bottle.request.query.key
	key_type = bottle.request.query.type
	response = { "key": key, "type": key_type }
	if key != "":
		if key_type == "string":
			response["value"] = app.config["r"].get(key)
		elif key_type == "hash":
			response["value"] = app.config["r"].hgetall(key)
	bottle.response.headers["Content-Type"] = "application/json"
	bottle.response.headers["Cache-Control"] = "no-cache"
	return json.dumps(response)

@app.route("{}api/set".format(args["path"]), method=["POST"])
def route_api_set():
	raw = bottle.request.body.read()
	response = { "status": False }
	payload = json.loads(raw)

	try:
		# delete old key
		app.config["r"].delete(payload["key"])

		if payload["type"] == "hash":
			for item in payload["value"]:
				app.config["r"].hset(payload["key"], item["key"], item["value"])

		elif payload["type"] == "string":
			app.config["r"].set(payload["key"], payload["value"])

		response["status"] = True
	except Exception as e:
		print (e)

	bottle.response.headers["Content-Type"] = "application/json"
	bottle.response.headers["Cache-Control"] = "no-cache"
	return json.dumps(response)

@app.route("{}api/info".format(args["path"]), method=["GET"])
def route_api_info():
	bottle.response.headers["Content-Type"] = "application/json"
	bottle.response.headers["Cache-Control"] = "no-cache"
	return json.dumps(app.config["r"].info())

# starting server
if __name__ == "__main__":
	bottle.run(
		app = app,
		server = "waitress",
		host = args["host"],
		port = args["port"],
		debug = args["debug"],
		reloader = args["reloader"],
	)
