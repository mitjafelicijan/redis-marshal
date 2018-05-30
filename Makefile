REPO_NAME = mitjafelicijan/redis-marshal

dev:
	find -type f | egrep -i "*.py|*.yml" | entr -r python2 application.py --debug

clean:
	find . -type f -name '*.pyc' -delete

docker-build:
	docker build -t $(REPO_NAME):latest .

docker-publish:
	docker tag $(REPO_NAME):latest $(REPO_NAME)
	docker push $(REPO_NAME)
