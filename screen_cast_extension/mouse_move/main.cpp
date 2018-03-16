#include <X11/Xlib.h>

int main(int argc, char *argv[]){
    //Get system window
    Display *dpy;
    Window root_window;

    dpy = XOpenDisplay(0);
    root_window = XRootWindow(dpy, 0);
    XSelectInput(dpy, root_window, KeyReleaseMask);

    XWarpPointer(dpy, None, root_window, 0, 0, 0, 0, 100, 100);

    XFlush(dpy);

    return 0;
}