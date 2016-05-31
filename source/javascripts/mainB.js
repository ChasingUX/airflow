jsPlumb.ready(function () {
  var numWindows = 0;

  $('.window').each(function(){
    numWindows = numWindows + 1;

    if($(this).data('sidebar')=='yes') {
      $(this).append("<span class='hasSide'></span><nav class='flowActions'><span class='add'>new</span><span class='image'>img</span></nav>");
    } else {
      $(this).append("<nav class='flowActions'><span class='add'>add</span></nav>");
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


  var connectorPaintStyle = {
    lineWidth: 1,
    strokeStyle: "#00d1c1",
    joinstyle: "round",
    outlineColor: "#F5F5F5",
    outlineWidth: 1
  },
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
  sourceStyle = {
    strokeStyle: "#ff5a5f",
    fillStyle: "white",
    radius: 4,
    lineWidth: 1.2 
  },
  targetStyle = {
    strokeStyle: "transparent",
    fillStyle: "transparent",
    radius: 4,
    lineWidth: 1.2 
  },
  instance = window.instance = jsPlumb.getInstance({
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    PaintStyle: connectorPaintStyle,
    ConnectionOverlays: [
      [ "Arrow", {
        location: 1,
        visible:true,
        width:9,
        length:9,
        foldback:1,
        id:"ARROW",
        paintStyle: {strokeStyle: "#f5f5f5", lineWidth: 3 }
      } ]
    ],
    Container: "canvas"
  }),
  draggableSettings = {
    containment: ".wrapper",
    grid: [20, 20],
    start: function(event, ui) {
      $("#" + event.el.id + "").addClass('noclick');
    }
  },
  makeSourceSettings = {
    filter:"span",
    filterExclude:true,
    anchor:[ "Perimeter", { shape:"Rectangle", anchorCount:16 }],
    endpoint: "Dot",
    paintStyle: sourceStyle,
    isSource: true,
    maxConnections: -1,
    connector: [ "Flowchart", 
      { 
        stub: 11, 
        gap: 10, 
        cornerRadius: 7, 
        alwaysRespectStubs: false 
      } 
    ],
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle
  }
  makeTargetSettings = {
    dropOptions: { hoverClass: "hover" },
    anchor:[ "Perimeter", { shape:"Rectangle", anchorCount:16 }],
    paintStyle: targetStyle,
    endpoint: "Dot",
    maxConnections: -1
  }

  function repaint(){
    instance.repaintEverything();
  }

  var allWindows = jsPlumb.getSelector(".window");   

  instance.draggable(allWindows, draggableSettings);
  instance.toggleDraggable(allWindows);

  function enableDrag() {
    allWindows = jsPlumb.getSelector(".window");   
    instance.setSourceEnabled(allWindows, false);
    instance.toggleDraggable(allWindows);
  }

  function disableDrag (){
    allWindows = jsPlumb.getSelector(".window");   
    instance.setSourceEnabled(allWindows, true);
    instance.toggleDraggable(allWindows);
  }

  instance.batch(function () {
    instance.makeSource(allWindows, makeSourceSettings);
    instance.makeTarget(allWindows, makeTargetSettings);

    // connect a few up
    instance.connect({ source:'flowchartWindow2', target:'flowchartWindow4' });
    instance.connect({ source:'flowchartWindow2', target:'flowchartWindow3' });
    instance.connect({ source:'flowchartWindow2', target:'flowchartWindow1' });


    //add div id we click on add
    $('.wrapper').on('click', '.window', function(event){
      var $this = $(this),
      add = $this.find('.add'),
      target = event.target;

      if(target == add[0]) {
        AddDiv($this);
      } else {
        if($this.data('sidebar')=='yes' && $('body').hasClass('flow')) {
          //this is our card click event which ignores the drag event
          
          $('.window').removeClass('panelShowing');
          openPanel($this);
          $this.addClass('panelShowing');
        }
      }
    });

    $( window ).resize(function() {
      repaint();
    });
  });

  ///// START ADD NEW BOX ///////

  function AddDiv(clicked) {
    numWindows = numWindows + 1;

    var left = clicked.css('left'),
      previosTopOffset = clicked.offset().top + clicked.outerHeight() + 40,
      Div = $('<div>', { id: "flowchartWindow" + numWindows + "", class:"dyno" }).appendTo('#canvas').css({top: previosTopOffset, left: left});

    instance.makeSource("flowchartWindow" + numWindows + "", makeSourceSettings);
    instance.makeTarget("flowchartWindow" + numWindows + "", makeTargetSettings);

    instance.draggable($(Div), draggableSettings);
    instance.toggleDraggable($(Div));
    
    instance.connect({ source: clicked.attr('id'), target:"flowchartWindow" + numWindows + "" });

    $(Div).addClass('window');

    repaint();

    // for now a sidebar data attr is not added, but woudl liek to build this in when I offer image upload, so leaving it here
    if($(this).data('sidebar')=='yes') {
      $(Div).append("<span class='hasSide'></span><nav class='flowActions'><span class='add'>new</span><span class='image'>img</span></nav><form action='#'' class='nameMe' id='form'><input type='text' placeholder='Enter Label'><input type='submit'></form>");
    } else {
      $(Div).append("<nav class='flowActions'><span class='add'>add</span></nav><form action='#'' class='nameMe' id='form'><input type='text' placeholder='Enter Label'><input type='submit'></form>");
    }

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
  } 

  ///// END ADD NEW BOX ///////


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
    copy = $(toLoad).find('p').text();


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


  $('.close').on('click', function(){
    closePanel();
  });

  $(".tools a").on('click', function(){
    var thisType = $(this).attr('id');
    $('body').removeClass('move flow').addClass(thisType);

    $(".dragToggle").toggleClass('on');

    if($('#move').hasClass('on')) {
      enableDrag();
    } else {
      disableDrag();
    }
  });

  $(document).on('keydown', function(e){
    var shifted = e.shiftKey;
    if(shifted == true) {
      $('body').removeClass('flow').addClass("move");
      $(".dragToggle").toggleClass('on');
      enableDrag();
    } 
  });

  $(document).on('keyup', function(e){
    if(e.keyCode == 16) {
      $('body').removeClass('move').addClass("flow");
      $(".dragToggle").toggleClass('on');
      disableDrag();
    } 
  });
}); 