/**
 * @module Rendering
 * @submodule Rendering
 * @for p5
 */

'use strict';

var p5 = require('./main');
var constants = require('./constants');
require('./p5.Graphics');
require('./p5.Renderer2D');
require('../webgl/p5.RendererGL');
var defaultId = 'defaultCanvas0'; // this gets set again in createCanvas
var defaultClass = 'p5Canvas';

/**
 * Creates a canvas element in the document, and sets the dimensions of it
 * in pixels. This method should be called only once at the start of setup.
 * Calling <a href="#/p5/createCanvas">createCanvas</a> more than once in a sketch will result in very
 * unpredictable behavior. If you want more than one drawing canvas
 * you could use <a href="#/p5/createGraphics">createGraphics</a> (hidden by default but it can be shown).
 * <br><br>
 * The system variables width and height are set by the parameters passed
 * to this function. If <a href="#/p5/createCanvas">createCanvas()</a> is not used, the window will be
 * given a default size of 100x100 pixels.
 * <br><br>
 * For more ways to position the canvas, see the
 * <a href='https://github.com/processing/p5.js/wiki/Positioning-your-canvas'>
 * positioning the canvas</a> wiki page.
 *
 * @method createCanvas
 * @param  {Number} w width of the canvas
 * @param  {Number} h height of the canvas
 * @param  {Constant} [renderer] either P2D or WEBGL
 * @return {p5.Renderer}
 * @example
 * <div>
 * <code>
 * function setup() {
 *   createCanvas(100, 50);
 *   background(153);
 *   line(0, 0, width, height);
 * }
 * </code>
 * </div>
 *
 * @alt
 * Black line extending from top-left of canvas to bottom right.
 *
 */

p5.prototype.createCanvas = function(w, h, renderer) {
  p5._validateParameters('createCanvas', arguments);
  //optional: renderer, otherwise defaults to p2d
  var r = renderer || constants.P2D;
  var c;

  if (r === constants.WEBGL) {
    c = document.getElementById(defaultId);
    if (c) {
      //if defaultCanvas already exists
      c.parentNode.removeChild(c); //replace the existing defaultCanvas
      var thisRenderer = this._renderer;
      this._elements = this._elements.filter(function(e) {
        return e !== thisRenderer;
      });
    }
    c = document.createElement('canvas');
    c.id = defaultId;
    c.classList.add(defaultClass);
  } else {
    if (!this._defaultGraphicsCreated) {
      c = document.createElement('canvas');
      var i = 0;
      while (document.getElementById('defaultCanvas' + i)) {
        i++;
      }
      defaultId = 'defaultCanvas' + i;
      c.id = defaultId;
      c.classList.add(defaultClass);
    } else {
      // resize the default canvas if new one is created
      c = this.canvas;
    }
  }

  // set to invisible if still in setup (to prevent flashing with manipulate)
  if (!this._setupDone) {
    c.dataset.hidden = true; // tag to show later
    c.style.visibility = 'hidden';
  }

  if (this._userNode) {
    // user input node case
    this._userNode.appendChild(c);
  } else {
    document.body.appendChild(c);
  }

  // Init our graphics renderer
  //webgl mode
  if (r === constants.WEBGL) {
    this._setProperty('_renderer', new p5.RendererGL(c, this, true));
    this._elements.push(this._renderer);
  } else {
    //P2D mode
    if (!this._defaultGraphicsCreated) {
      this._setProperty('_renderer', new p5.Renderer2D(c, this, true));
      this._defaultGraphicsCreated = true;
      this._elements.push(this._renderer);
    }
  }
  this._renderer.resize(w, h);
  this._renderer._applyDefaults();
  return this._renderer;
};

/**
 * Resizes the canvas to given width and height. The canvas will be cleared
 * and draw will be called immediately, allowing the sketch to re-render itself
 * in the resized canvas.
 * @method resizeCanvas
 * @param  {Number} w width of the canvas
 * @param  {Number} h height of the canvas
 * @param  {Boolean} [noRedraw] don't redraw the canvas immediately
 * @example
 * <div class="norender"><code>
 * function setup() {
 *   createCanvas(windowWidth, windowHeight);
 * }
 *
 * function draw() {
 *   background(0, 100, 200);
 * }
 *
 * function windowResized() {
 *   resizeCanvas(windowWidth, windowHeight);
 * }
 * </code></div>
 *
 * @alt
 * No image displayed.
 *
 */
p5.prototype.resizeCanvas = function(w, h, noRedraw) {
  p5._validateParameters('resizeCanvas', arguments);
  if (this._renderer) {
    // save canvas properties
    var props = {};
    for (var key in this.drawingContext) {
      var val = this.drawingContext[key];
      if (typeof val !== 'object' && typeof val !== 'function') {
        props[key] = val;
      }
    }
    this._renderer.resize(w, h);
    this.width = w;
    this.height = h;
    // reset canvas properties
    for (var savedKey in props) {
      try {
        this.drawingContext[savedKey] = props[savedKey];
      } catch (err) {
        // ignore read-only property errors
      }
    }
    if (!noRedraw) {
      this.redraw();
    }
  }
};

/**
 * Removes the default canvas for a p5 sketch that doesn't
 * require a canvas
 * @method noCanvas
 * @example
 * <div>
 * <code>
 * function setup() {
 *   noCanvas();
 * }
 * </code>
 * </div>
 *
 * @alt
 * no image displayed
 *
 */
p5.prototype.noCanvas = function() {
  if (this.canvas) {
    this.canvas.parentNode.removeChild(this.canvas);
  }
};

/**
 * Creates and returns a new p5.Renderer object. Use this class if you need
 * to draw into an off-screen graphics buffer. The two parameters define the
 * width and height in pixels.
 *
 * @method createGraphics
 * @param  {Number} w width of the offscreen graphics buffer
 * @param  {Number} h height of the offscreen graphics buffer
 * @param  {Constant} [renderer] either P2D or WEBGL
 * undefined defaults to p2d
 * @return {p5.Graphics} offscreen graphics buffer
 * @example
 * <div>
 * <code>
 * let pg;
 * function setup() {
 *   createCanvas(100, 100);
 *   pg = createGraphics(100, 100);
 * }
 * function draw() {
 *   background(200);
 *   pg.background(100);
 *   pg.noStroke();
 *   pg.ellipse(pg.width / 2, pg.height / 2, 50, 50);
 *   image(pg, 50, 50);
 *   image(pg, 0, 0, 50, 50);
 * }
 * </code>
 * </div>
 *
 * @alt
 * 4 grey squares alternating light and dark grey. White quarter circle mid-left.
 *
 */
p5.prototype.createGraphics = function(w, h, renderer) {
  p5._validateParameters('createGraphics', arguments);
  return new p5.Graphics(w, h, renderer, this);
};

/**
 * Blends the pixels in the display window according to the defined mode.
 * There is a choice of the following modes to blend the source pixels (A)
 * with the ones of pixels already in the display window (B):
 * <ul>
 * <li><code>BLEND</code> - linear interpolation of colours: C =
 * A\*factor + B. <b>This is the default blending mode.</b></li>
 * <li><code>ADD</code> - sum of A and B</li>
 * <li><code>DARKEST</code> - only the darkest colour succeeds: C =
 * min(A\*factor, B).</li>
 * <li><code>LIGHTEST</code> - only the lightest colour succeeds: C =
 * max(A\*factor, B).</li>
 * <li><code>DIFFERENCE</code> - subtract colors from underlying image.</li>
 * <li><code>EXCLUSION</code> - similar to <code>DIFFERENCE</code>, but less
 * extreme.</li>
 * <li><code>MULTIPLY</code> - multiply the colors, result will always be
 * darker.</li>
 * <li><code>SCREEN</code> - opposite multiply, uses inverse values of the
 * colors.</li>
 * <li><code>REPLACE</code> - the pixels entirely replace the others and
 * don't utilize alpha (transparency) values.</li>
 * <li><code>OVERLAY</code> - mix of <code>MULTIPLY</code> and <code>SCREEN
 * </code>. Multiplies dark values, and screens light values.</li>
 * <li><code>HARD_LIGHT</code> - <code>SCREEN</code> when greater than 50%
 * gray, <code>MULTIPLY</code> when lower.</li>
 * <li><code>SOFT_LIGHT</code> - mix of <code>DARKEST</code> and
 * <code>LIGHTEST</code>. Works like <code>OVERLAY</code>, but not as harsh.
 * </li>
 * <li><code>DODGE</code> - lightens light tones and increases contrast,
 * ignores darks.</li>
 * <li><code>BURN</code> - darker areas are applied, increasing contrast,
 * ignores lights.</li>
 * </ul>
 *
 * @method blendMode
 * @param  {Constant} mode blend mode to set for canvas.
 *                either BLEND, DARKEST, LIGHTEST, DIFFERENCE, MULTIPLY,
 *                EXCLUSION, SCREEN, REPLACE, OVERLAY, HARD_LIGHT,
 *                SOFT_LIGHT, DODGE, BURN, or ADD
 * @example
 * <div>
 * <code>
 * blendMode(LIGHTEST);
 * strokeWeight(30);
 * stroke(80, 150, 255);
 * line(25, 25, 75, 75);
 * stroke(255, 50, 50);
 * line(75, 25, 25, 75);
 * </code>
 * </div>
 * <div>
 * <code>
 * blendMode(MULTIPLY);
 * strokeWeight(30);
 * stroke(80, 150, 255);
 * line(25, 25, 75, 75);
 * stroke(255, 50, 50);
 * line(75, 25, 25, 75);
 * </code>
 * </div>
 * @alt
 * translucent image thick red & blue diagonal rounded lines intersecting center
 * Thick red & blue diagonal rounded lines intersecting center. dark at overlap
 *
 */
p5.prototype.blendMode = function(mode) {
  p5._validateParameters('blendMode', arguments);
  if (
    mode === constants.BLEND ||
    mode === constants.DARKEST ||
    mode === constants.LIGHTEST ||
    mode === constants.DIFFERENCE ||
    mode === constants.MULTIPLY ||
    mode === constants.EXCLUSION ||
    mode === constants.SCREEN ||
    mode === constants.REPLACE ||
    mode === constants.OVERLAY ||
    mode === constants.HARD_LIGHT ||
    mode === constants.SOFT_LIGHT ||
    mode === constants.DODGE ||
    mode === constants.BURN ||
    mode === constants.ADD
  ) {
    this._renderer.blendMode(mode);
  } else if (mode === constants.NORMAL) {
    // Warning added 3/26/19, can be deleted in future (1.0 release?)
    console.warn(
      'NORMAL has been deprecated for use in blendMode. defaulting to BLEND instead.'
    );
    this._renderer.blendMode(constants.BLEND);
  } else {
    throw new Error('Mode ' + mode + ' not recognized.');
  }
};

module.exports = p5;
