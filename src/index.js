import Events from 'events';

class IframeWindow extends Events{
    /**
     * Constructor. Class for working with window in iframe
     * @param {Object} params
     * @param {Number} params.width
     * @param {Number} params.height
     * @param {Number} params.minHeight
     * @param {Object} params.api
     * @param {Function} params.api.resizeWindow - method for resizing iframe size
     * @param {Function} params.api.scrollWindow - method for scrolling a top window
     * @param {Function} params.api.onWindowScroll - set callback for onScroll event on top window
     */
    constructor(params){
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

    /**
     * Iframe height.
     * @return {number}
     */
    get height(){
        return this._height;
    }

    /**
     * Set iframe height.
     * @param {number} h
     */
    set height(h){
        if(h < this._minHeight) h = this._minHeight;
        if(h !== this._height){
            this._height = h;
            this.api.resizeWindow(this._width, this._height);
            this._updateVisibleHeight();
        }
    }

    /**
     * Iframe width.
     * @return {number}
     */
    get width(){
        return this._width;
    }

    /**
     * Setter for iframe width.
     * @param {number} w
     */
    set width(w){
        if(w !== this._width){
            this._width = w;
            this.api.resizeWindow(this._width, this._height);
        }
    }

    /**
     * Scroll position.
     * @return {number}
     */
    get scrollTop(){
        return this._scrollTop;
    }

    /**
     * Set scroll for parent window through api.
     * @param {number} s
     */
    set scrollTop(s){
        if(s !== this._scrollTop){
            this._scrollTop = s;
            this.api.scrollWindow(s);
            this._updateVisibleHeight();
        }
    }

    /**
     * Add scroll listener.
     * @param {function} listener
     * @return {function} - returns function for remove added listener.
     */
    onScroll(listener){
        this.on("scroll", listener);
        return () => this.removeListener("scroll", listener);
    }

    /**
     * Update iframe's visible height
     * @private
     */
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
        this.emit("scroll");
    }
}

export default IframeWindow;