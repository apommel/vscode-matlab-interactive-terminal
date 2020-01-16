from os import remove
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
        if not import_fail:
            print("Starting Matlab...")
            self.eng = matlab.engine.start_matlab()
            print("Matlab started")
        else:
            print("Could not start Matlab")

    def run_script(self, script_path):
        if not import_fail:
            try:
                print("Running: \"{}\"".format(script_path))
                self.eng.run(script_path, nargout=0)
            except MatlabTerminated:
                print("Matlab terminated. Restarting the engine...")
                self.eng = matlab.engine.start_matlab()
            except : # The other exceptions are handled by Matlab
                pass

    def run_selection(self, temp_path):
        if not import_fail:
            f = open(temp_path, 'r')
            print("Running:")
            for line in f:
                print(line, end='')
            print('\n')
            f.close()
            try:
                self.eng.run(temp_path, nargout=0)
            except MatlabTerminated:
                print("Matlab terminated. Restarting the engine...")
                self.eng = matlab.engine.start_matlab()
            except : # The other exceptions are handled by Matlab
                pass
            finally:
                remove(temp_path)

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
                    print("Matlab restarted")
                except : # The other exceptions are handled by Matlab
                    pass
        if not import_fail: self.eng.quit()