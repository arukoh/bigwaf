//= require modernizr.custom
$(function() {
  const MAX_IMAGE_SIZE = 256;
  const PREVIEW_SIZE = 128;

  var imgWidth = MAX_IMAGE_SIZE;
  var imgHeight = MAX_IMAGE_SIZE;
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
    if (files && typeof FileReader !== "undefined") {
      for(var i=0; i<files.length; i++) {
        readFile(files[i]);
      }
    } else { }
  }

  var readFile = function(file) {
    if ( (/image/i).test(file.type) ) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var image = $('<img/>').load(function() {
          var newimageurl = getCanvasImage(this);
          createPreview(file, newimageurl);
        })
        .attr('src', e.target.result);
        image = null;
      }
      reader.readAsDataURL(file);

      $('#err').text('');
    } else {
      $('#err').text('*Selected file format not supported!');
    }
  }

  var getCanvasImage = function(image) {
    var croping = $('input[name=croping]:checked').val();
    var imageSize = $('input[name=image-size]').val();

    var diff = [0, 0];
    if (croping != 'none') {
      var sizeArray = [image.width, image.height, parseInt(imageSize)].filter(Boolean);
      imgWidth = imgHeight = Math.min.apply(null, sizeArray);
      diff = compareWidthHeight(image.width, image.height);
    } else {
      var maxSize = Math.max.apply(null, [image.width, image.height]);
      maxSize = (imageSize) ? Math.min.apply(null, [imageSize, maxSize]) : maxSize;
      if (image.width > image.height) {
        imgWidth = maxSize;
        imgHeight = Math.round(maxSize * image.height / image.width);
      } else {
        imgWidth = Math.round(maxSize * image.width / image.height);
        imgHeight = maxSize;
      }
    }

    var canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, diff[0]/2, diff[1]/2, image.width-diff[0], image.height-diff[1], 0, 0, imgWidth, imgHeight);
    return canvas.toDataURL("image/png");
  }

  var createPreview = function(file, url) {
    var undefined;
    var imageObj = {};
    imageObj.id = '';
    imageObj.filePath = url;
    imageObj.fileName = file.name.substr(0, file.name.lastIndexOf('.'));
    imageObj.width = imgWidth;
    imageObj.height = imgHeight;
    imageObj.realWidth = imgWidth;
    imageObj.realHeight = imgHeight;
    imageObj.effect = $('input[name=effect]:checked').val();
    imageObj.croping = $('input[name=croping]:checked').val();

    var img = $("#image-template").tmpl(imageObj)
    var wrapSVG = $('figure .wrap-svg', img);
    var blob = new Blob([wrapSVG.html()], {'type':'image/svg+xml'});
    var domURL = self.URL || self.webkitURL || self;
    var url = domURL.createObjectURL(blob);

    imageObj.id = Math.random().toString(36).slice(-8);
    imageObj.width = Math.round(PREVIEW_SIZE * imgWidth / Math.max.apply(null, [imgWidth, imgHeight]));
    imageObj.height = Math.round(PREVIEW_SIZE * imgHeight / Math.max.apply(null, [imgWidth, imgHeight]));
    var randvalue = Math.floor(Math.random()*31)-15;
    img = $("#image-template").tmpl(imageObj).prependTo("#result")
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
    $('figure a', img).attr('href', url);
//    domURL.revokeObjectURL(url);
  }

  if (typeof FileReader === "undefined") {
    $('#err').html('Hey! Your browser does not support <strong>HTML5 File API</strong> <br/>Try using Chrome or Firefox to have it works!');
  } else if (!Modernizr.draganddrop) {
    $('#err').html('Ops! Look like your browser does not support <strong>Drag and Drop API</strong>! <br/>Still, you are able to use \'<em>Select Files</em>\' button to upload file =)');
  } else {
    $('#err').text('');
  }
});
