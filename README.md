# Notes for running the web server
# open port 3000
$ sudo apt-get install ufw
$ sudo ufw allow 3000

# install nodeJs https://tutorials-raspberrypi.de/raspberry-pi-nodejs-webserver-installieren-gpios-steuern/
$ sudo apt-get update
$ sudo apt-get full-upgrade
$ sudo su
# Do not use node from the ubuntu appstore, use nvm to install correct version, install everything for root and standard user
# https://www.freecodecamp.org/news/how-to-install-node-js-on-ubuntu-and-update-npm-to-the-latest-version/



# the package libxss-dev is needed for one of the dependencies: https://www.npmjs.com/package/desktop-idle
$ sudo apt install libxss-dev pkg-config

# https://wiki.ubuntuusers.de/Bluetooth/Einrichtung/
# Some further packages for bluetooth connection https://yarnpkg.com/package/@abandonware/noble#readme
$ sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
# /* npm install bcrypt ? */

# Then got to the project folder
$ cd idasen-backend

# Run node installer, within the project folder (or yarn install, if u have it installed)
$ sudo npm i 

# Run server, within the project folder
$ sudo node src/index.js


## Known Errors:

# Solution for Error 1
# npm ERR! code 1
# npm ERR! path /home/ubuntu/idasen-backend/node_modules/desktop-idle
$ libxss-dev, see above for package libxss-dev
# $ ~/idasen-backend$ apt-get install xscrnsaver # haven't worked
# Or upgrade your node version!

# Solution for Error 2 "/usr/bin/env: ‘node’: Permission denied"
# in sudo su
$ rm package-lock.json
$ npm i -g yarn
$ yarn install


#Solution Error 3
# there is no compatible bluetooth device, if you use Raspberry Pi2 or older, 
# get yourself a nice big USB BT dongle with BLE support


#Error 1:
ubuntu@ubuntu:~/idasen-backend$ npm i
npm notice
npm notice New minor version of npm available! 7.13.0 -> 7.15.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v7.15.0
npm notice Run npm install -g npm@7.15.0 to update!
npm notice
npm ERR! code 1
npm ERR! path /home/ubuntu/idasen-backend/node_modules/desktop-idle
npm ERR! command failed
npm ERR! command sh -c node-gyp rebuild
npm ERR! gyp info it worked if it ends with ok
npm ERR! gyp info using node-gyp@7.1.2
npm ERR! gyp info using node@14.17.0 | linux | x64
npm ERR! gyp info find Python using Python version 3.8.5 found at "/usr/bin/python3"
npm ERR! gyp http GET https://nodejs.org/download/release/v14.17.0/node-v14.17.0-headers.tar.gz
npm ERR! gyp http 200 https://nodejs.org/download/release/v14.17.0/node-v14.17.0-headers.tar.gz
npm ERR! gyp http GET https://nodejs.org/download/release/v14.17.0/SHASUMS256.txt
npm ERR! gyp http 200 https://nodejs.org/download/release/v14.17.0/SHASUMS256.txt
npm ERR! gyp info spawn /usr/bin/python3
npm ERR! gyp info spawn args [
npm ERR! gyp info spawn args   '/usr/lib/node_modules/npm/node_modules/node-gyp/gyp/gyp_main.py',
npm ERR! gyp info spawn args   'binding.gyp',
npm ERR! gyp info spawn args   '-f',
npm ERR! gyp info spawn args   'make',
npm ERR! gyp info spawn args   '-I',
npm ERR! gyp info spawn args   '/home/ubuntu/idasen-backend/node_modules/desktop-idle/build/config.gypi',
npm ERR! gyp info spawn args   '-I',
npm ERR! gyp info spawn args   '/usr/lib/node_modules/npm/node_modules/node-gyp/addon.gypi',
npm ERR! gyp info spawn args   '-I',
npm ERR! gyp info spawn args   '/home/ubuntu/.cache/node-gyp/14.17.0/include/node/common.gypi',
npm ERR! gyp info spawn args   '-Dlibrary=shared_library',
npm ERR! gyp info spawn args   '-Dvisibility=default',
npm ERR! gyp info spawn args   '-Dnode_root_dir=/home/ubuntu/.cache/node-gyp/14.17.0',
npm ERR! gyp info spawn args   '-Dnode_gyp_dir=/usr/lib/node_modules/npm/node_modules/node-gyp',
npm ERR! gyp info spawn args   '-Dnode_lib_file=/home/ubuntu/.cache/node-gyp/14.17.0/<(target_arch)/node.lib',
npm ERR! gyp info spawn args   '-Dmodule_root_dir=/home/ubuntu/idasen-backend/node_modules/desktop-idle',
npm ERR! gyp info spawn args   '-Dnode_engine=v8',
npm ERR! gyp info spawn args   '--depth=.',
npm ERR! gyp info spawn args   '--no-parallel',
npm ERR! gyp info spawn args   '--generator-output',
npm ERR! gyp info spawn args   'build',
npm ERR! gyp info spawn args   '-Goutput_dir=.'
npm ERR! gyp info spawn args ]
npm ERR! Package x11 was not found in the pkg-config search path.
npm ERR! Perhaps you should add the directory containing `x11.pc'
npm ERR! to the PKG_CONFIG_PATH environment variable
npm ERR! No package 'x11' found
npm ERR! Package xext was not found in the pkg-config search path.
npm ERR! Perhaps you should add the directory containing `xext.pc'
npm ERR! to the PKG_CONFIG_PATH environment variable
npm ERR! No package 'xext' found
npm ERR! Package xscrnsaver was not found in the pkg-config search path.
npm ERR! Perhaps you should add the directory containing `xscrnsaver.pc'
npm ERR! to the PKG_CONFIG_PATH environment variable
npm ERR! No package 'xscrnsaver' found
npm ERR! gyp: Call to 'pkg-config --cflags x11 xext xscrnsaver' returned exit status 1 while in binding.gyp. while trying to load binding.gyp
npm ERR! gyp ERR! configure error
npm ERR! gyp ERR! stack Error: `gyp` failed with exit code: 1
npm ERR! gyp ERR! stack     at ChildProcess.onCpExit (/usr/lib/node_modules/npm/node_modules/node-gyp/lib/configure.js:351:16)
npm ERR! gyp ERR! stack     at ChildProcess.emit (events.js:376:20)
npm ERR! gyp ERR! stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:277:12)
npm ERR! gyp ERR! System Linux 5.4.0-73-generic
npm ERR! gyp ERR! command "/usr/local/bin/node" "/usr/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
npm ERR! gyp ERR! cwd /home/ubuntu/idasen-backend/node_modules/desktop-idle
npm ERR! gyp ERR! node -v v14.17.0
npm ERR! gyp ERR! node-gyp -v v7.1.2
npm ERR! gyp ERR! not ok

npm ERR! A complete log of this run can be found in:
npm ERR!     /home/ubuntu/.npm/_logs/2021-05-29T10_47_13_737Z-debug.log


# Error 2
/usr/bin/env: ‘node’: Permission denied
sh: 1: node-gyp: Permission denied
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@~2.3.1 (node_modules/chokidar/node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.3.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"arm"})

npm ERR! code ELIFECYCLE
npm ERR! syscall spawn
npm ERR! file sh
npm ERR! errno ENOENT
npm ERR! usb@1.7.1 install: prebuild-install --runtime napi --target 4 --verbose || node-gyp rebuild
npm ERR! spawn ENOENT
npm ERR!
npm ERR! Failed at the usb@1.7.1 install script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /root/.npm/_logs/2021-06-02T18_42_08_098Z-debug.log


#Error 3 No Bluetooth available
root@raspberrypi:/home/pi/idasen-backend# node src/index.js
/home/pi/idasen-backend/node_modules/@abandonware/noble/lib/hci-socket/hci.js:120
this._socket.bindRaw(this._deviceId);
^

Error: ENODEV, No such device
at Hci.init (/home/pi/idasen-backend/node_modules/@abandonware/noble/lib/hci-socket/hci.js:120:18)
at NobleBindings.init (/home/pi/idasen-backend/node_modules/@abandonware/noble/lib/hci-socket/bindings.js:93:13)
at Noble.get (/home/pi/idasen-backend/node_modules/@abandonware/noble/lib/noble.js:73:26)
at Object.<anonymous> (/home/pi/idasen-backend/src/control/bluetoothDeskBridge.js:4:8)
at Module._compile (internal/modules/cjs/loader.js:1200:30)
at Object.Module._extensions..js (internal/modules/cjs/loader.js:1220:10)
at Module.load (internal/modules/cjs/loader.js:1049:32)
at Function.Module._load (internal/modules/cjs/loader.js:937:14)
at Module.require (internal/modules/cjs/loader.js:1089:19)
at require (internal/modules/cjs/helpers.js:73:18) {
errno: 19,
code: 'ENODEV',
syscall: 'bind'
}


