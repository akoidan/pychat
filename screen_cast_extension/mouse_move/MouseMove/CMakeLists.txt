project(MouseMove)
add_executable(MouseMove src/main.cpp)
target_link_libraries(MouseMove ${SDL2_LIBRARY})
install(TARGETS MouseMove RUNTIME DESTINATION ${BIN_DIR})