# Developed by Aurelien Pommel and other contributors

# Trying to have a basic Python 2 compatibility
from __future__ import print_function

try:
    input = raw_input
except NameError:
    pass

import os
import io
from contextlib import redirect_stdout
from textwrap import dedent

global import_fail
try: # Check if the Matlab Engine is installed
    import matlab.engine
    from matlab.engine import RejectedExecutionError as MatlabTerminated
except ImportError:
    print("Matlab Engine for Python cannot be detected. Please install it for the extension to work.")
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
                MATLAB Interactive Terminal (R{version})
                
                To get started, type one of these commands:
                    helpwin          Provide access to help comments for all functions
                    helpdesk         Open help browser
                    demo             Access product examples in Help browser
                
                For product information, visit https://www.mathworks.com.\
                '''.format(version=self.version())
                print(intro)

            except Exception as e:
                self.clear()
                print("MATLAB Engine for Python exited prematurely.")
                print(str(e))

        else:
            print("Launching MATLAB failed: Error starting MATLAB process in MATLAB Engine for Python.")

    def clear(self):
        os.system(self.cls_str)

    def version(self):
        strio = io.StringIO()

        with redirect_stdout(strio) as f:
            version_str = "version '-release'"
            self.eng.eval(version_str, nargout=0)

        return f.getvalue()

    def run_script(self, script_path):
        if not import_fail:
            try:
                print("File: \"%s\""%script_path)
                self.eng.run(script_path, nargout=0)

            except MatlabTerminated:
                print("MATLAB process was terminated. Restarting the engine...")
                self.eng = matlab.engine.start_matlab()
                print("Matlab process restarted.")

            except : # The other exceptions are handled by Matlab
                pass

    def run_selection(self, temp_path):
        if not import_fail:
            f = open(temp_path, 'r')
            print("Running current selection in Visual Studio Code:")

            try: # Print the content of the selection before running it, encoding issues can happen
                print('')
                for line in f:
                    print('    ' + line, end='')

            except UnicodeDecodeError as err:
                print('')
                print(str(err))

            print('\n')
            f.close()

            try:
                self.eng.run(temp_path, nargout=0)

            except MatlabTerminated:
                print("MATLAB process terminated.")
                print("Restarting MATLAB Engine for Python...")
                self.eng = matlab.engine.start_matlab()
                print("Restarted MATLAB process.")

            except : # The other exceptions are handled by Matlab
                pass

            finally:
                try:
                    os.remove(temp_path)
                    os.rmdir(os.path.dirname(temp_path))

                except OSError:
                    pass

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
                    self.eng.eval(command, nargout=0) # Feed the instructions to Matlab eval

                except MatlabTerminated:
                    print("MATLAB process terminated.")
                    print("Restarting MATLAB Engine for Python...")
                    self.eng = matlab.engine.start_matlab()
                    print("Restarted MATLAB process.")

                except : # The other exceptions are handled by Matlab
                    pass

        if not import_fail: self.eng.quit()
