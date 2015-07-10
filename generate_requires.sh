#!/usr/bin/env sh

node tasks/generate-requires.js `find test/spec | grep \.js$` > build/test_requires.js
