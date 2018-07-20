import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { RootState } from 'store';
import {
    getSelectedCode,
    isValidFileIndex,
    getSelectedFileName,
    getSelectedFileIndex,
    getSelectedIsSaved
} from 'store/userFiles/selectors';
import { editFileCloud, editFileLocal, markFileNotSaved } from 'store/userFiles/actions';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { debounce } from 'lodash';
import JDCanvas from './joydeepcanvas';

const debounceWait = 500; // milliseconds;

type Props = {
    enabled: boolean,
    code: string,
    fileIndex: number,
    fileName: string,
    loggedIn: boolean,
    isSaved: boolean,
    saveCode: (
        fileIndex: number,
        content: string,
    ) => void,
    saveCodeToCloud: (
        fileName: string,
        fileIndex: number,
        content: string,
        loggedIn: boolean,
    ) => void,
    triggerFileLoading: (fileIndex: number) => void,
};

type FileEdit = {
    fileName: string,
    fileIndex: number,
    code: string,
};

type NewWindow = Window & {jdc: JDCanvas};

class CodeEditor extends React.Component<Props> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    fileEditsQueue: FileEdit[];
    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.fileEditsQueue = [];
    }

    componentDidMount() {

        const getCanvasContext
            = (canvasId: string): Partial<{ canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }> => {
                const canvas = (document.getElementById(canvasId) as HTMLCanvasElement);
                if (canvas === null) {
                    return {};
                }
                return { canvas: canvas, context: (canvas.getContext('2d') as CanvasRenderingContext2D) };
            };

        const jdc: JDCanvas = {
            getImageFromCanvas(canvasId: 'inputCanvas' | 'outputCanvas') {
                const { canvas, context } = getCanvasContext(canvasId);
                if (canvas === undefined || context === undefined) {
                    return undefined;
                }
                const width = canvas.width;
                const height = canvas.height;
                return context.getImageData(0, 0, width, height);
            },
            setImageToCanvas(canvasId: 'inputCanvas' | 'outputCanvas', image: ImageData) {
                const { context } = getCanvasContext(canvasId);
                if (context === undefined) {
                    return;
                }
                context.putImageData(image, 0, 0);
            },
            setPixelToImage(image: ImageData, x: number, y: number, color: [number, number, number]) {
                const index = 4 * (y * image.width + x);
                image.data[index] = color[0];
                image.data[index + 1] = color[1];
                image.data[index + 2] = color[2];
                image.data[index + 3] = 255;
            },
            getPixelFromImage(image: ImageData, x: number, y: number) {
                const index = 4 * (y * image.width + x);
                return [
                    image.data[index],
                    image.data[index + 1],
                    image.data[index + 2]
                ];
            }
        };

        (window as NewWindow).jdc = jdc;
    }

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.setPosition({ lineNumber: 10, column: 0 });
        editor.focus();
        monaco.languages.typescript.javascriptDefaults.addExtraLib(`
        declare const jdc: {
            getImageFromCanvas: (canvasId: 'inputCanvas' | 'outputCanvas') => undefined | ImageData;
            setImageToCanvas: (canvasId: 'inputCanvas' | 'outputCanvas', image: ImageData) => void;
            setPixelToImage: (image: ImageData, x: number, y: number, color: [number, number, number]) => void;
            getPixelFromImage: (image: ImageData, x: number, y: number) => [number, number, number];
        };        
        `); // kind of janky that I have to write code in a string
        this.editor = editor;
    }

    componentDidUpdate(prevProps: Props) {
        if (this.editor === undefined) {
            return;
        }
        this.editor.updateOptions({ readOnly: false });
        if (!this.props.enabled) {
            this.editor.updateOptions({ readOnly: true });
        }
        const endingCriteria = prevProps.fileIndex === this.props.fileIndex
            || prevProps.isSaved
            || !prevProps.loggedIn
            || prevProps.fileIndex === -1;

        if (endingCriteria) {
            return;
        }
        this.fileEditsQueue.push({
            fileName: prevProps.fileName,
            fileIndex: prevProps.fileIndex,
            code: prevProps.code,
        });
        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }

    triggerFileLoadingAnim = () => this.props.triggerFileLoading(this.props.fileIndex);

    saveCodeCloudWrapper = () => {
        // tslint:disable-next-line:no-console
        let fileEdit: FileEdit;
        while (this.fileEditsQueue.length > 0) {
            fileEdit = this.fileEditsQueue.shift() as FileEdit;
            if (fileEdit.fileIndex === this.props.fileIndex) {
                continue;
            }
            this.props.saveCodeToCloud(
                fileEdit.fileName,
                fileEdit.fileIndex,
                fileEdit.code,
                this.props.loggedIn
            );
        }
        if (this.props.isSaved) {
            return;
        }
        this.props.saveCodeToCloud(
            this.props.fileName,
            this.props.fileIndex,
            this.props.code,
            this.props.loggedIn
        );

    };

    debouncedSaveCodeCloud = debounce(this.saveCodeCloudWrapper, debounceWait);

    onChange = (code: string) => {
        if (this.props.loggedIn) {
            // this.debouncedFileLoading();
            this.triggerFileLoadingAnim();
            this.debouncedSaveCodeCloud();
        }
        this.props.saveCode(this.props.fileIndex, code);

    };

    render() {
        const { code } = this.props;

        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            fontSize: 18,
            fontFamily: 'Fira Mono',
            // scrollBeyondLastLine: false,
        };

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                    height="calc(100% - 52px)"
                />
            </div >
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    enabled: isValidFileIndex(state),
    code: getSelectedCode(state),
    fileIndex: getSelectedFileIndex(state),
    fileName: getSelectedFileName(state),
    loggedIn: state.userLogin.loggedIn,
    isSaved: getSelectedIsSaved(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    saveCodeToCloud: (
        fileName: string,
        fileIndex: number,
        content: string,
        loggedIn: boolean
    ) => {
        dispatch(editFileCloud(fileName, fileIndex, content, loggedIn));
    },
    saveCode: (
        fileIndex: number,
        content: string,
    ) => {
        dispatch(editFileLocal(fileIndex, content));
    },
    triggerFileLoading: (fileIndex: number) => { dispatch(markFileNotSaved(fileIndex)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);