cmake_minimum_required(VERSION 3.6)
project(mouse_move)

set(CMAKE_CXX_STANDARD 11)

find_package(X11 REQUIRED)

message(STATUS "X11_FOUND = ${X11_FOUND}")
message(STATUS "X11_INCLUDE_DIR = ${X11_INCLUDE_DIR}")
message(STATUS "X11_LIBRARIES = ${X11_LIBRARIES}")


set(SOURCE_FILES main.cpp)
add_executable(mouse_move ${SOURCE_FILES})
target_link_libraries(mouse_move ${X11_LIBRARIES})
