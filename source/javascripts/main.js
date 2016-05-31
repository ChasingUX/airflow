jsPlumb.ready(function () {
  var dynamicAnchors = [ [ 0.5, 1, 0, 1 ], [ 0.5, 0, 0, -1 ],  [ 1, 0.5, 1, 0 ], [ 0, 0.5, -1, 0 ] ];

  $('.window').each(function(){
    $(this).append("<span class='add'>+</span>");

    if($(this).data('sidebar')=='yes') {
      $(this).append("<span class='hasSide'></span>")
    }

    var leftPos = $(this).css('left');
    $(this).css('left', leftPos);

  });

  $('.wrapper').on("mouseenter", ".window", function() {
      $(this).addClass('hover');
  });

  $('.wrapper').on("mouseleave", ".window", function() {
      $(this).removeClass('hover');
  });

  var instance = window.jsp = jsPlumb.getInstance({
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      ConnectionOverlays: [
        [ "Arrow", {
          location: 1,
          visible:true,
          width:9,
          length:9,
          foldback:1,
          id:"ARROW",
          paintStyle: {strokeStyle: "#f5f5f5", lineWidth: 3 }
        } ],
        [ "Label", {
          location: 0.73,
          id: "label",
          cssClass: "aLabel",
          paintStyle: {fillStyle: "#00d1c1" }
        }]
    ],
    Container: "canvas"
  });

  var basicType = {
    connector: "StateMachine",
    paintStyle: { strokeStyle: "#ff5a5f", fillStyle: "white", radius: 5, lineWidth: 1.4 },
    isSource: true,
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle,
    overlays: [
      "Arrow"
    ]
  };

  instance.registerConnectionType("basic", basicType);

  // this is the paint style for the connecting lines..
  var connectorPaintStyle = {
    lineWidth: 1,
    strokeStyle: "#00d1c1",
    joinstyle: "round",
    outlineColor: "#F5F5F5",
    outlineWidth: 1
  },
// .. and this is the hover style.
  connectorHoverStyle = {
    strokeStyle: "#ff5a5f",
  },
  endpointHoverStyle = {
    fillStyle: "#ff5a5f",
    strokeStyle: "#ff5a5f"
  },
  targetHoverStyle = {
    fillStyle: "transparent"
  },
// the definition of source endpoints 
  sourceEndpoint = {
    endpoint: "Dot",
    paintStyle: { strokeStyle: "#ff5a5f", fillStyle: "white", radius: 4, lineWidth: 1.2 },
    isSource: true,
    maxConnections: 4,
    connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},
      
  },
// the definition of target endpoints (will appear when the user drags a connection)
  targetEndpoint = {
    endpoint: "Dot",
    
    cssClass: "dropZone",
    paintStyle: { fillStyle: "transparent", radius: 5},
    hoverPaintStyle: targetHoverStyle,
    maxConnections: 4,
    dropOptions: { hoverClass: "hover", activeClass: "active" },
    isTarget: true,
    overlays: [
      [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
    ]
  },
  init = function (connection) {
    connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
  };

  var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
    for (var i = 0; i < sourceAnchors.length; i++) {
      var sourceUUID = toId + sourceAnchors[i];
      instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
        anchor: dynamicAnchors, uuid: sourceUUID
        //anchor: sourceAnchors[i], uuid: sourceUUID
      });
    }
    for (var j = 0; j < targetAnchors.length; j++) {
      var targetUUID = toId + targetAnchors[j];
      instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
    }
  };

  // suspend drawing and initialise.
  instance.batch(function () {
    _addEndpoints("Window4", ["BottomCenter"], ["TopCenter", "LeftMiddle", "RightMiddle"]);
    _addEndpoints("Window2", ["LeftMiddle", "BottomCenter", "RightMiddle"], []);
    _addEndpoints("Window3", ["BottomCenter"], ["TopCenter", "LeftMiddle", "RightMiddle"]);
    _addEndpoints("Window1", ["BottomCenter"], ["TopCenter", "LeftMiddle", "RightMiddle"]);

    var child = jsPlumb.getSelector(".flowchart-demo .window");

    // listen for new connections; initialise them the same way we initialise the connections at startup.
    instance.bind("connection", function (connInfo, originalEvent) {
        init(connInfo.connection);
    });
   
    instance.draggable(child, {
      containment: ".wrapper",
      grid: [20, 20],
      start: function(event, ui) {
        $("#" + event.el.id + "").addClass('noclick');
      }
    });

    $('.wrapper').on('click', '.window', function(event){
      var $this = $(this),
      add = $this.find('.add'),
      target = event.target;

      if(target == add[0]) {
        //console.log('add a new thing and connect to this box');
        AddDiv($this);

      } else {
        if ($this.hasClass('noclick')) {
          $this.removeClass('noclick');
        }
        else {
          // if(!$('body').hasClass('panel')){
            
          // }

          if($this.data('sidebar')=='yes') {
            //this is our card click event which ignores the drag event
            
            $('.window').removeClass('panelShowing');
            openPanel($this);
            $this.addClass('panelShowing');

          }
        }
      }
    })

    //jsPlumb.revalidate("container");

    // connect a few up
    instance.connect({uuids: ["Window2BottomCenter", "Window4TopCenter"], editable: true});
    instance.connect({uuids: ["Window2RightMiddle", "Window3TopCenter"], editable: true});
    instance.connect({uuids: ["Window2LeftMiddle", "Window1TopCenter"], editable: true});
      

    //
    // listen for clicks on connections, and offer to delete connections on click.
    //
    // instance.bind("click", function (conn, originalEvent) {
    //    // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
    //      //   instance.detach(conn);
    //     //conn.toggleType("basic");
    //     alert('sdf')
    // });

    // instance.bind("connectionDrag", function (connection) {
    //     console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
    // });

    // instance.bind("connectionDragStop", function (connection) {
    //     console.log("connection " + connection.id + " was dragged");
    // });

    // instance.bind("connectionMoved", function (params) {
    //     console.log("connection " + params.connection.id + " was moved");
    // });
  });

   // jsPlumb.fire("jsPlumbDemoLoaded", instance);

  // ZOOMING
  jsPlumb.setContainer("Wrapper");
  window.setZoom = function(zoom, instance, transformOrigin, el) {
    transformOrigin = transformOrigin || [ 0.5, 0.5 ];
    instance = instance || jsPlumb;
    el = el || instance.getContainer();
    var p = [ "webkit", "moz", "ms", "o" ],
        s = "scale(" + zoom + ")",
        oString = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";

    for (var i = 0; i < p.length; i++) {
      el.style[p[i] + "Transform"] = s;
      el.style[p[i] + "TransformOrigin"] = oString;
    }

    el.style["transform"] = s;
    el.style["transformOrigin"] = oString;

    instance.setZoom(zoom);    
  };

  var currentZoom = instance.getZoom();
  
  $('.zoomIn').on('click', function(){
    currentZoom = currentZoom * 1.1;
    window.setZoom(currentZoom);
  });

  $('.zoomOut').on('click', function(){
    currentZoom = currentZoom / 1.1;
    window.setZoom(currentZoom);
  });

  ///// END ZOOM ///////



  ///// START ADD NEW BOX ///////

  var count = 4;

  function AddDiv(clicked) {
    count = count + 1;

    var left = clicked.css('left');

    var previosTopOffset = clicked.offset().top + clicked.outerHeight() + 40,
     // parentLeftOffset = clicked.parent().offset().left,
     // previosLeftOffset = clicked.offset().left,
     // leftOffset = previosLeftOffset - parentLeftOffset,
     Div = $('<div>', { id: "flowchartWindow" + count + "", class:"dyno" }).appendTo('#canvas').css({top: previosTopOffset, left: left});

    instance.addEndpoint("flowchartWindow" + count + "", sourceEndpoint, { anchor: dynamicAnchors});

    // instance.addEndpoint("flowchartWindow" + count + "", targetEndpoint, { anchor: "TopCenter"});
    // instance.addEndpoint("flowchartWindow" + count + "", targetEndpoint, { anchor: "LeftMiddle"});
    // instance.addEndpoint("flowchartWindow" + count + "", targetEndpoint, { anchor: "RightMiddle"});
    // instance.addEndpoint("flowchartWindow" + count + "", sourceEndpoint, { anchor: "BottomCenter"});

    instance.draggable($(Div), {
      containment: ".wrapper",
      grid: [20, 20],
      start: function(event, ui) {
        $("#" + event.el.id + "").addClass('noclick');
      }
    });

    //instance.connect({uuids: ["Window2LeftMiddle", "Window1TopCenter"], editable: true});

    instance.connect({
      source:clicked.attr('id'), 
      target:"flowchartWindow" + count + "",
      //endpointStyle:targetEndpoint,
      endpointStyle:{radius:1, fillStyle: "transparent"},
      paintStyle: { lineWidth: 1, strokeStyle: "#00d1c1", joinstyle: "round", outlineColor: "#F5F5F5", outlineWidth: 1 },
      hoverPaintStyle: endpointHoverStyle,
      anchors:["Bottom", "Top"],
      endpoint:"Dot",
      connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]
    });

    $(Div).addClass('window');

    instance.repaintEverything();

    $(Div).append('<span class="add">+</span><form action="#" class="nameMe" id="form"><input type="text" placeholder="Enter Label"><input type="submit"></form>');

    $(".nameMe input[type='text']").focus();

    $('.nameMe').keypress( function( e ) {
      var code = e.keyCode || e.which;

      if( code === 13 ) {
        e.preventDefault();
        var newValue = $(this).find('input').val();
        //$(Div).find('.nameMe').remove().append('<p>' + $(this).find('input').val() + '</p>');

        
        $(Div).find('.nameMe').remove();
        $(Div).append('<p>' + newValue + '</p>');

        return false; 
      }
    }) 
    // init = function (connection) {
    //     connection.getOverlay("label").setLabel();
    // };
  } 

  ///// END ADD NEW BOX ///////

  $( window ).resize(function() {
    instance.repaintEverything();
  });

  function repaint(){
    instance.repaintEverything();
  }

  instance.repaintEverything();


  ///// START PANEL OPEN & CLOSE ///////
  function openPanel(toLoad){
    $('body').addClass('panel');
    $('aside').find('*').not('.close').remove();
    var refreshInterval = setInterval(repaint, 20);

    setTimeout(function(){
      clearInterval(refreshInterval);
    }, 500);

    var image = $(toLoad).data('image'),
    description = $(toLoad).data('description'),
    copy = $(toLoad).text().slice(0, -1);

    $('aside').append("<h3>Flow Step:<span>" + copy + "</span></h3><img src='../images/" + image + "'><p>"+ description +"</p>")
  }

  function closePanel(){
    $('body').removeClass('panel');
    $('.window').removeClass('panelShowing');

    var refreshInterval = setInterval(repaint, 20);

    setTimeout(function(){
      clearInterval(refreshInterval);
    }, 500) 
  }

  ///// END PANEL OPEN & CLOSE ///////

  var isDragging = false;

  $('.close').on('click', function(){
    closePanel();
  });
});