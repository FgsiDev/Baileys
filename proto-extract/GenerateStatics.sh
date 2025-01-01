npx pbjs -t static-module --no-beautify -w es6 --no-bundle --no-delimited --no-verify --no-comments -o ../WAProto/index.js ../WAProto/WAProto.proto;
npx pbjs -t static-module --no-beautify -w es6 --no-bundle --no-delimited --no-verify ../WAProto/WAProto.proto | npx pbts --no-comments -o ../WAProto/index.d.ts -;
node ../WAProto/fix-imports.js