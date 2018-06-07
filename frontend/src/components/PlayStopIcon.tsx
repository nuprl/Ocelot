import * as React from 'react';
export const PlayStopFillIcon = (props: { color: string, className: string }) => (
    <div className={props.className}>
        <svg x="0px" y="0px" viewBox="0 0 24 24" >
            <style type="text/css">
                {`
            .st0{
                fill: none;
                stroke:${props.color};
                stroke-linecap:round;
                stroke-linejoin:round;
                stroke-miterlimit:10;
            }
            `}
            </style>
            <path className="st0 mpgQdRkc_0" d="M9,9.7L12.2,7.5" />
            <path className="st0 mpgQdRkc_1" d="M9,13L14.7,9.2" />
            <path className="st0 mpgQdRkc_2" d="M9,16.3L17.2,10.8" />
            <path className="st0 mpgQdRkc_3" d="M19,12L9,5.3L9,18.7Z" />
            <path className="st0 mpgQdRkc_4" width="2" height="14" d="M5 5 L7 5 L7 19 L5 19 Z" />
            <style data-made-with="vivus-instant">
                {`
                    .mpgQdRkc_0 {
                        stroke-dasharray: 4 6;
                        stroke-dashoffset:5;
                        animation:mpgQdRkc_draw 1800ms ease 0ms forwards;
                        animation-delay: 0.4s;
                    }
                    .mpgQdRkc_1 {
                        stroke-dasharray: 7 9;
                        stroke-dashoffset:8;
                        animation:mpgQdRkc_draw 1800ms ease 0ms forwards;
                        animation-delay: 0.4s;
                    }
                    .mpgQdRkc_2 {
                        stroke-dasharray: 10 12;
                        stroke-dashoffset:11;
                        animation:mpgQdRkc_draw 1800ms ease 0ms forwards;
                        animation-delay: 0.4s;
                    }
                    .mpgQdRkc_3 {
                        stroke-dasharray: 38 40;
                        stroke-dashoffset:39;
                        animation:mpgQdRkc_draw 1800ms ease 0ms forwards;
                        animation-delay: 0.4s;
                    }
                    .mpgQdRkc_4 {
                        stroke-dasharray: 32 34;
                        stroke-dashoffset:33;
                        animation:mpgQdRkc_draw 1800ms ease 0ms forwards;
                        animation-delay: 0.4s;
                    }
                    @keyframes mpgQdRkc_draw {
                        100% {
                            stroke-dashoffset: 0;
                        }
                    }
                    @keyframes mpgQdRkc_fade {
                        0% {
                            stroke-opacity: 1;
                        }
                        93.33333333333333%{
                            stroke-opacity: 1;
                        }
                        100%{
                            stroke-opacity: 0;
                        }
                    }
                `}
            </style>
        </svg>
    </div >);

export const PlayStopIcon = (props: { color: string, className: string }) => (
    <svg viewBox="0 0 24 24" x="0px" y="0px" className={props.className}>
        <style>
            {`.st0 {
            fill: none;
            stroke: ${props.color};
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-miterlimit: 10;
        }`}
        </style>
        <path className="st0 YwKqaLBE_0" d="M19,12L9,5.3L9,18.7Z" />
        <path className="st0 YwKqaLBE_1" d="M5 5 L7 5 L7 19 L5 19 Z" height="14" width="2" />
        <style data-made-with="vivus-instant">
            {`.YwKqaLBE_0 {
                stroke-dasharray: 38 40;
                stroke-dashoffset: 39;
                animation: YwKqaLBE_draw 1800ms ease 0ms forwards;
                animation-delay: 0.4s;
            }
            .YwKqaLBE_1 {
                stroke-dasharray: 32 34;
                stroke-dashoffset: 33;
                animation: YwKqaLBE_draw 1800ms ease 0ms forwards;
                animation-delay: 0.4s;
            }
            @keyframes YwKqaLBE_draw {
                100% {
                    stroke-dashoffset: 0;
                }
            }
            @keyframes YwKqaLBE_fade {
                0% {
                    stroke-opacity: 1;
                }
                93.33333333333333% {
                    stroke-opacity: 1;
                }
                100% {
                    stroke-opacity: 0;
                }

            }`}
        </style>
    </svg>
);