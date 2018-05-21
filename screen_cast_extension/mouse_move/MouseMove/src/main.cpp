#include <iostream>
#include <SDL.h>
#include <unistd.h>


int main(int, char**){
    if (SDL_Init(SDL_INIT_VIDEO) != 0){
        std::cout << "SDL_Init Error: " << SDL_GetError() << std::endl;
        return 1;
    }
    SDL_Window *window = SDL_CreateWindow(
            "Mouse coordinates test", 0, 0, 100, 100,
            NULL);
    usleep(1000);
    SDL_WarpMouseInWindow(window , 600, 600);

    SDL_Quit();
    return 0;
}