// kind of janky that I have to write code in a string
export const jdcDeclareStr = `
declare const jdc: {
    /**
     * Given an canvas id, it'll grab the image data from the canvas.
     * @param canvasId - id of canvas
     * @return The image data
     * @memberof JDCanvas
     */
    getImageFromCanvas: (canvasId: 'inputCanvas' | 'outputCanvas') => undefined | ImageData;
    /**
     * Given the canvas ID and image, it'll set the given image data onto the selected canvas.
     * @param canvasId - the id of the canvas
     * @param image the image data (can be acquired through {@link getImageFromCanvas})
     * @memberof JDCanvas
     */
    setImageToCanvas: (canvasId: 'inputCanvas' | 'outputCanvas', image: ImageData) => void;
    /**
     * Given an image data, x-y coordinates and a 3-element tuple, it'll color the pixel at
     * coordinate [x, y] with the given color
     * @param image the image data
     * @param x the x coordinate
     * @param y the y coordinate
     * @param color a 3 element tuple with each value ranging from 0 to 255, [red, green, blue]
     * @memberof JDCanvas
     */
    setPixelToImage: (image: ImageData, x: number, y: number, color: [number, number, number]) => void;
    /**
     * Given an image data and x-y coordinates, it'll return the color of a pixel at [x, y]
     * @param image the image data
     * @param x the x coordinate
     * @param y the y coordinate
     * @return a tuple that looks like [red, green, blue] with each color between values 0 to 255
     * @memberof JDCanvas
     */
    getPixelFromImage: (image: ImageData, x: number, y: number) => [number, number, number];
}
`;

export default interface JDCanvas {
    /**
     * Given an canvas id, it'll grab the image data from the canvas.
     * @param canvasId - id of canvas
     * @return The image data
     * @memberof JDCanvas
     */
    getImageFromCanvas: (canvasId: 'inputCanvas' | 'outputCanvas') => undefined | ImageData;
    /**
     * Given the canvas ID and image, it'll set the given image data onto the selected canvas.
     * @param canvasId - the id of the canvas
     * @param image the image data (can be acquired through {@link getImageFromCanvas})
     * @memberof JDCanvas
     */
    setImageToCanvas: (canvasId: 'inputCanvas' | 'outputCanvas', image: ImageData) => void;
    /**
     * Given an image data, x-y coordinates and a 3-element tuple, it'll color the pixel at
     * coordinate [x, y] with the given color
     * @param image the image data
     * @param x the x coordinate
     * @param y the y coordinate
     * @param color a 3 element tuple with each value ranging from 0 to 255, [red, green, blue]
     * @memberof JDCanvas
     */
    setPixelToImage: (image: ImageData, x: number, y: number, color: [number, number, number]) => void;
    /**
     * Given an image data and x-y coordinates, it'll return the color of a pixel at [x, y]
     * @param image the image data
     * @param x the x coordinate
     * @param y the y coordinate
     * @return a tuple that looks like [red, green, blue] with each color between values 0 to 255
     * @memberof JDCanvas
     */
    getPixelFromImage: (image: ImageData, x: number, y: number) => [number, number, number];
}