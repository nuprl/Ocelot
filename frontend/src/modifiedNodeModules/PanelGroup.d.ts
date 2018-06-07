import * as React from 'react';

type PanelWidthType = {
    size?: number,
    minSize?: number,
    resize?: 'fixed' | 'dynamic' | 'stretch',
    snap?: number[],
};

interface PanelGroupProps {
    spacing?: number;
    borderColor?: string;
    panelColor?: string;
    direction?: 'row' | 'column';
    panelWidths?: PanelWidthType[],
    onUpdate?: (panelWidths: PanelWidthType[]) => void,
}

declare const PanelGroup: React.ComponentType<PanelGroupProps>;

export default PanelGroup;