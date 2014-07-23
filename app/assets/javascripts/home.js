//= require modernizr.custom
$(function() {
//  const DOMURL = self.URL || self.webkitURL || self;
  const PREVIEW_SIZE = 128;
  var previews = {};
  var zindex = 0;

  var noneCroping = $('input[name=croping][value=none]');
  noneCroping.attr("checked", true);
  noneCroping.parent().attr("class", "btn btn-default active");

  var noneEffect = $('input[name=effect][value=none]');
  noneEffect.attr("checked", true);
  noneEffect.parent().attr("class", "btn btn-default active");

  var selectBtn = $('#select');
  selectBtn.on('change', function() {
    var files = $(this)[0].files;
    processFiles(files);
    return false;
  });

  var dropzone = $('#droparea');
  dropzone.on('dragover', function() {
    dropzone.addClass('hover');
    return false;
  });
  dropzone.on('dragleave', function() {
    dropzone.removeClass('hover');
    return false;
  });
  dropzone.on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    dropzone.removeClass('hover');

    var files = e.originalEvent.dataTransfer.files;
    processFiles(files);
    return false;
  });
  dropzone.on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    selectBtn.click();
  });

  function compareWidthHeight(width, height) {
    var diff = [0, 0];
    if (width > height) {
      diff[0] = width - height;
    } else {
      diff[1] = height - width;
    }
    return diff;
  }

  var processFiles = function(files) {
    if (!files || typeof FileReader === "undefined") {
      return;
    }
    var effect = $('input[name=effect]:checked').val();
    var croping = $('input[name=croping]:checked').val();
    var imageSize = $('input[name=image-size]').val();

    for(var i=0; i<files.length; i++) {
      var file = files[i];
      if (file.type.match(/image.*/)) {
        var id = Math.random().toString(36).slice(-8);
        previews[id] = {
          id:      id,
          file:    file,
          name:    file.name.substr(0, file.name.lastIndexOf('.')),
          effect:  effect,
          croping: croping,
          size:    imageSize,
        }
        createPreview(previews[id]);
        $('#err').text('');
      } else {
        $('#err').text('*Selected file format not supported!');
      }
    }
  }

  var createPreview = function(preview) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var image = new Image();
      image.onload = function() {
        var dimm     = calcDimension(this.width, this.height, PREVIEW_SIZE, preview.croping != 'none');
        var realDimm = calcDimension(this.width, this.height, preview.size, preview.croping != 'none');
        var canvas = document.createElement('canvas');
        drawImage(canvas, this, dimm);

        preview.image      = this;
        preview.url        = canvas.toDataURL("image/png");
        preview.dimm       = dimm;
        preview.realDimm   = realDimm;
        preview.width      = dimm.dw - dimm.dx;
        preview.height     = dimm.dh - dimm.dy;
        preview.realWidth  = realDimm.dw - realDimm.dx;
        preview.realHeight = realDimm.dh - realDimm.dy;
        showPreview(preview);
        preview.url = null;
      }
      image.src = e.target.result;
    }
    reader.readAsDataURL(preview.file);

    var showPreview = function(preview) {
      var randvalue = Math.floor(Math.random()*31)-15;
      var img = $("#preview-template").tmpl(preview);
      img.find(".wrap-svg").append($("#svg-template").tmpl(preview));
      img.prependTo("#result")
      .hide()
      .css({
        'Transform': 'scale(1) rotate('+randvalue+'deg)',
        'msTransform': 'scale(1) rotate('+randvalue+'deg)',
        'MozTransform': 'scale(1) rotate('+randvalue+'deg)',
        'webkitTransform': 'scale(1) rotate('+randvalue+'deg)',
        'OTransform': 'scale(1) rotate('+randvalue+'deg)',
        'z-index': zindex++,
      })
      .show();

      img.find("#preview-btn").click(function() {
        $("#preview-modal-image").attr("src", "");

        var prev = $.extend(true, {}, preview);
        var canvas = document.createElement('canvas');
        drawImage(canvas, prev.image, prev.realDimm);
        prev.id     = '';
        prev.url    = canvas.toDataURL("image/png");
        prev.width  = prev.realWidth;
        prev.height = prev.realHeight;
        var svg = $("<div>").html($("#svg-template").tmpl(prev)).html();
//        var blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
//        var svgUrl = DOMURL.createObjectURL(blob);
        var svgUrl = 'data:image/svg+xml;base64,' + window.btoa(svg);

        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          canvas.width  = prev.width;
          canvas.height = prev.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          var pngUrl = canvas.toDataURL("image/png");
          $("#preview-modal-image").attr("src", pngUrl);

          var fileName = prev.name+"_"+prev.effect+"_"+prev.croping+"_"+prev.realWidth+"x"+prev.realHeight;
          $("#preview-modal-svg-link").attr("href", svgUrl);
          $("#preview-modal-svg-link").attr("download", fileName + ".svg");
          $("#preview-modal-png-link").attr("href", pngUrl);
          $("#preview-modal-png-link").attr("download", fileName + ".png");
        }
        img.src = svgUrl;
      });
    }
  }

  var calcDimension = function(width, height, limit, croping) {
    var w, h, diff = [0, 0];
    if (croping) {
      diff = compareWidthHeight(width, height);
      w = h = Math.min.apply(null, [width, height, limit].filter(Boolean));
    } else {
      w = h = Math.min.apply(null, [limit, Math.max.apply(null, [width, height])].filter(Boolean));
      if (width > height) {
        h = Math.round(h * height / width);
      } else {
        w = Math.round(w * width / height);
      }
    }
    return {
      sx: diff[0]/2, sy: diff[1]/2, sw: width-diff[0], sh: height-diff[1],
      dx: 0,         dy: 0,         dw: w,             dh: h,
    };
  }

  var drawImage = function(canvas, image, dimm) {
    canvas.width  = dimm.dw - dimm.dx;
    canvas.height = dimm.dh - dimm.dy;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, dimm.sx, dimm.sy, dimm.sw, dimm.sh, dimm.dx, dimm.dy, dimm.dw, dimm.dh);
  }

  if (typeof FileReader === "undefined") {
    $('#err').html('Hey! Your browser does not support <strong>HTML5 File API</strong> <br/>Try using Chrome or Firefox to have it works!');
  } else if (!Modernizr.draganddrop) {
    $('#err').html('Ops! Look like your browser does not support <strong>Drag and Drop API</strong>! <br/>Still, you are able to use \'<em>Select Files</em>\' button to upload file =)');
  } else {
    $('#err').text('');
  }
});
