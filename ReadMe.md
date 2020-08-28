# kern.js Editor

## Run this website by mounting it inside a [kern.js](https://github.com/GeraldWodni/kern.js) container:

- Mount the contents of this repository under `websites/editor`
- Set `KERN_STATIC_HOST` to `editor`
- Set `KERN_EDITOR_ROOT` to the folder you want to allow public editing i.e. `/var/www/...`
- Done :D

## Optional settings
- Set `KERN_EDITOR_DIR_FILTER` to a RegExp for sub directories; default value: `.*`
- Set `KERN_EDITOR_PREFIX` to the path the editor is mounted to i.e. `/`; default value: '' (empty string)

## Docker

Alternatively you can just build the Dockerfiles for kern.js and this repository and run that.
