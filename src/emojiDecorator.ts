import * as vscode from 'vscode';

export default class EmojiDecorator {
    private _activeEditor: vscode.TextEditor;

    private readonly regExPrefix: string;
	private readonly regEx: RegExp;
    private readonly decorationTypes: {[emojiUnicode: string]: vscode.TextEditorDecorationType};
    
    constructor(activeEditor: vscode.TextEditor) {
		this.regExPrefix = "param_data=\"";
        this.regEx = new RegExp(this.regExPrefix + "(U\\+1F.{3}|U\\+2.{3})", "g");
        this.decorationTypes =  {};

		this._activeEditor = activeEditor;
		this.updateDecorations = this.updateDecorations.bind(this);
    }

	get activeEditor(): vscode.TextEditor {
		return this._activeEditor;
	}

    set activeEditor(activeEditor: vscode.TextEditor) {
		this._activeEditor = activeEditor;
    }

    updateDecorations() {
		if (!this._activeEditor) {
			return;
		}

		for (const [_, decorationType] of Object.entries(this.decorationTypes)) {
			this._activeEditor.setDecorations(decorationType, []);
		}

		const text = this._activeEditor.document.getText();
		const decorationOptions: {[emojiUnicode: string]: vscode.DecorationOptions[]} = {};
		let match;

		while (match = this.regEx.exec(text)) {
			const emojiUnicode = match[1];
			const startPos = this._activeEditor.document.positionAt(match.index + this.regExPrefix.length);
			const endPos = this._activeEditor.document.positionAt(match.index + this.regExPrefix.length + emojiUnicode.length);
	
			if (!(emojiUnicode in this.decorationTypes)) {
				const decorationType = this.createEmojiGutterDecoration(emojiUnicode);
				this.decorationTypes[emojiUnicode] = decorationType;
			}
			if (!(emojiUnicode in decorationOptions)) {
				decorationOptions[emojiUnicode] = [];
			}
			decorationOptions[emojiUnicode].push({
				range: new vscode.Range(startPos, endPos)
			});
		}
	
		for (const [emojiUnicode, decorationOption] of Object.entries(decorationOptions)) {
			this._activeEditor.setDecorations(this.decorationTypes[emojiUnicode], decorationOption);
		}
    }
    
    private createEmojiGutterDecoration(emojiUnicode: string): vscode.TextEditorDecorationType {
        const emojiCode = emojiUnicode.split('+')[1];
        const convertedEmoji = String.fromCodePoint(parseInt(emojiCode, 16));
        return vscode.window.createTextEditorDecorationType({
            before: {
                contentText: convertedEmoji
            }
        });
    }
}