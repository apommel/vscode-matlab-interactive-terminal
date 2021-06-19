# Developed by Aurelien Pommel and other contributors

# Trying to have a basic Python 2 compatibility
from __future__ import print_function
try:
    input = raw_input
except NameError:
    pass

import os
from io import StringIO
from textwrap import dedent

global import_fail
try: # Check if the Matlab Engine is installed
    import matlab.engine
    from matlab.engine import RejectedExecutionError as MatlabTerminated
except ImportError:
    print("MATLAB Engine for Python cannot be detected. Please install it for the extension to work.")
    import_fail = True
else:
    import_fail = False

class MatlabInterface:
    global import_fail

    def __init__(self):
        # OS checks related work
        if os.name == 'nt':
            self.cls_str = 'cls'
        else:
            self.cls_str = 'clear'
        self.clear()

        if not import_fail:
            try:
                self.eng = matlab.engine.start_matlab()
                intro = '''\
                MATLAB Interactive Terminal (R{release})
                
                To get started, type one of these commands:
                    helpwin          Provide access to help comments for all functions
                    helpdesk         Open help browser
                    demo             Access product examples in Help browser
                
                For product information, visit https://www.mathworks.com.\
                '''.format(release=self.release())
                print(dedent(intro))

            except Exception as e:
                self.clear()
                print("MATLAB Engine for Python exited prematurely.")
                print(e)

        else:
            print("Launching MATLAB failed: Error starting MATLAB process in MATLAB Engine for Python.")

    def clear(self):
        os.system(self.cls_str)

    def release(self):
        release_str = "version('-release');"
        res = self.eng.eval(release_str)
        return res

    def run_script(self, script_path):
        if not import_fail:

            try:
                print("File: \"{}\"".format(script_path))
                stream = StringIO()
                err_stream = StringIO()
                self.eng.run(script_path, nargout=0, stdout=stream, stderr=err_stream)
                print(stream.getvalue())

            except MatlabTerminated:
                print(stream.getvalue(), err_stream.getvalue(), sep="\n")
                print("MATLAB process terminated.")
                print("Restarting MATLAB Engine for Python...")
                self.eng = matlab.engine.start_matlab()
                print("Restarted MATLAB process.")

            except : # The other exceptions are handled by Matlab
                print(stream.getvalue(), err_stream.getvalue(), sep="\n")

    def run_selection(self, temp_path):
        if not import_fail:
            f = open(temp_path, 'r')
            print("Running:")

            try: # Print the content of the selection before running it, encoding issues can happen
                for line in f:
                    print(line, end='')

            except UnicodeDecodeError:
                print("current selection")

            print('\n')
            f.close()

            try:
                stream = StringIO()
                err_stream = StringIO()
                self.eng.run(temp_path, nargout=0, stdout=stream, stderr=err_stream)
                print(stream.getvalue())

            except MatlabTerminated:
                print(stream.getvalue(), err_stream.getvalue(), sep="\n")
                print("MATLAB terminated. Restarting the engine...")
                self.eng = matlab.engine.start_matlab()
                print("MATLAB restarted")

            except : # The other exceptions are handled by Matlab
                print(stream.getvalue(), err_stream.getvalue(), sep="\n")

            finally:
                os.remove(temp_path)
                os.rmdir(os.path.dirname(temp_path))

    def interactive_loop(self):
        loop=True # Looping allows for an interactive terminal

        while loop and not import_fail:
            print('>>> ', end='')
            command = input()

            if command=="exit" or command=="exit()": # Keywords to leave the engine
                loop=False

            elif command=="clc" or command=="clc()": # matlab terminal clearing must be reimplemented
                self.clear()

            else:
                try:
                    stream = StringIO()
                    err_stream = StringIO()
                    self.eng.eval(command, nargout=0, stdout=stream, stderr=err_stream) # Feed the instructions to Matlab eval
                    print(stream.getvalue())

                except MatlabTerminated:
                    print(stream.getvalue(), err_stream.getvalue(), sep="\n")
                    print("MATLAB process terminated.")
                    print("Restarting MATLAB Engine for Python...")
                    self.eng = matlab.engine.start_matlab()
                    print("Restarted MATLAB process.")

                except : # The other exceptions are handled by Matlab
                    print(stream.getvalue(), err_stream.getvalue(), sep="\n")

        if not import_fail: self.eng.quit()
