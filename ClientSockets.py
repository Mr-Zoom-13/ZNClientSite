import socketio


class Client():
    def __init__(self, url):
        self.sio = socketio.Client()
        self.url = url

    def my_connect(self):
        self.sio.connect(self.url)

    def emit(self, event, params=None):
        if params:
            self.sio.emit(event, params)
        else:
            self.sio.emit(event)
