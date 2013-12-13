
#
# Run tests
#
run_tests: build_config
	npm install
	npm test

#
# For use on CI
# Build config/flowdockConfig.js module
#
build_config:

	@if test ! -f ./config/flowdockConfig.js; then \
		node run.js local \
	else : ; \
	fi