## This project uses:
 - [cmake](https://cmake.org/)
 - [WebAssembly](http://webassembly.org/)
 - [Emscripten SDK](https://kripken.github.io/emscripten-site/docs/tools_reference/emsdk.html)
 - [SDL2](https://www.libsdl.org/)
## Install dependencies
The project skeleton was generated based on [this](http://www.willusher.io/sdl2%20tutorials/2014/03/06/lesson-0-cmake) tutorial
 - install cmake
 - install [emsdk](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html), in Archlinux `yaourt -S aur/emsdk`
 - compile sdk-incoming-64bit `emsdk install --build=Release sdk-incoming-64bit binaryen-master-64bit`
 - activate sdk-incoming-64bit `emsdk activate --build=Release sdk-incoming-64bit binaryen-master-64bit`
 - Install [sdl2](https://www.libsdl.org/download-2.0.php), in Archlinux `pacman -S sdl2`
## Build and run
 - `mkdir build && cd build`
 - `cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Debug ../`
 - `emconfigure cmake .`
 - `emmake make`
