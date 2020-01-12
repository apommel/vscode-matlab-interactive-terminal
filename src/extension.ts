// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "matlab-interactive-terminal" is now active!');

	const ext_dir = context.asAbsolutePath('');
	const script_dir = path.join(ext_dir, "/src/python_scripts/");

	const openMlTerminal = () => {
		var script_path = path.join(script_dir, "ml_terminal.py");
		const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
		terminal.sendText("python " + script_path);
		terminal.show();
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.openMatlabTerminal', openMlTerminal));

	const runMlScript = () => {
		if (vscode.window.activeTextEditor == undefined)
		{
			if (vscode.window.activeTerminal == undefined)
			{
				openMlTerminal();
			}
			else if (vscode.window.activeTerminal.name != "Matlab REPL")
			{
				openMlTerminal();
			};
		}
		else
		{
			var current_file = path.basename(vscode.window.activeTextEditor.document.fileName);
			var script_path = path.join(script_dir, "ml_script.py");
			if (vscode.window.activeTerminal == undefined)
			{
				const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
				terminal.sendText("python " + script_path + ' ' + current_file);
				terminal.show();
			}
			else if (vscode.window.activeTerminal.name == "Matlab REPL")
			{
				vscode.window.activeTerminal.sendText(path.parse(current_file).name)
			}
			else
			{
				const terminal = vscode.window.createTerminal({ name: 'Matlab REPL'});
				terminal.sendText("python " + script_path + ' ' + current_file);
				terminal.show();
			};
		}
	};
	context.subscriptions.push(vscode.commands.registerCommand('extension.runMatlabScript', runMlScript));
}

// this method is called when your extension is deactivated
export function deactivate() {}
