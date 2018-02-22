//@flow

import Events from 'events';

type IframeWindowParams = {
    width?: number,
    height?: number,
    minHeight?: number,
    api?: WindowApi,
}

type WindowApi = {
    resizeWindow: ()=>*,
    scrollWindow: ()=>*,
    onWindowScroll: ()=>*,
}

class IframeWindow extends Events{
    constructor(params: IframeWindowParams){
        super();
        params = params || {};
        this._width = params.width || 750;
        this._height = params.height || 600;
        this._minHeight = params.minHeight || this._height;
        this._browserHeight = this.height;
        this._scrollTop = 0;

        this.visibleHeight = this._height;
        this.api = params.api;

        //listen scroll event
        this.api.onWindowScroll((scroll, windowHeight) => {
            if(scroll !== this._scrollTop || windowHeight !== this._browserHeight){
                this._browserHeight = windowHeight;
                this._scrollTop = scroll;
                this._updateVisibleHeight();
            }
        });
    }

    get height(): number{
        return this._height;
    }

    set height(h: number){
        if(h < this._minHeight) h = this._minHeight;
        if(h !== this._height){
            this._height = h;
            this.api.resizeWindow(this._width, this._height);
            this._updateVisibleHeight();
        }
    }

    get width(): number{
        return this._width;
    }

    set width(w: number){
        if(w !== this._width){
            this._width = w;
            this.api.resizeWindow(this._width, this._height);
        }
    }

    get scrollTop(): number{
        return this._scrollTop;
    }

    set scrollTop(s: number){
        if(s !== this._scrollTop){
            this._scrollTop = s;
            this.api.scrollWindow(s);
            this._updateVisibleHeight();
        }
    }

    onScroll(listener: ()=>void){
        this.on("scroll", listener);
        return () => this.removeListener("scroll", listener);
    }

    _updateVisibleHeight(){
        let height = this._height,
            scroll = this._scrollTop,
            windowHeight = this._browserHeight;

        if(scroll < 0){
            windowHeight += scroll;
            if(height < windowHeight) windowHeight = height;
        }
        else if(height - scroll < windowHeight){
            windowHeight = height - scroll;
        }
        this.visibleHeight = windowHeight;
        this.emit("scroll", scroll, this.visibleHeight);
    }
}

export default IframeWindow;