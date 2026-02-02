declare module 'locomotive-scroll' {
  export default class LocomotiveScroll {
    constructor(options?: any);
    destroy(): void;
    update(): void;
    scrollTo(target: any, options?: any, callback?: () => void): void;
  }
}