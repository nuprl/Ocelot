import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import './../styles/Jumbotron.css';

type State = {
    code: string
};

class Jumbotron extends React.Component<{}, State> {

    state = {
        code: '// type your code...',
    };

    editor: any;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
    }

    // onChange = (newValue: string, event: monacoEditor.editor.IModelContentChangedEvent) => {
    //     // tslint:disable-next-line:no-console
    //     console.log('onChange', newValue, event);
    // }

    handleResize = () => {
        if (this.editor !== null) {
            this.editor.layout();
            // tslint:disable-next-line:no-console
            console.log(this.state.code);
        }

    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    render() {
        // const { code } = this.state;
        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true
        };

        return (
            <div className="jumboContainer">
                <div className="col">
                    <MonacoEditor // using this causes errors during development
                    // but the production works fine so it's okay.
                        language="javascript"
                        theme="vs-dark"
                        // value={code}
                        options={options}
                        // onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />
                </div>
                <div className="col">
                    <canvas />
                </div>
            </div>
        );
    }
}

export default Jumbotron;