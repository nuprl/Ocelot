export default interface JDCanvas {
    getImageFromCanvas: (canvasId: 'inputCanvas' | 'outputCanvas') => undefined | ImageData;
    setImageToCanvas: (canvasId: 'inputCanvas' | 'outputCanvas', image: ImageData) => void;
    setPixelToImage: (image: ImageData, x: number, y: number, color: [number, number, number]) => void;
    getPixelFromImage: (image: ImageData, x: number, y: number) => [number, number, number];
}