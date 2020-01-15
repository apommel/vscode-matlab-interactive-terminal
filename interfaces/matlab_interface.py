global import_fail
try: # Check if the Matlab Engine is installed
    import matlab.engine
    from matlab.engine import RejectedExecutionError as MatlabTerminated
except ImportError:
    print("Matlab Engine for Python cannot be detected. Please install it for the extension to work")
    import_fail = True
else:
    import_fail = False

class MatlabInterface:
    global import_fail

    def __init__(self):
        print("Starting Matlab...")
        self.eng = matlab.engine.start_matlab()
        print("Matlab started")

    def run_script(self, script_path):
        if not import_fail:
            self.eng.run(script_path, nargout=0)

    def run_selection(self, selection):
        if not import_fail:
            self.eng.eval(selection, nargout=0)

    def interactive_loop(self):
        loop=True # Looping allows for an interactive terminal
        while loop and not import_fail:
            command = input()
            if command=="exit" or command=="exit()": # Keywords to leave the engine
                loop=False
            else:
                try:
                    self.eng.eval(command, nargout=0) # Feed the instructions to Matlab eval
                except MatlabTerminated:
                    print("Matlab terminated. Restarting the engine...")
                    self.eng = matlab.engine.start_matlab()
                except : # The other exceptions are handled by Matlab
                    pass
        if not import_fail: self.eng.quit()