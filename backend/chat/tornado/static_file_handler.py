from tornado.web import StaticFileHandler


class PychatStaticFileHandler(StaticFileHandler):

    def set_extra_headers(self, path):
        """For subclass to add extra headers to the response"""
        self.set_header("Access-Control-Allow-Origin", "*")
