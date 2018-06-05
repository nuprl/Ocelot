import * as React from 'react';
export default (props: { color: string, className: string }) => (
    <div className={props.className}>
        <svg x="0px" y="0px" viewBox="0 0 24 24" >
            <style type="text/css">
                {`.st0 {
                    fill: none;
                    stroke:${props.color};
                    stroke-linecap:round;
                    stroke-linejoin:round;
                    stroke-miterlimit:10;
                }`}
            </style>
            <path className="st0 SlSmTBKE_0" width="2" height="14" d="M5 5 L7 5 L7 19 L5 19 Z" />
            <path className="st0 SlSmTBKE_1" d="M19,12L9,5.3L9,18.7Z" />
            <style data-made-with="vivus-instant">
                {`.SlSmTBKE_0 {
                    stroke-dasharray: 32 34;
                    stroke-dashoffset: 33;
                    animation:SlSmTBKE_draw 1300ms ease-in-out 0ms forwards;
                    animation-delay: 0.3s;
                }
                .SlSmTBKE_1{
                    stroke-dasharray: 38 40;
                    stroke-dashoffset:39;
                    animation:SlSmTBKE_draw 1300ms ease-in-out 0ms forwards;
                    animation-delay: 0.3s;
                }
                @keyframes SlSmTBKE_draw{
                    100% {
                        stroke-dashoffset: 0;
                    }
                }
                @keyframes SlSmTBKE_fade{
                    0% {
                        stroke-opacity: 1;
                    }
                    92.72727272727273%{
                        stroke-opacity: 1;
                    }
                    100%{
                        stroke-opacity: 0;
                    }
                }
                `}
            </style></svg>
    </div >
);