var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React from 'react';
import ReactDOM from 'react-dom';

var PanelGroup = function (_React$Component) {
  _inherits(PanelGroup, _React$Component);

  // Load initial panel configuration from props
  function PanelGroup() {
    _classCallCheck(this, PanelGroup);

    var _this = _possibleConstructorReturn(this, _React$Component.apply(this, arguments));

    _this.loadPanels = function (props) {
      var panels = [];

      if (props.children) {

        // Default values if none were provided
        var defaultSize = 256;
        var defaultMinSize = 48;
        var defaultResize = "stretch";

        var stretchIncluded = false;
        var children = React.Children.toArray(props.children);

        for (var i = 0; i < children.length; i++) {

          if (i < props.panelWidths.length && props.panelWidths[i]) {
            var widthObj = {
              size: props.panelWidths[i].size !== undefined ? props.panelWidths[i].size : defaultSize,
              minSize: props.panelWidths[i].minSize !== undefined ? props.panelWidths[i].minSize : defaultMinSize,
              resize: props.panelWidths[i].resize ? props.panelWidths[i].resize : props.panelWidths[i].size ? "dynamic" : defaultResize,
              snap: props.panelWidths[i].snap !== undefined ? props.panelWidths[i].snap : []
            };
            panels.push(widthObj);
          } else {
            // default values if no props are given
            panels.push({ size: defaultSize, resize: defaultResize, minSize: defaultMinSize, snap: [] });
          }

          // if none of the panels included was stretchy, make the last one stretchy
          if (panels[i].resize === "stretch") stretchIncluded = true;
          if (!stretchIncluded && i === children.length - 1) panels[i].resize = "stretch";
        }
      }

      return {
        panels: panels
      };
    };

    _this.onUpdate = function (panels) {
      if (_this.props.onUpdate) {
        _this.props.onUpdate(panels.slice());
      }
    };

    _this.getSizeDirection = function (caps) {
      if (caps) return _this.props.direction === "column" ? "Height" : "Width";else return _this.props.direction === "column" ? "height" : "width";
    };

    _this.handleResize = function (i, delta) {
      var tempPanels = _this.state.panels.slice();
      var returnDelta = _this.resizePanel(i, _this.props.direction === "row" ? delta.x : delta.y, tempPanels);
      _this.setState({ panels: tempPanels });
      _this.onUpdate(tempPanels);
      return returnDelta;
    };

    _this.resizePanel = function (panelIndex, delta, panels) {

      // 1) first let's calculate and make sure all the sizes add up to be correct.
      var masterSize = 0;
      for (var iti = 0; iti < panels.length; iti += 1) {
        masterSize += panels[iti].size;
      }
      var boundingRect = ReactDOM.findDOMNode(_this).getBoundingClientRect();
      var boundingSize = (_this.props.direction == "column" ? boundingRect.height : boundingRect.width) - _this.props.spacing * (_this.props.children.length - 1);
      if (masterSize != boundingSize) {
        // console.log(panels[0], panels[1]);
        // console.log("ERROR! SIZES DON'T MATCH!: ", masterSize, boundingSize);
        // 2) Rectify the situation by adding all the unacounted for space to the first panel
        // panels[panelIndex].size += boundingSize - masterSize;
      }

      var minsize;var maxsize;

      // track the progressive delta so we can report back how much this panel
      // actually moved after all the adjustments have been made
      var resultDelta = delta;

      // make the changes and deal with the consequences later
      panels[panelIndex].size += delta;
      panels[panelIndex + 1].size -= delta;

      // Min and max for LEFT panel
      minsize = _this.getPanelMinSize(panelIndex, panels);
      maxsize = _this.getPanelMaxSize(panelIndex, panels);

      // if we made the left panel too small
      if (panels[panelIndex].size < minsize) {
        var _delta = minsize - panels[panelIndex].size;

        if (panelIndex === 0) resultDelta = _this.resizePanel(panelIndex, _delta, panels);else resultDelta = _this.resizePanel(panelIndex - 1, -_delta, panels);
      };

      // if we made the left panel too big
      if (maxsize !== 0 && panels[panelIndex].size > maxsize) {
        var _delta2 = panels[panelIndex].size - maxsize;

        if (panelIndex === 0) resultDelta = _this.resizePanel(panelIndex, -_delta2, panels);else resultDelta = _this.resizePanel(panelIndex - 1, _delta2, panels);
      };

      // Min and max for RIGHT panel
      minsize = _this.getPanelMinSize(panelIndex + 1, panels);
      maxsize = _this.getPanelMaxSize(panelIndex + 1, panels);

      // if we made the right panel too small
      if (panels[panelIndex + 1].size < minsize) {
        var _delta3 = minsize - panels[panelIndex + 1].size;

        if (panelIndex + 1 === panels.length - 1) resultDelta = _this.resizePanel(panelIndex, -_delta3, panels);else resultDelta = _this.resizePanel(panelIndex + 1, _delta3, panels);
      };

      // if we made the right panel too big
      if (maxsize !== 0 && panels[panelIndex + 1].size > maxsize) {
        var _delta4 = panels[panelIndex + 1].size - maxsize;

        if (panelIndex + 1 === panels.length - 1) resultDelta = _this.resizePanel(panelIndex, _delta4, panels);else resultDelta = _this.resizePanel(panelIndex + 1, -_delta4, panels);
      };

      // Iterate through left panel's snap positions
      for (var i = 0; i < panels[panelIndex].snap.length; i++) {
        if (Math.abs(panels[panelIndex].snap[i] - panels[panelIndex].size) < 20) {

          var _delta5 = panels[panelIndex].snap[i] - panels[panelIndex].size;

          if (_delta5 !== 0 && panels[panelIndex].size + _delta5 >= _this.getPanelMinSize(panelIndex, panels) && panels[panelIndex + 1].size - _delta5 >= _this.getPanelMinSize(panelIndex + 1, panels)) resultDelta = _this.resizePanel(panelIndex, _delta5, panels);
        }
      }

      // Iterate through right panel's snap positions
      for (var _i = 0; _i < panels[panelIndex + 1].snap.length; _i++) {
        if (Math.abs(panels[panelIndex + 1].snap[_i] - panels[panelIndex + 1].size) < 20) {

          var _delta6 = panels[panelIndex + 1].snap[_i] - panels[panelIndex + 1].size;

          if (_delta6 !== 0 && panels[panelIndex].size + _delta6 >= _this.getPanelMinSize(panelIndex, panels) && panels[panelIndex + 1].size - _delta6 >= _this.getPanelMinSize(panelIndex + 1, panels)) resultDelta = _this.resizePanel(panelIndex, -_delta6, panels);
        }
      }

      // return how much this panel actually resized
      return resultDelta;
    };

    _this.getPanelMinSize = function (panelIndex, panels) {
      if (panels[panelIndex].resize === "fixed") {
        if (!panels[panelIndex].fixedSize) {
          panels[panelIndex].fixedSize = panels[panelIndex].size;
        }
        return panels[panelIndex].fixedSize;
      }
      return panels[panelIndex].minSize;
    };

    _this.getPanelMaxSize = function (panelIndex, panels) {
      if (panels[panelIndex].resize === "fixed") {
        if (!panels[panelIndex].fixedSize) {
          panels[panelIndex].fixedSize = panels[panelIndex].size;
        }
        return panels[panelIndex].fixedSize;
      }
      return 0;
    };

    _this.getPanelGroupMinSize = function (spacing) {
      var size = 0;
      for (var i = 0; i < _this.state.panels.length; i++) {
        size += _this.getPanelMinSize(i, _this.state.panels);
      }
      return size + (_this.state.panels.length - 1) * spacing;
    };

    _this.setPanelSize = function (panelIndex, size, callback) {
      size = _this.props.direction === "column" ? size.y : size.x;
      if (size !== _this.state.panels[panelIndex].size) {
        var tempPanels = _this.state.panels;
        //make sure we can actually resize this panel this small
        if (size < tempPanels[panelIndex].minSize) {
          var diff = tempPanels[panelIndex].minSize - size;
          tempPanels[panelIndex].size = tempPanels[panelIndex].minSize;

          // 1) Find all of the dynamic panels that we can resize and
          // decrease them until the difference is gone
          for (var i = 0; i < tempPanels.length; i = i + 1) {
            if (i != panelIndex && tempPanels[i].resize === "dynamic") {
              var available = tempPanels[i].size - tempPanels[i].minSize;
              var cut = Math.min(diff, available);
              tempPanels[i].size = tempPanels[i].size - cut;
              // if the difference is gone then we are done!
              diff = diff - cut;
              if (diff == 0) {
                break;
              }
            }
          }
        } else {
          tempPanels[panelIndex].size = size;
        }
        _this.setState({ panels: tempPanels });

        if (panelIndex > 0) {
          _this.handleResize(panelIndex - 1, { x: 0, y: 0 });
        } else if (_this.state.panels.length > 2) {
          _this.handleResize(panelIndex + 1, { x: 0, y: 0 });
        }

        if (callback) {
          callback();
        }
      }
    };

    _this.state = _this.loadPanels(_this.props);
    return _this;
  }

  // reload panel configuration if props update


  PanelGroup.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {

    var nextPanels = nextProps.panelWidths;

    // Only update from props if we're supplying the props in the first place
    if (nextPanels.length) {

      // if the panel array is a different size we know to update
      if (this.state.panels.length !== nextPanels.length) {
        this.setState(this.loadPanels(nextProps));
      }
      // otherwise we need to iterate to spot any difference
      else {
          for (var i = 0; i < nextPanels.length; i++) {
            if (this.state.panels[i].size !== nextPanels[i].size || this.state.panels[i].minSize !== nextPanels[i].minSize || this.state.panels[i].resize !== nextPanels[i].resize) {
              this.setState(this.loadPanels(nextProps));
              break;
            }
          }
        }
    }
  };

  // load provided props into state


  // Pass internal state out if there's a callback for it
  // Useful for saving panel configuration


  // For styling, track which direction to apply sizing to


  // Render component
  PanelGroup.prototype.render = function render() {
    var _container;

    var style = {
      container: (_container = {
        width: "100%",
        height: "100%"
      }, _container["min" + this.getSizeDirection(true)] = this.getPanelGroupMinSize(this.props.spacing), _container.display = "flex", _container.flexDirection = this.props.direction, _container.flexGrow = 1, _container),
      panel: {
        flexGrow: 0,
        display: "flex"
      }
    };

    // lets build up a new children array with added resize borders
    var initialChildren = React.Children.toArray(this.props.children);
    var newChildren = [];
    var stretchIncluded = false;

    for (var i = 0; i < initialChildren.length; i++) {
      var _panelStyle;

      // setting up the style for this panel.  Should probably be handled
      // in the child component, but this was easier for now
      var panelStyle = (_panelStyle = {}, _panelStyle[this.getSizeDirection()] = this.state.panels[i].size, _panelStyle[this.props.direction === "row" ? "height" : "width"] = "100%", _panelStyle["min" + this.getSizeDirection(true)] = this.state.panels[i].resize === "stretch" ? 0 : this.state.panels[i].size, _panelStyle.flexGrow = this.state.panels[i].resize === "stretch" ? 1 : 0, _panelStyle.flexShrink = this.state.panels[i].resize === "stretch" ? 1 : 0, _panelStyle.display = "flex", _panelStyle.overflow = "hidden", _panelStyle.position = "relative", _panelStyle);

      // patch in the background color if it was supplied as a prop
      Object.assign(panelStyle, { backgroundColor: this.props.panelColor });

      // give position info to children
      var metadata = {
        isFirst: i === 0 ? true : false,
        isLast: i === initialChildren.length - 1 ? true : false,
        resize: this.state.panels[i].resize,

        // window resize handler if this panel is stretchy
        onWindowResize: this.state.panels[i].resize === "stretch" ? this.setPanelSize : null
      };

      // if none of the panels included was stretchy, make the last one stretchy
      if (this.state.panels[i].resize === "stretch") stretchIncluded = true;
      if (!stretchIncluded && metadata.isLast) metadata.resize = "stretch";

      // push children with added metadata
      newChildren.push(React.createElement(
        Panel,
        _extends({ style: panelStyle, key: "panel" + i, panelID: i }, metadata),
        initialChildren[i]
      ));

      // add a handle between panels
      if (i < initialChildren.length - 1) {
        newChildren.push(React.createElement(Divider, { borderColor: this.props.borderColor, key: "divider" + i, panelID: i, handleResize: this.handleResize, dividerWidth: this.props.spacing, direction: this.props.direction, showHandles: this.props.showHandles }));
      }
    }

    return React.createElement(
      'div',
      { className: 'panelGroup', style: style.container },
      newChildren
    );
  };

  // Entry point for resizing panels.
  // We clone the panel array and perform operations on it so we can
  // setState after the recursive operations are finished


  // Recursive panel resizing so we can push other panels out of the way
  // if we've exceeded the target panel's extents


  // Utility function for getting min pixel size of panel


  // Utility function for getting max pixel size of panel


  // Utility function for getting min pixel size of the entire panel group


  // Hard-set a panel's size
  // Used to recalculate a stretchy panel when the window is resized


  return PanelGroup;
}(React.Component);

PanelGroup.defaultProps = {
  spacing: 1,
  direction: "row",
  panelWidths: []
};

var Panel = function (_React$Component2) {
  _inherits(Panel, _React$Component2);

  function Panel() {
    var _temp, _this2, _ret;

    _classCallCheck(this, Panel);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, _React$Component2.call.apply(_React$Component2, [this].concat(args))), _this2), _this2.onResizeObjectLoad = function () {
      _this2.refs.resizeObject.contentDocument.defaultView.addEventListener("resize", function () {
        return _this2.calculateStretchWidth();
      });
    }, _this2.onNextFrame = function (callback) {
      setTimeout(function () {
        window.requestAnimationFrame(callback);
      }, 0);
    }, _this2.calculateStretchWidth = function () {
      if (_this2.props.onWindowResize !== null) {
        var rect = ReactDOM.findDOMNode(_this2).getBoundingClientRect();

        _this2.props.onWindowResize(_this2.props.panelID, { x: rect.width, y: rect.height });
      }
    }, _temp), _possibleConstructorReturn(_this2, _ret);
  }

  // Find the resizeObject if it has one
  Panel.prototype.componentDidMount = function componentDidMount() {
    var _this3 = this;

    if (this.props.resize === "stretch") {
      this.refs.resizeObject.addEventListener("load", function () {
        return _this3.onResizeObjectLoad();
      });
      this.refs.resizeObject.data = "about:blank";
      this.calculateStretchWidth();
    }
  };

  // Attach resize event listener to resizeObject


  // Utility function to wait for next render before executing a function


  // Recalculate the stretchy panel if it's container has been resized


  // Render component
  Panel.prototype.render = function render() {

    var style = {
      resizeObject: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        opacity: 0
      }
    };

    // only attach resize object if panel is stretchy.  Others dont need it
    var resizeObject = this.props.resize === "stretch" ? React.createElement('object', { style: style.resizeObject, ref: 'resizeObject', type: 'text/html' }) : null;

    return React.createElement(
      'div',
      { className: 'panelWrapper', style: this.props.style },
      resizeObject,
      this.props.children
    );
  };

  return Panel;
}(React.Component);

var Divider = function (_React$Component3) {
  _inherits(Divider, _React$Component3);

  function Divider() {
    _classCallCheck(this, Divider);

    var _this4 = _possibleConstructorReturn(this, _React$Component3.apply(this, arguments));

    _this4.onMouseDown = function (e) {

      // only left mouse button
      if (e.button !== 0) return;

      _this4.setState({
        dragging: true,
        initPos: {
          x: e.pageX,
          y: e.pageY
        }
      });

      e.stopPropagation();
      e.preventDefault();
    };

    _this4.onMouseUp = function (e) {
      _this4.setState({ dragging: false });
      e.stopPropagation();
      e.preventDefault();
    };

    _this4.onMouseMove = function (e) {
      if (!_this4.state.dragging) return;

      var initDelta = {
        x: e.pageX - _this4.state.initPos.x,
        y: e.pageY - _this4.state.initPos.y
      };

      var flowMask = {
        x: _this4.props.direction === "row" ? 1 : 0,
        y: _this4.props.direction === "column" ? 1 : 0
      };

      var flowDelta = initDelta.x * flowMask.x + initDelta.y * flowMask.y;

      // Resize the panels
      var resultDelta = _this4.handleResize(_this4.props.panelID, initDelta);

      // if the divider moved, reset the initPos
      if (resultDelta + flowDelta !== 0) {

        // Did we move the expected amount? (snapping will result in a larger delta)
        var expectedDelta = resultDelta === flowDelta;

        _this4.setState({
          initPos: {
            // if we moved more than expected, add the difference to the Position
            x: e.pageX + (expectedDelta ? 0 : resultDelta * flowMask.x),
            y: e.pageY + (expectedDelta ? 0 : resultDelta * flowMask.y)
          }
        });
      }

      e.stopPropagation();
      e.preventDefault();
    };

    _this4.handleResize = function (i, delta) {
      return _this4.props.handleResize(i, delta);
    };

    _this4.getHandleWidth = function () {
      return _this4.props.dividerWidth + _this4.props.handleBleed * 2;
    };

    _this4.getHandleOffset = function () {
      return _this4.props.dividerWidth / 2 - _this4.getHandleWidth() / 2;
    };

    _this4.state = {
      dragging: false,
      initPos: { x: null, y: null }
    };
    return _this4;
  }

  // Add/remove event listeners based on drag state


  Divider.prototype.componentDidUpdate = function componentDidUpdate(props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  };

  // Start drag state and set initial position


  // End drag state


  // Call resize handler if we're dragging


  // Handle resizing


  // Utility functions for handle size provided how much bleed
  // we want outside of the actual divider div


  // Render component
  Divider.prototype.render = function render() {
    var style = {
      divider: {
        width: this.props.direction === "row" ? this.props.dividerWidth : "auto",
        minWidth: this.props.direction === "row" ? this.props.dividerWidth : "auto",
        maxWidth: this.props.direction === "row" ? this.props.dividerWidth : "auto",
        height: this.props.direction === "column" ? this.props.dividerWidth : "auto",
        minHeight: this.props.direction === "column" ? this.props.dividerWidth : "auto",
        maxHeight: this.props.direction === "column" ? this.props.dividerWidth : "auto",
        flexGrow: 0,
        position: "relative"
      },
      handle: {
        position: "absolute",
        width: this.props.direction === "row" ? this.getHandleWidth() : "100%",
        height: this.props.direction === "column" ? this.getHandleWidth() : "100%",
        left: this.props.direction === "row" ? this.getHandleOffset() : 0,
        top: this.props.direction === "column" ? this.getHandleOffset() : 0,
        backgroundColor: this.props.showHandles ? "rgba(0,128,255,0.25)" : "auto",
        cursor: this.props.direction === "row" ? "col-resize" : "row-resize",
        zIndex: 100
      }
    };
    Object.assign(style.divider, { backgroundColor: this.props.borderColor });

    // Add custom class if dragging
    var className = "divider";
    if (this.state.dragging) {
      className += " dragging";
    }

    return React.createElement(
      'div',
      { className: className, style: style.divider, onMouseDown: this.onMouseDown },
      React.createElement('div', { style: style.handle })
    );
  };

  return Divider;
}(React.Component);

Divider.defaultProps = {
  dividerWidth: 1,
  handleBleed: 4
};

export default PanelGroup;