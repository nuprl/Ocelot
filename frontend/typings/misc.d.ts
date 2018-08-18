declare module 'jss-preset-default';
declare module 'react-jss/*';
declare module '*.jpg';
declare module '*.png';

declare module "worker-loader*" {
  class WebpackWorker extends Worker {
      constructor();
  }

  export = WebpackWorker;
}